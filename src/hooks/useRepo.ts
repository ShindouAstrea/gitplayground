// State of one simulated workspace: repository, undo stack, terminal transcript
// and pending UI actions (editor, interactive rebase, guide).
import { useCallback, useState } from 'react';
import { applyRebasePlan, promptInfo, run, simulateTeammatePush, writeFile } from '../git/engine';
import type { ExecResult, OutLine, RebasePlan, RebaseStep, RepoState } from '../git/types';

export interface TermEntry {
  id: number;
  /** Echoed command with the prompt it was typed at */
  cmd?: { text: string; ref: string; op: string | null };
  line?: OutLine;
  /** Plain note in the UI language */
  note?: string;
}

interface WorkspaceState {
  repo: RepoState;
  undo: RepoState[];
  entries: TermEntry[];
  commands: number;
  pendingRebase: { state: RepoState; plan: RebasePlan } | null;
  editing: string | null;
  guide: string | null;
}

let nextId = 1;

function fresh(repo: RepoState): WorkspaceState {
  return { repo, undo: [], entries: [], commands: 0, pendingRebase: null, editing: null, guide: null };
}

function applyResult(ws: WorkspaceState, r: ExecResult, cmd?: TermEntry['cmd']): WorkspaceState {
  let entries = ws.entries;
  if (r.ui?.type === 'clear') entries = [];
  else {
    const added: TermEntry[] = [];
    if (cmd) added.push({ id: nextId++, cmd });
    for (const line of r.lines) added.push({ id: nextId++, line });
    entries = [...entries, ...added].slice(-600);
  }
  const changed = r.state !== ws.repo;
  return {
    ...ws,
    repo: r.state,
    undo: changed ? [...ws.undo, ws.repo].slice(-100) : ws.undo,
    entries,
    commands: cmd ? ws.commands + 1 : ws.commands,
    pendingRebase: r.ui?.type === 'rebase-todo' ? { state: r.state, plan: r.ui.plan } : ws.pendingRebase,
    editing: r.ui?.type === 'edit' ? r.ui.path : ws.editing,
    guide: r.ui?.type === 'guide' ? r.ui.id : ws.guide,
  };
}

export function useRepo(initial: () => RepoState) {
  const [ws, setWs] = useState<WorkspaceState>(() => fresh(initial()));

  const exec = useCallback((line: string) => {
    setWs((prev) => {
      const text = line.trim();
      const prompt = promptInfo(prev.repo);
      if (!text) return { ...prev, entries: [...prev.entries, { id: nextId++, cmd: { text: '', ...prompt } }] };
      return applyResult(prev, run(prev.repo, text), { text, ...prompt });
    });
  }, []);

  const undo = useCallback(() => {
    setWs((prev) => {
      if (!prev.undo.length) return prev;
      return {
        ...prev,
        repo: prev.undo[prev.undo.length - 1],
        undo: prev.undo.slice(0, -1),
        pendingRebase: null,
        entries: [...prev.entries, { id: nextId++, note: 'undo' }],
      };
    });
  }, []);

  const reset = useCallback((repo: RepoState) => setWs(fresh(repo)), []);

  const saveFile = useCallback((path: string, content: string | null) => {
    setWs((prev) => ({
      ...prev,
      repo: writeFile(prev.repo, path, content),
      undo: [...prev.undo, prev.repo].slice(-100),
      editing: null,
      entries: [...prev.entries, { id: nextId++, note: content === null ? `rm ${path}` : `edit ${path}` }],
    }));
  }, []);

  const confirmRebase = useCallback((steps: RebaseStep[]) => {
    setWs((prev) => {
      if (!prev.pendingRebase) return prev;
      const { state, plan } = prev.pendingRebase;
      const r = applyRebasePlan(state, { ...plan, steps });
      return { ...applyResult({ ...prev, pendingRebase: null }, r), undo: [...prev.undo, prev.repo].slice(-100) };
    });
  }, []);

  const cancelRebase = useCallback(() => {
    setWs((prev) => ({ ...prev, pendingRebase: null, entries: [...prev.entries, { id: nextId++, note: 'rebase-cancelled' }] }));
  }, []);

  const teammate = useCallback(() => {
    setWs((prev) => applyResult(prev, simulateTeammatePush(prev.repo)));
  }, []);

  const openEditor = useCallback((path: string | null) => setWs((prev) => ({ ...prev, editing: path })), []);
  const openGuide = useCallback((id: string | null) => setWs((prev) => ({ ...prev, guide: id })), []);
  const clear = useCallback(() => setWs((prev) => ({ ...prev, entries: [] })), []);

  return { ...ws, exec, undo, reset, saveFile, confirmRebase, cancelRebase, teammate, openEditor, openGuide, clear };
}

export type RepoController = ReturnType<typeof useRepo>;
