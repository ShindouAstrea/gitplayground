// Helpers shared by several git commands.
import { allPaths, countChanges } from '../diff';
import {
  aheadBehind,
  ancestors,
  Ctx,
  currentBranch,
  firstLine,
  GitError,
  has,
  headId,
  logRef,
  plural,
  reachableFromRefs,
  REPO_PATH,
  treeOf,
  updateTrees,
  validBranchName,
  computeStatus,
} from '../repo';
import type { RepoState, Tree } from '../types';

function escapeRe(text: string) {
  return text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

/** Expands pathspecs (`.`, `src/`, `*.js`, exact paths) against candidate paths */
export function expandPathspecs(candidates: string[], specs: string[]): string[] {
  const result = new Set<string>();
  for (const spec of specs) {
    const norm = spec.replace(/^\.\//, '').replace(/\/$/, '');
    let matches: string[];
    if (spec === '.' || spec === '*' || spec === ':/' || norm === '') matches = candidates;
    else if (norm.includes('*')) {
      const re = new RegExp('^' + norm.split('*').map(escapeRe).join('[^/]*') + '$');
      matches = candidates.filter((p) => re.test(p) || re.test(p.split('/').pop()!));
    } else matches = candidates.filter((p) => p === norm || p.startsWith(norm + '/'));
    if (!matches.length) throw new GitError(`fatal: pathspec '${spec}' did not match any files`);
    matches.forEach((m) => result.add(m));
  }
  return [...result].sort();
}

export function statSummary(from: Tree, to: Tree): string[] {
  let files = 0;
  let ins = 0;
  let del = 0;
  const modes: string[] = [];
  for (const p of allPaths(from, to)) {
    if (from[p] === to[p]) continue;
    files++;
    const c = countChanges(from[p], to[p]);
    ins += c.ins;
    del += c.del;
    if (from[p] === undefined) modes.push(` create mode 100644 ${p}`);
    if (to[p] === undefined) modes.push(` delete mode 100644 ${p}`);
  }
  if (!files) return [];
  let line = ` ${plural(files, 'file')} changed`;
  if (ins) line += `, ${ins} insertion${ins === 1 ? '' : 's'}(+)`;
  if (del) line += `, ${del} deletion${del === 1 ? '' : 's'}(-)`;
  return [line, ...modes];
}

export function printCommitSummary(ctx: Ctx, id: string, parentTree?: Tree) {
  const s = ctx.s;
  const c = s.commits[id];
  const label = currentBranch(s) ?? 'detached HEAD';
  const root = c.parents.length === 0 ? ' (root-commit)' : '';
  ctx.parts({ t: `[${label}${root} ` }, { t: id, c: 'yellow' }, { t: `] ${firstLine(c.message)}` });
  const lines = statSummary(parentTree ?? treeOf(s, c.parents[0]), c.tree);
  if (lines.length) ctx.print(lines.join('\n'));
}

export function trackingInfo(s: RepoState, branch: string): string[] {
  const up = s.upstreams[branch];
  if (!up) return [];
  const remoteId = s.remoteBranches[up];
  const local = s.branches[branch];
  if (!remoteId) {
    return [
      `Your branch is based on '${up}', but the upstream is gone.`,
      '  (use "git branch --unset-upstream" to fixup)',
    ];
  }
  if (!local) return [];
  const { ahead, behind } = aheadBehind(s, local, remoteId);
  if (!ahead && !behind) return [`Your branch is up to date with '${up}'.`];
  if (ahead && !behind) {
    return [
      `Your branch is ahead of '${up}' by ${plural(ahead, 'commit')}.`,
      '  (use "git push" to publish your local commits)',
    ];
  }
  if (behind && !ahead) {
    return [
      `Your branch is behind '${up}' by ${plural(behind, 'commit')}, and can be fast-forwarded.`,
      '  (use "git pull" to update your local branch)',
    ];
  }
  return [
    `Your branch and '${up}' have diverged,`,
    `and have ${ahead} and ${behind} different commits each, respectively.`,
    '  (use "git pull" if you want to integrate the remote branch with yours)',
  ];
}

export function ensureNoOperation(s: RepoState) {
  const op = s.operation;
  if (op?.type === 'merge') {
    throw new GitError(
      'fatal: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.',
      'opInProgress',
      { op: 'merge' },
    );
  }
  if (op?.type === 'rebase') {
    throw new GitError(
      'fatal: It seems that there is already a rebase-merge directory, and\nI wonder if you are in the middle of another rebase.',
      'opInProgress',
      { op: 'rebase' },
    );
  }
  if (op) {
    throw new GitError(
      `error: ${op.type} is already in progress\nhint: try "git ${op.type} (--continue | --skip | --abort)"`,
      'opInProgress',
      { op: op.type },
    );
  }
  const conflicted = Object.keys(s.conflicts);
  if (conflicted.length) {
    throw new GitError(
      `error: you need to resolve your current index first\n${conflicted.map((p) => `${p}: needs merge`).join('\n')}`,
      'unmergedFiles',
    );
  }
}

export function createBranch(s: RepoState, name: string, start: string, force = false) {
  if (!validBranchName(name)) throw new GitError(`fatal: '${name}' is not a valid branch name`);
  if (has(s.branches, name) && !force) throw new GitError(`fatal: a branch named '${name}' already exists`);
  s.branches[name] = start;
}

/** Commits only reachable from `from` once HEAD leaves it (detached HEAD "lost" commits) */
function orphanedCommits(s: RepoState, from: string): string[] {
  const kept = reachableFromRefs(s);
  return [...ancestors(s.commits, from)]
    .filter((id) => !kept.has(id))
    .sort((a, b) => s.commits[b].time - s.commits[a].time);
}

export type SwitchTarget = { branch: string; isNew?: boolean } | { detach: string; label: string };

/** Switches HEAD to a branch or detached commit, carrying local changes like git */
export function switchTo(ctx: Ctx, target: SwitchTarget, quiet = false) {
  const s = ctx.s;
  const conflicted = Object.keys(s.conflicts);
  if (conflicted.length) {
    throw new GitError(
      `error: you need to resolve your current index first\n${conflicted.map((p) => `${p}: needs merge`).join('\n')}`,
      'unmergedFiles',
    );
  }
  const fromId = headId(s);
  const oldHead = s.head;
  if ('branch' in target && oldHead.type === 'branch' && oldHead.name === target.branch) {
    if (!quiet) {
      ctx.print(`Already on '${target.branch}'`);
      const info = trackingInfo(s, target.branch);
      if (info.length) ctx.print(info.join('\n'));
    }
    return;
  }
  const toId = 'branch' in target ? (s.branches[target.branch] ?? null) : target.detach;
  if (toId || fromId) updateTrees(s, treeOf(s, fromId), treeOf(s, toId), 'checkout');
  if (oldHead.type === 'branch') s.prevBranch = oldHead.name;
  s.head = 'branch' in target ? { type: 'branch', name: target.branch } : { type: 'detached', id: target.detach };
  const fromLabel = oldHead.type === 'branch' ? oldHead.name : (fromId ?? '');
  const toLabel = 'branch' in target ? target.branch : target.label;
  if (toId) logRef(s, toId, `checkout: moving from ${fromLabel} to ${toLabel}`);
  if (quiet) return;

  const st = computeStatus(s);
  const letters = { new: 'A', modified: 'M', deleted: 'D' } as const;
  const carried = new Map<string, string>();
  for (const c of [...st.staged, ...st.unstaged]) carried.set(c.path, letters[c.type]);
  for (const [p, l] of carried) ctx.print(`${l}\t${p}`);

  if (oldHead.type === 'detached' && fromId && fromId !== toId) {
    const lost = orphanedCommits(s, fromId);
    if (lost.length) {
      ctx.print(
        `Warning: you are leaving ${plural(lost.length, 'commit')} behind, not connected to\nany of your branches:\n\n` +
          lost
            .slice(0, 5)
            .map((id) => `  ${id} ${firstLine(s.commits[id].message)}`)
            .join('\n') +
          `\n\nIf you want to keep ${lost.length === 1 ? 'it' : 'them'} by creating a new branch, this may be a good time\nto do so with:\n\n git branch <new-branch-name> ${lost[0]}\n`,
        'warn',
      );
      ctx.hint('leavingCommits', { id: lost[0] });
    }
  }

  if ('detach' in target) {
    const c = s.commits[target.detach];
    if (oldHead.type === 'branch') {
      ctx.print(
        `Note: switching to '${target.label}'.\n\n` +
          `You are in 'detached HEAD' state. You can look around, make experimental\n` +
          `changes and commit them, and you can discard any commits you make in this\n` +
          `state without impacting any branches by switching back to a branch.\n\n` +
          `If you want to create a new branch to retain commits you create, you may\n` +
          `do so (now or later) by using -c with the switch command. Example:\n\n` +
          `  git switch -c <new-branch-name>\n\n` +
          `Or undo this operation with:\n\n  git switch -\n`,
        'dim',
      );
      ctx.hint('detachedHead', { id: c.id });
    } else {
      ctx.print(`Previous HEAD position was ${fromId} ${fromId ? firstLine(s.commits[fromId].message) : ''}`);
    }
    ctx.print(`HEAD is now at ${c.id} ${firstLine(c.message)}`);
    return;
  }
  ctx.print(target.isNew ? `Switched to a new branch '${target.branch}'` : `Switched to branch '${target.branch}'`);
  const info = trackingInfo(s, target.branch);
  if (info.length) ctx.print(info.join('\n'));
}

/** `git switch foo` when only origin/foo exists: create a tracking branch */
export function remoteDwim(s: RepoState, name: string): string | null {
  const matches = Object.keys(s.remoteBranches).filter((rb) => rb.slice(rb.indexOf('/') + 1) === name);
  return matches.length === 1 ? matches[0] : null;
}

export function splitRemoteRef(ref: string): [string, string] {
  const i = ref.indexOf('/');
  return [ref.slice(0, i), ref.slice(i + 1)];
}

export function repoPathNote() {
  return REPO_PATH;
}
