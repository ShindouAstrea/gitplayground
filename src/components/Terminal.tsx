import { useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { GIT_SUBCOMMANDS } from '../git/engine';
import { SHELL_COMMANDS } from '../git/shell';
import type { OutLine, RepoState } from '../git/types';
import type { TermEntry } from '../hooks/useRepo';
import { fmt, useI18n } from '../i18n';
import { storage } from '../store/storage';
import { Markdown } from './Markdown';

export interface TerminalHandle {
  insert: (text: string, replace?: boolean) => void;
  focus: () => void;
}

interface Props {
  entries: TermEntry[];
  prompt: { ref: string; op: string | null };
  repo: RepoState;
  onRun: (line: string) => void;
  onClear: () => void;
  ref?: Ref<TerminalHandle>;
}

// shared across workspaces so ↑ works after switching exercises
const history: string[] = [];

function commonPrefix(items: string[]): string {
  let prefix = items[0] ?? '';
  for (const item of items) while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix;
}

function completions(input: string, repo: RepoState): string[] {
  const words = input.split(/\s+/);
  const before = words.slice(0, -1).filter(Boolean);
  if (!before.length) return ['git', ...SHELL_COMMANDS];
  if (before[0] === 'git' && before.length === 1) return GIT_SUBCOMMANDS;
  const files = new Set([...Object.keys(repo.workdir), ...Object.keys(repo.index)]);
  return [
    ...Object.keys(repo.branches),
    ...Object.keys(repo.remoteBranches),
    ...Object.keys(repo.tags),
    ...files,
    ...Object.keys(repo.remotes),
    'HEAD',
  ];
}

function OutputLine({ line, onCode, showHints }: { line: OutLine; onCode: (c: string) => void; showHints: boolean }) {
  const { t } = useI18n();
  if (line.kind === 'hint') {
    if (!showHints || !line.hint) return null;
    return (
      <div className="t-hint">
        <span className="t-hint-icon" aria-hidden>
          💡
        </span>
        <Markdown inline text={fmt(t.hints[line.hint], line.params)} onCode={onCode} />
      </div>
    );
  }
  if (line.parts) {
    return (
      <div className={`t-line k-${line.kind}`}>
        {line.parts.map((p, i) => (
          <span key={i} className={p.c ? `c-${p.c}` : undefined}>
            {p.t}
          </span>
        ))}
        {line.parts.every((p) => !p.t) && ' '}
      </div>
    );
  }
  return <div className={`t-line k-${line.kind}`}>{line.text || ' '}</div>;
}

export function PromptLabel({ prompt }: { prompt: { ref: string; op: string | null } }) {
  return (
    <span className="t-prompt">
      <span className="c-green">you@git</span>
      <span className="c-dim">:</span>
      <span className="c-blue">~/project</span>
      {prompt.ref && (
        <span className="c-cyan">
          {' '}
          ({prompt.ref}
          {prompt.op && <span className="c-yellow">|{prompt.op}</span>})
        </span>
      )}
      <span className="c-dim">$</span>
    </span>
  );
}

export function Terminal({ entries, prompt, repo, onRun, onClear, ref }: Props) {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(() => storage.get<boolean>('hints') ?? true);
  const historyIndex = useRef<number>(history.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    insert: (text, replace) => {
      setValue((v) => (replace ? text : v && !v.endsWith(' ') ? `${v} ${text}` : v + text));
      inputRef.current?.focus();
    },
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, suggestions]);

  const toggleHints = () => {
    setShowHints((v) => {
      storage.set('hints', !v);
      return !v;
    });
  };

  const submit = () => {
    const line = value;
    if (line.trim() && history[history.length - 1] !== line.trim()) history.push(line.trim());
    historyIndex.current = history.length;
    setValue('');
    setSuggestions([]);
    onRun(line);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex.current > 0) {
        historyIndex.current--;
        setValue(history[historyIndex.current]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex.current < history.length) {
        historyIndex.current++;
        setValue(history[historyIndex.current] ?? '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const last = value.split(/\s+/).pop() ?? '';
      const matches = [...new Set(completions(value, repo))].filter((c) => c.startsWith(last)).sort();
      if (matches.length === 1) {
        setValue(value.slice(0, value.length - last.length) + matches[0] + ' ');
        setSuggestions([]);
      } else if (matches.length > 1) {
        const prefix = commonPrefix(matches);
        setValue(value.slice(0, value.length - last.length) + prefix);
        setSuggestions(matches.slice(0, 40));
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      setValue('');
    }
  };

  const paste = (code: string) => {
    setValue(code);
    inputRef.current?.focus();
  };

  return (
    <section className="terminal panel">
      <header className="panel-head">
        <span className="panel-title">
          <span className="dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          {t.ui.workspace.terminal}
        </span>
        <span className="panel-actions">
          <button type="button" className={`chip${showHints ? ' on' : ''}`} onClick={toggleHints} title={t.ui.hintTitle}>
            💡 {t.ui.hintTitle}
          </button>
          <button type="button" className="chip" onClick={onClear}>
            clear
          </button>
        </span>
      </header>
      <div className="t-body" ref={bodyRef} onClick={() => !window.getSelection()?.toString() && inputRef.current?.focus()}>
        {entries.map((e) =>
          e.cmd ? (
            <div key={e.id} className="t-cmd">
              <PromptLabel prompt={e.cmd} /> <span>{e.cmd.text}</span>
            </div>
          ) : e.line ? (
            <OutputLine key={e.id} line={e.line} onCode={paste} showHints={showHints} />
          ) : (
            <div key={e.id} className="t-line k-dim">
              #{' '}
              {e.note === 'undo' ? t.ui.workspace.undo : e.note === 'rebase-cancelled' ? t.ui.rebase.cancelled : e.note}
            </div>
          ),
        )}
        {suggestions.length > 0 && <div className="t-line k-dim t-suggest">{suggestions.join('   ')}</div>}
        <div className="t-input-row">
          <PromptLabel prompt={prompt} />
          <input
            ref={inputRef}
            className="t-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t.ui.workspace.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label={t.ui.workspace.terminal}
          />
        </div>
      </div>
    </section>
  );
}
