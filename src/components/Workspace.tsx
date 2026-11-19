// Terminal + live graph + files, shared by exercises and the sandbox.
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { allPaths } from '../git/diff';
import { promptInfo } from '../git/engine';
import { authorLine, formatDate, treeOf } from '../git/repo';
import type { RepoState } from '../git/types';
import type { RepoController } from '../hooks/useRepo';
import { fmt, useI18n } from '../i18n';
import { storage } from '../store/storage';
import { FileEditor } from './FileEditor';
import { FilesPanel } from './FilesPanel';
import { GitGraph } from './GitGraph';
import type { GraphInput } from './graphLayout';
import { GuideEntryView, type GuideRef } from './GuideViews';
import { Markdown } from './Markdown';
import { Modal } from './Modal';
import { RebaseModal } from './RebaseModal';
import { Terminal, type TerminalHandle } from './Terminal';

interface Props {
  repo: RepoController;
  side?: ReactNode;
  toolbar?: ReactNode;
  terminalRef?: RefObject<TerminalHandle | null>;
}

function OperationBanner({ repo }: { repo: RepoState }) {
  const { t } = useI18n();
  const b = t.ui.workspace.banner;
  const op = repo.operation;
  const conflicts = Object.keys(repo.conflicts);
  if (!op && !conflicts.length && repo.head.type !== 'detached') return null;
  let title = '';
  if (op?.type === 'rebase') {
    title = fmt(b.rebase, { step: op.stoppedForEdit ? op.done : Math.min(op.done + 1, op.total), total: op.total });
  } else if (op) title = b[op.type];
  else if (repo.head.type === 'detached') title = fmt(b.detached, { id: repo.head.id });
  return (
    <div className={`op-banner${conflicts.length ? ' conflict' : ''}`}>
      {title && <strong>{title}</strong>}
      {conflicts.length > 0 && <span>⚠ {fmt(b.conflicts, { files: conflicts.join(', ') })}</span>}
      {op && !conflicts.length && <span>✓ {b.resolved}</span>}
    </div>
  );
}

function CommitDetails({ repo, id, onClose }: { repo: RepoState; id: string; onClose: () => void }) {
  const { t } = useI18n();
  const c = repo.commits[id];
  if (!c) return null;
  const ci = t.ui.workspace.commitInfo;
  const parent = treeOf(repo, c.parents[0]);
  const changed = allPaths(parent, c.tree).filter((p) => parent[p] !== c.tree[p]);
  return (
    <div className="commit-details">
      <button type="button" className="icon-btn" onClick={onClose} aria-label={t.ui.common.close}>
        ✕
      </button>
      <div className="mono c-yellow">
        {c.id}
        {c.parents.length > 1 && <span className="badge">{ci.merge}</span>}
      </div>
      <div className="cd-msg">{c.message}</div>
      <div className="small muted">
        {ci.author}: {authorLine(c.author)} · {formatDate(c.time)}
      </div>
      <div className="small muted">
        {ci.parents}: <span className="mono">{c.parents.join(', ') || ci.none}</span>
      </div>
      <div className="small">
        {ci.files}:{' '}
        {changed.length ? (
          changed.map((p) => (
            <span key={p} className="mono cd-file">
              <span className={parent[p] === undefined ? 'c-green' : c.tree[p] === undefined ? 'c-red' : 'c-yellow'}>
                {parent[p] === undefined ? 'A' : c.tree[p] === undefined ? 'D' : 'M'}
              </span>{' '}
              {p}
            </span>
          ))
        ) : (
          <span className="muted">{ci.none}</span>
        )}
      </div>
    </div>
  );
}

function GuideModal({ id, onClose, onPaste }: { id: string; onClose: () => void; onPaste: (code: string) => void }) {
  const { t } = useI18n();
  const known = t.guide.commands.some((c) => c.id === id);
  const [entry, setEntry] = useState<GuideRef>({ kind: 'cmd', id: known ? id : 'commit' });
  return (
    <Modal title={t.ui.nav.guide} onClose={onClose} wide>
      <GuideEntryView entry={entry} onOpen={setEntry} codeAction={{ label: t.ui.common.paste, run: onPaste }} />
      <p>
        <a href={`#/guide/${entry.kind}/${entry.id}`} onClick={onClose}>
          {t.ui.guide.openFull} →
        </a>
      </p>
    </Modal>
  );
}

