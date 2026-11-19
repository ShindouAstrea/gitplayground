// Core helpers shared by every command: state creation, revision parsing,
// ancestry, status and safe working-tree updates.
import { allPaths, type TreeMerge } from './diff';
import type {
  Commit,
  HintKey,
  LineKind,
  OutLine,
  Part,
  RepoState,
  Snapshot,
  Tree,
  UiAction,
} from './types';

export const REPO_PATH = '/home/you/project';
export const DEFAULT_BRANCH = 'main';

export class GitError extends Error {
  constructor(
    message: string,
    public hint?: HintKey,
    public params?: Record<string, string | number>,
  ) {
    super(message);
  }
}

/** Mutable execution context for one command */
export class Ctx {
  out: OutLine[] = [];
  ui?: UiAction;
  failed = false;
  constructor(public s: RepoState) {}
  print(text: string, kind: LineKind = 'out') {
    for (const line of text.split('\n')) this.out.push({ kind, text: line });
  }
  parts(...parts: Part[]) {
    this.out.push({ kind: 'out', parts });
  }
  hint(key: HintKey, params?: Record<string, string | number>) {
    this.out.push({ kind: 'hint', hint: key, params });
  }
}

export function createState(initialized = false): RepoState {
  return {
    initialized,
    commits: {},
    branches: {},
    tags: {},
    head: { type: 'branch', name: DEFAULT_BRANCH },
    index: {},
    workdir: {},
    conflicts: {},
    stash: [],
    remotes: {},
    remoteBranches: {},
    upstreams: {},
    operation: null,
    reflog: [],
    origHead: null,
    prevBranch: null,
    config: { 'user.name': 'You', 'user.email': 'you@example.com' },
    clock: 0,
  };
}

export const has = <T extends object>(obj: T, key: string) => Object.hasOwn(obj, key);

export function headId(s: RepoState): string | null {
  return s.head.type === 'branch' ? (s.branches[s.head.name] ?? null) : s.head.id;
}

export function currentBranch(s: RepoState): string | null {
  return s.head.type === 'branch' ? s.head.name : null;
}

export function treeOf(s: RepoState, id: string | null | undefined): Tree {
  return id ? s.commits[id].tree : {};
}

export function headTree(s: RepoState): Tree {
  return treeOf(s, headId(s));
}

export function firstLine(message: string): string {
  return message.split('\n')[0];
}

export function treesEqual(a: Tree, b: Tree): boolean {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => has(b, k) && a[k] === b[k]);
}

function hash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

function idTaken(s: RepoState, id: string): boolean {
  return has(s.commits, id) || Object.values(s.remotes).some((r) => has(r.commits, id));
}

/** Creates a commit object (without moving any ref) and returns its id */
export function createCommit(
  s: RepoState,
  parents: string[],
  message: string,
  tree: Tree,
  author = s.config['user.name'] ?? 'You',
  store: Record<string, Commit> = s.commits,
): string {
  s.clock++;
  let salt = 0;
  let id: string;
  do {
    id = hash(`${parents.join(',')}|${message}|${s.clock}|${JSON.stringify(tree)}|${salt++}`).slice(-7);
  } while (idTaken(s, id) || /^\d+$/.test(id));
  store[id] = { id, parents: [...parents], message, tree: { ...tree }, time: s.clock, author };
  return id;
}

/** Moves HEAD (the current branch, or HEAD itself when detached) and logs it */
export function setHead(s: RepoState, id: string, reflogMessage: string) {
  if (s.head.type === 'branch') s.branches[s.head.name] = id;
  else s.head = { type: 'detached', id };
  logRef(s, id, reflogMessage);
}

export function logRef(s: RepoState, id: string, message: string) {
  s.reflog.unshift({ id, message });
  if (s.reflog.length > 200) s.reflog.length = 200;
}

export function ancestors(commits: Record<string, Commit>, id: string | null): Set<string> {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur) || !commits[cur]) continue;
    seen.add(cur);
    stack.push(...commits[cur].parents);
  }
  return seen;
}

/** true when `a` is an ancestor of (or equal to) `b` */
export function isAncestor(commits: Record<string, Commit>, a: string, b: string): boolean {
  return ancestors(commits, b).has(a);
}

export function mergeBase(commits: Record<string, Commit>, a: string, b: string): string | null {
  const A = ancestors(commits, a);
  let best: string | null = null;
  for (const id of ancestors(commits, b)) {
    if (A.has(id) && (!best || commits[id].time > commits[best].time)) best = id;
  }
  return best;
}

/** Commits reachable from `tip` but not from `exclude`, oldest first */
export function commitsBetween(s: RepoState, exclude: string | null, tip: string): string[] {
  const ex = ancestors(s.commits, exclude);
  return [...ancestors(s.commits, tip)]
    .filter((id) => !ex.has(id))
    .sort((x, y) => s.commits[x].time - s.commits[y].time);
}

