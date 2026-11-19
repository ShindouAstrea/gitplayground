// Small predicates used by exercise goals.
import { hasConflictMarkers } from '../git/diff';
import { commitsBetween, computeStatus, firstLine, headId, isAncestor, treeOf } from '../git/repo';
import type { RepoState } from '../git/types';

export const tipOf = (s: RepoState, branch: string) => s.branches[branch];

export const onBranch = (s: RepoState, branch: string) => s.head.type === 'branch' && s.head.name === branch;

export const message = (s: RepoState, id: string | null | undefined) => (id && s.commits[id] ? firstLine(s.commits[id].message) : '');

export const headTreeOf = (s: RepoState) => treeOf(s, headId(s));

export const fileAt = (s: RepoState, ref: string | null | undefined, path: string) =>
  ref && s.commits[ref] ? s.commits[ref].tree[path] : undefined;

export const ancestor = (s: RepoState, a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && !!s.commits[a] && !!s.commits[b] && isAncestor(s.commits, a, b);

/** No operation in progress and no conflicts */
export const settled = (s: RepoState) => !s.operation && Object.keys(s.conflicts).length === 0;

/** Nothing staged, modified or untracked */
export function clean(s: RepoState): boolean {
  const st = computeStatus(s);
  return !st.staged.length && !st.unstaged.length && !st.untracked.length && !st.conflicted.length;
}

export function between(s: RepoState, base: string | null | undefined, tip: string | null | undefined): string[] {
  if (!tip || !s.commits[tip]) return [];
  return commitsBetween(s, base && s.commits[base] ? base : null, tip);
}

export const isLinear = (s: RepoState, ids: string[]) => ids.every((id) => s.commits[id].parents.length === 1);

export const noMarkers = (text: string | undefined) => text !== undefined && !hasConflictMarkers(text);

/** First commit (by creation) whose first line matches */
export function findByMessage(s: RepoState, msg: string): string | undefined {
  return Object.values(s.commits)
    .filter((c) => firstLine(c.message) === msg)
    .sort((a, b) => a.time - b.time)[0]?.id;
}

export const remoteTip = (s: RepoState, branch: string) => s.remotes.origin?.branches[branch];
