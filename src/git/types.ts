// Data model of the simulated git repository.
// The whole state is plain JSON so it can be cloned (undo) and persisted.

/** path -> file content */
export type Tree = Record<string, string>;

export interface Commit {
  id: string;
  parents: string[];
  message: string;
  tree: Tree;
  /** Logical clock; strictly increasing, used for ordering and fake dates */
  time: number;
  author: string;
}

export type Head = { type: 'branch'; name: string } | { type: 'detached'; id: string };

export interface Tag {
  target: string;
  /** Present for annotated tags */
  message?: string;
}

export interface RemoteRepo {
  url: string;
  commits: Record<string, Commit>;
  branches: Record<string, string>;
  tags: Record<string, Tag>;
}

export interface StashEntry {
  message: string;
  base: string;
  index: Tree;
  workdir: Tree;
}

/** Versions of a conflicted file (undefined = file absent on that side) */
export interface ConflictInfo {
  base?: string;
  ours?: string;
  theirs?: string;
}

export type RebaseAction = 'pick' | 'reword' | 'edit' | 'squash' | 'fixup' | 'drop';

export interface RebaseStep {
  action: RebaseAction;
  commit: string;
  /** reword: new message. squash/fixup: final message of the melded commit */
  message?: string;
}

export interface Snapshot {
  index: Tree;
  workdir: Tree;
}

export type Operation =
  | {
      type: 'merge';
      theirs: string;
      message: string;
      origHead: string;
      snapshot: Snapshot;
    }
  | {
      type: 'rebase';
      branch: string | null;
      onto: string;
      ontoLabel: string;
      origHead: string;
      todo: RebaseStep[];
      current: RebaseStep | null;
      /** HEAD when the rebase stopped (to detect manual commits) */
      stopHead: string | null;
      stoppedForEdit: boolean;
      done: number;
      total: number;
      interactive: boolean;
      snapshot: Snapshot;
    }
  | {
      type: 'cherry-pick' | 'revert';
      current: string | null;
      todo: string[];
      origHead: string;
      /** revert of a merge commit: parent number given with -m */
      mainline?: number;
      snapshot: Snapshot;
    };

export interface ReflogEntry {
  id: string;
  message: string;
}

export interface RepoState {
  initialized: boolean;
  commits: Record<string, Commit>;
  branches: Record<string, string>;
  tags: Record<string, Tag>;
  head: Head;
  /** Staging area: full snapshot of what the next commit will contain */
  index: Tree;
  workdir: Tree;
  conflicts: Record<string, ConflictInfo>;
  stash: StashEntry[];
  remotes: Record<string, RemoteRepo>;
  /** Remote-tracking branches, e.g. "origin/main" -> id */
  remoteBranches: Record<string, string>;
  /** Local branch -> remote-tracking branch, e.g. "main" -> "origin/main" */
  upstreams: Record<string, string>;
  operation: Operation | null;
  /** HEAD reflog, newest first */
  reflog: ReflogEntry[];
  origHead: string | null;
  prevBranch: string | null;
  config: Record<string, string>;
  clock: number;
}

// ---- command output -------------------------------------------------------

export type LineKind = 'out' | 'err' | 'ok' | 'warn' | 'hint' | 'dim' | 'cmd';

export type Color = 'red' | 'green' | 'yellow' | 'cyan' | 'blue' | 'magenta' | 'dim' | 'bold';

export interface Part {
  t: string;
  c?: Color;
}

/** Keys of translated didactic hints (see i18n `hints` dictionaries) */
export type HintKey =
  | 'notARepo'
  | 'initDone'
  | 'firstCommit'
  | 'nothingStaged'
  | 'nothingToCommit'
  | 'needMessage'
  | 'amendDone'
  | 'conflictMarkersStaged'
  | 'unmergedFiles'
  | 'localChangesBlock'
  | 'untrackedBlock'
  | 'detachedHead'
  | 'leavingCommits'
  | 'switchDetach'
  | 'fastForward'
  | 'mergeCommit'
  | 'mergeConflict'
  | 'mergeConflictResolved'
  | 'alreadyUpToDate'
  | 'mergeAborted'
  | 'rebaseConflict'
  | 'rebaseOursTheirs'
  | 'rebaseDone'
  | 'rebaseAborted'
  | 'rebaseEditStop'
  | 'rebaseNoChanges'
  | 'rebaseDirty'
  | 'interactiveEditor'
  | 'cherryPickConflict'
  | 'cherryPickDone'
  | 'revertDone'
  | 'revertConflict'
  | 'resetSoft'
  | 'resetMixed'
  | 'resetHard'
  | 'branchNotMerged'
  | 'branchCreated'
  | 'pushNoUpstream'
  | 'pushRejectedFetchFirst'
  | 'pushRejectedNonFF'
  | 'pushStale'
  | 'pushForce'
  | 'pullDivergent'
  | 'pullNoTracking'
  | 'fetchDone'
  | 'noRemote'
  | 'stashSaved'
  | 'stashConflict'
  | 'unsupported'
  | 'unknownCommand'
  | 'editorHint'
  | 'opInProgress'
  | 'tagCreated'
  | 'revertMergeNeedsM'
  | 'checkoutSide'
  | 'shellHelp'
  | 'teammatePushed';

export interface OutLine {
  kind: LineKind;
  text?: string;
  parts?: Part[];
  hint?: HintKey;
  params?: Record<string, string | number>;
}

export interface RebasePlan {
  onto: string;
  ontoLabel: string;
  steps: RebaseStep[];
}

export type UiAction =
  | { type: 'clear' }
  | { type: 'edit'; path: string }
  | { type: 'rebase-todo'; plan: RebasePlan }
  | { type: 'guide'; id: string };

export interface ExecResult {
  state: RepoState;
  lines: OutLine[];
  ok: boolean;
  ui?: UiAction;
}