export function aheadBehind(s: RepoState, local: string, remote: string) {
  const L = ancestors(s.commits, local);
  const R = ancestors(s.commits, remote);
  let ahead = 0;
  let behind = 0;
  for (const id of L) if (!R.has(id)) ahead++;
  for (const id of R) if (!L.has(id)) behind++;
  return { ahead, behind };
}

function resolveBase(s: RepoState, base: string): string | null {
  if (base === 'HEAD' || base === '@') return headId(s);
  const reflog = /^(?:HEAD)?@\{(\d+)\}$/.exec(base);
  if (reflog) return s.reflog[Number(reflog[1])]?.id ?? null;
  if (base === 'ORIG_HEAD') return s.origHead;
  if (base === 'MERGE_HEAD') return s.operation?.type === 'merge' ? s.operation.theirs : null;
  const name = base.replace(/^refs\/(heads|tags|remotes)\//, '').replace(/^remotes\//, '');
  if (has(s.branches, name)) return s.branches[name];
  if (has(s.tags, name)) return s.tags[name].target;
  if (has(s.remoteBranches, name)) return s.remoteBranches[name];
  if (has(s.remotes, name)) return s.remoteBranches[`${name}/${DEFAULT_BRANCH}`] ?? null;
  if (/^[0-9a-f]{4,40}$/.test(name)) {
    const matches = Object.keys(s.commits).filter((id) => id.startsWith(name.slice(0, 7)));
    if (matches.length === 1) return matches[0];
  }
  return null;
}

/** Resolves revisions like `main`, `HEAD~2`, `a1b2c3d^`, `origin/main`, `HEAD@{1}`, `v1.0` */
export function resolveRev(s: RepoState, rev: string): string | null {
  const m = /^(.*?)((?:[~^]\d*)*)$/.exec(rev.trim());
  if (!m || !m[1]) return null;
  let id = resolveBase(s, m[1]);
  if (!id) return null;
  for (const op of m[2].matchAll(/([~^])(\d*)/g)) {
    const n = op[2] === '' ? 1 : Number(op[2]);
    if (op[1] === '~') {
      for (let k = 0; k < n; k++) {
        id = s.commits[id!]?.parents[0] ?? null;
        if (!id) return null;
      }
    } else if (n > 0) {
      id = s.commits[id!]?.parents[n - 1] ?? null;
      if (!id) return null;
    }
  }
  return id;
}

export function requireRev(s: RepoState, rev: string): string {
  const id = resolveRev(s, rev);
  if (!id) {
    throw new GitError(
      `fatal: ambiguous argument '${rev}': unknown revision or path not in the working tree.\n` +
        `Use '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'`,
    );
  }
  return id;
}

export function requireHead(s: RepoState): string {
  const id = headId(s);
  if (!id) {
    throw new GitError(`fatal: your current branch '${currentBranch(s)}' does not have any commits yet`);
  }
  return id;
}

// ---- status -----------------------------------------------------------------

export type ChangeType = 'new' | 'modified' | 'deleted';
export interface FileChange {
  path: string;
  type: ChangeType;
}
export interface Status {
  staged: FileChange[];
  unstaged: FileChange[];
  untracked: string[];
  conflicted: string[];
}

export function computeStatus(s: RepoState): Status {
  const head = headTree(s);
  const isConflict = (p: string) => has(s.conflicts, p);
  const staged: FileChange[] = [];
  for (const p of allPaths(head, s.index)) {
    if (isConflict(p) || head[p] === s.index[p]) continue;
    staged.push({ path: p, type: head[p] === undefined ? 'new' : s.index[p] === undefined ? 'deleted' : 'modified' });
  }
  const unstaged: FileChange[] = [];
  for (const p of Object.keys(s.index).sort()) {
    if (isConflict(p)) continue;
    if (s.workdir[p] === undefined) unstaged.push({ path: p, type: 'deleted' });
    else if (s.workdir[p] !== s.index[p]) unstaged.push({ path: p, type: 'modified' });
  }
  const untracked = Object.keys(s.workdir)
    .filter((p) => !has(s.index, p) && !isConflict(p))
    .sort();
  return { staged, unstaged, untracked, conflicted: Object.keys(s.conflicts).sort() };
}

/** Staged or unstaged changes in tracked files (untracked files don't count) */
export function hasTrackedChanges(s: RepoState): boolean {
  const st = computeStatus(s);
  return st.staged.length > 0 || st.unstaged.length > 0 || st.conflicted.length > 0;
}

export function snapshot(s: RepoState): Snapshot {
  return { index: { ...s.index }, workdir: { ...s.workdir } };
}

function opVerb(op: string) {
  return op === 'checkout' ? 'switch branches' : op;
}

/**
 * Moves index + working tree from tree `from` to tree `to`, keeping unrelated
 * local changes (like git does) and refusing to overwrite them.
 */
export function updateTrees(s: RepoState, from: Tree, to: Tree, op: string, force = false) {
  const changed = allPaths(from, to).filter((p) => from[p] !== to[p]);
  if (!force) {
    const blocked: string[] = [];
    const untracked: string[] = [];
    for (const p of changed) {
      const idx = s.index[p];
      const wd = s.workdir[p];
      if (from[p] === undefined && idx === undefined) {
        if (wd !== undefined && wd !== to[p]) untracked.push(p);
        continue;
      }
      const clean = idx === from[p] && wd === idx;
      const alreadyThere = idx === to[p] && wd === to[p];
      if (!clean && !alreadyThere) blocked.push(p);
    }
    if (blocked.length) {
      throw new GitError(
        `error: Your local changes to the following files would be overwritten by ${op}:\n` +
          blocked.map((p) => `\t${p}`).join('\n') +
          `\nPlease commit your changes or stash them before you ${opVerb(op)}.\nAborting`,
        'localChangesBlock',
      );
    }
    if (untracked.length) {
      throw new GitError(
        `error: The following untracked working tree files would be overwritten by ${op}:\n` +
          untracked.map((p) => `\t${p}`).join('\n') +
          `\nPlease move or remove them before you ${opVerb(op)}.\nAborting`,
        'untrackedBlock',
      );
    }
  }
  for (const p of changed) {
    if (to[p] === undefined) {
      delete s.index[p];
      delete s.workdir[p];
    } else {
      s.index[p] = to[p];
      s.workdir[p] = to[p];
    }
  }
}

/** Writes a three-way merge result: clean files staged, conflicted ones with markers */
export function applyMergeResult(s: RepoState, ours: Tree, m: TreeMerge, op: string) {
  updateTrees(s, ours, m.tree, op);
  for (const [p, info] of Object.entries(m.conflicts)) {
    if (info.ours === undefined) delete s.index[p];
    else s.index[p] = info.ours;
    s.workdir[p] = m.tree[p] ?? '';
  }
  s.conflicts = m.conflicts;
}

/** Discards tracked changes, resetting index and working tree to `tree` (untracked files survive) */
export function hardReset(s: RepoState, tree: Tree) {
  for (const p of allPaths(s.index, tree, s.conflicts)) {
    if (tree[p] === undefined) {
      delete s.index[p];
      delete s.workdir[p];
    } else {
      s.index[p] = tree[p];
      s.workdir[p] = tree[p];
    }
  }
  s.conflicts = {};
}

// ---- refs & decorations ---------------------------------------------------------

export function validBranchName(name: string): boolean {
  return (
    !!name &&
    !/[\s~^:?*[\\]|\.\.|@\{|\/\/|\/$|^\/|\.lock$|^-|\.$/.test(name) &&
    name !== 'HEAD' &&
    name !== '@'
  );
}

export function reachableFromRefs(s: RepoState): Set<string> {
  const all = new Set<string>();
  const tips = [
    ...Object.values(s.branches),
    ...Object.values(s.tags).map((t) => t.target),
    ...Object.values(s.remoteBranches),
  ];
  for (const tip of tips) for (const id of ancestors(s.commits, tip)) all.add(id);
  return all;
}

export type DecorationKind = 'head' | 'branch' | 'remote' | 'tag';
export interface Decoration {
  text: string;
  kind: DecorationKind;
}

export function decorations(s: RepoState, id: string): Decoration[] {
  const res: Decoration[] = [];
  const cb = currentBranch(s);
  if (s.head.type === 'detached' && s.head.id === id) res.push({ text: 'HEAD', kind: 'head' });
  if (cb && s.branches[cb] === id) res.push({ text: `HEAD -> ${cb}`, kind: 'head' });
  for (const [b, tip] of Object.entries(s.branches)) if (tip === id && b !== cb) res.push({ text: b, kind: 'branch' });
  for (const [b, tip] of Object.entries(s.remoteBranches)) if (tip === id) res.push({ text: b, kind: 'remote' });
  for (const [t, tag] of Object.entries(s.tags)) if (tag.target === id) res.push({ text: `tag: ${t}`, kind: 'tag' });
  return res;
}

export function decorationParts(s: RepoState, id: string): Part[] {
  const decs = decorations(s, id);
  if (!decs.length) return [];
  const color = { head: 'cyan', branch: 'green', remote: 'red', tag: 'yellow' } as const;
  const parts: Part[] = [{ t: ' (', c: 'yellow' }];
  decs.forEach((d, i) => {
    if (i) parts.push({ t: ', ', c: 'yellow' });
    parts.push({ t: d.text, c: color[d.kind] });
  });
  parts.push({ t: ')', c: 'yellow' });
  return parts;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(time: number): string {
  const d = new Date(Date.UTC(2026, 0, 5, 9, 0) + time * 47 * 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00 2026 -0300`;
}

export function authorLine(author: string): string {
  const email = author === 'You' ? 'you@example.com' : `${author.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  return `${author} <${email}>`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
