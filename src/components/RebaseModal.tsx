import { useMemo, useState } from 'react';
import { firstLine } from '../git/repo';
import type { RebaseAction, RebasePlan, RebaseStep, RepoState } from '../git/types';
import { fmt, useI18n } from '../i18n';
import { Modal } from './Modal';

interface Props {
  repo: RepoState;
  plan: RebasePlan;
  onConfirm: (steps: RebaseStep[]) => void;
  onCancel: () => void;
}

const ACTIONS: RebaseAction[] = ['pick', 'reword', 'edit', 'squash', 'fixup', 'drop'];

interface MessageSlot {
  /** index of the step that receives the message */
  index: number;
  label: string;
  initial: string;
}

/** Which messages git would ask for: rewords and squash groups */
function messageSlots(steps: RebaseStep[], repo: RepoState, t: ReturnType<typeof useI18n>['t']): MessageSlot[] {
  const slots: MessageSlot[] = [];
  let groupStart = -1;
  let combined = '';
  let hasSquash = false;
  const ids: string[] = [];
  const flush = (lastIndex: number) => {
    if (groupStart >= 0 && hasSquash) {
      slots.push({ index: lastIndex, label: fmt(t.ui.rebase.squashLabel, { ids: ids.join(' + ') }), initial: combined });
    }
  };
  let lastInGroup = -1;
  steps.forEach((st, i) => {
    const msg = repo.commits[st.commit].message;
    if (st.action === 'drop') return;
    if (st.action === 'squash' || st.action === 'fixup') {
      if (groupStart < 0) return;
      if (st.action === 'squash') {
        hasSquash = true;
        combined += `\n\n${msg}`;
      }
      ids.push(st.commit);
      lastInGroup = i;
      return;
    }
    flush(lastInGroup);
    groupStart = i;
    lastInGroup = i;
    hasSquash = false;
    combined = msg;
    ids.length = 0;
    ids.push(st.commit);
    if (st.action === 'reword') slots.push({ index: i, label: fmt(t.ui.rebase.rewordLabel, { id: st.commit }), initial: msg });
  });
  flush(lastInGroup);
  return slots;
}

export function RebaseModal({ repo, plan, onConfirm, onCancel }: Props) {
  const { t } = useI18n();
  const [steps, setSteps] = useState<RebaseStep[]>(plan.steps.map((s) => ({ ...s })));
  const [phase, setPhase] = useState<'todo' | 'messages'>('todo');
  const [messages, setMessages] = useState<Record<number, string>>({});

  const firstReal = steps.find((s) => s.action !== 'drop');
  const invalid = !!firstReal && (firstReal.action === 'squash' || firstReal.action === 'fixup');
  const slots = useMemo(() => messageSlots(steps, repo, t), [steps, repo, t]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };

  const finish = () => {
    onConfirm(
      steps.map((s, i) => {
        const slot = slots.find((sl) => sl.index === i);
        if (!slot) return { action: s.action, commit: s.commit };
        const text = (messages[i] ?? slot.initial).trim();
        return { action: s.action, commit: s.commit, message: text || undefined };
      }),
    );
  };

  const todoText = steps.map((s) => `${s.action} ${s.commit} ${firstLine(repo.commits[s.commit].message)}`).join('\n');

  return (
    <Modal
      title={`${t.ui.rebase.title} — ${fmt(t.ui.rebase.onto, { n: steps.length, onto: plan.ontoLabel })}`}
      onClose={onCancel}
      wide
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onCancel}>
            {t.ui.rebase.abort}
          </button>
          <span className="spacer" />
          {phase === 'todo' && slots.length > 0 ? (
            <button type="button" className="btn primary" disabled={invalid} onClick={() => setPhase('messages')}>
              {t.ui.rebase.next} →
            </button>
          ) : (
            <button type="button" className="btn primary" disabled={invalid} onClick={finish}>
              {t.ui.rebase.start}
            </button>
          )}
        </>
      }
    >
      {phase === 'todo' ? (
        <>
          <p className="muted">{t.ui.rebase.intro}</p>
          <ol className="todo-list">
            {steps.map((s, i) => (
              <li key={s.commit} className={`todo-row a-${s.action}`}>
                <select
                  value={s.action}
                  onChange={(e) => setSteps(steps.map((x, k) => (k === i ? { ...x, action: e.target.value as RebaseAction } : x)))}
                  aria-label={s.commit}
                >
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a} — {t.ui.rebase.actions[a]}
                    </option>
                  ))}
                </select>
                <code className="c-yellow">{s.commit}</code>
                <span className="todo-msg">{firstLine(repo.commits[s.commit].message)}</span>
                <span className="todo-move">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title={t.ui.rebase.moveUp}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => move(i, 1)}
                    disabled={i === steps.length - 1}
                    title={t.ui.rebase.moveDown}
                  >
                    ↓
                  </button>
                </span>
              </li>
            ))}
          </ol>
          {invalid && <div className="callout warn">{t.ui.rebase.firstSquash}</div>}
          <pre className="todo-preview mono">{todoText}</pre>
        </>
      ) : (
        <>
          <p className="muted">{t.ui.rebase.messagesIntro}</p>
          {slots.map((slot) => (
            <label key={slot.index} className="field">
              <span className="small">{slot.label}</span>
              <textarea
                className="editor mono"
                rows={Math.min(8, slot.initial.split('\n').length + 1)}
                value={messages[slot.index] ?? slot.initial}
                onChange={(e) => setMessages({ ...messages, [slot.index]: e.target.value })}
              />
            </label>
          ))}
        </>
      )}
    </Modal>
  );
}