export function Workspace({ repo, side, toolbar, terminalRef }: Props) {
  const { t } = useI18n();
  const w = t.ui.workspace;
  const state = repo.repo;
  const localRef = useRef<TerminalHandle>(null);
  const term = terminalRef ?? localRef;
  const [showUnreachable, setShowUnreachable] = useState(() => storage.get<boolean>('unreachable') ?? false);
  const [showRemote, setShowRemote] = useState(() => storage.get<boolean>('remote') ?? true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (selected && !state.commits[selected]) setSelected(null);
  }, [state, selected]);

  const localInput = useMemo<GraphInput>(
    () => ({
      commits: state.commits,
      branches: state.branches,
      remoteBranches: state.remoteBranches,
      tags: state.tags,
      head: state.initialized ? state.head : null,
      showUnreachable,
    }),
    [state, showUnreachable],
  );
  const remoteName = Object.keys(state.remotes)[0];
  const remote = remoteName ? state.remotes[remoteName] : undefined;
  const remoteInput = useMemo<GraphInput | null>(
    () =>
      remote
        ? { commits: remote.commits, branches: remote.branches, remoteBranches: {}, tags: remote.tags, head: null, showUnreachable: false }
        : null,
    [remote],
  );

  const toggle = (key: string, value: boolean, set: (v: boolean) => void) => {
    storage.set(key, value);
    set(value);
  };

  const hasCommits = Object.keys(state.commits).length > 0;
  const prompt = promptInfo(state);
  const editing = repo.editing;

  return (
    <div className="workspace">
      <aside className="ws-side">
        {side}
        <FilesPanel repo={state} onOpen={(p) => repo.openEditor(p)} />
      </aside>
      <div className="ws-main">
        <section className="panel graph-panel">
          <header className="panel-head">
            <span className="panel-title">🌿 {w.graph}</span>
            <span className="panel-actions">
              <label className="toggle">
                <input type="checkbox" checked={showUnreachable} onChange={(e) => toggle('unreachable', e.target.checked, setShowUnreachable)} />
                {w.showUnreachable}
              </label>
              {remote && (
                <label className="toggle">
                  <input type="checkbox" checked={showRemote} onChange={(e) => toggle('remote', e.target.checked, setShowRemote)} />
                  {w.showRemote}
                </label>
              )}
              {toolbar}
            </span>
          </header>
          <OperationBanner repo={state} />
          <div className="graphs">
            <div className="graph-area">
              {!state.initialized ? (
                <div className="graph-empty">
                  <Markdown inline text={w.notInitialized} onCode={(c) => term.current?.insert(c, true)} />
                </div>
              ) : !hasCommits ? (
                <div className="graph-empty">
                  <Markdown inline text={w.noCommits} />
                </div>
              ) : (
                <GitGraph
                  input={localInput}
                  selected={selected}
                  unreachableLabel={w.unreachable}
                  onCommitClick={(id) => {
                    setSelected(id);
                    term.current?.insert(id);
                  }}
                />
              )}
              {selected && <CommitDetails repo={state} id={selected} onClose={() => setSelected(null)} />}
            </div>
            {remote && remoteInput && showRemote && (
              <div className="graph-area remote">
                <div className="graph-caption">
                  ☁ {w.remoteGraph} <span className="muted mono small">{remote.url}</span>
                </div>
                {Object.keys(remote.commits).length ? (
                  <GitGraph input={remoteInput} unreachableLabel={w.unreachable} compact />
                ) : (
                  <div className="graph-empty small">—</div>
                )}
              </div>
            )}
          </div>
          {hasCommits && <div className="graph-foot muted small">{w.clickCommit}</div>}
        </section>
        <Terminal ref={term} entries={repo.entries} prompt={prompt} repo={state} onRun={repo.exec} onClear={repo.clear} />
      </div>

      {editing !== null && (
        <FileEditor
          key={editing}
          path={editing}
          content={state.workdir[editing] ?? ''}
          exists={editing !== '' && state.workdir[editing] !== undefined}
          onSave={repo.saveFile}
          onDelete={(p) => repo.saveFile(p, null)}
          onClose={() => repo.openEditor(null)}
        />
      )}
      {repo.pendingRebase && (
        <RebaseModal repo={repo.pendingRebase.state} plan={repo.pendingRebase.plan} onConfirm={repo.confirmRebase} onCancel={repo.cancelRebase} />
      )}
      {repo.guide && (
        <GuideModal
          id={repo.guide}
          onClose={() => repo.openGuide(null)}
          onPaste={(code) => {
            repo.openGuide(null);
            term.current?.insert(code, true);
          }}
        />
      )}
    </div>
  );
}

