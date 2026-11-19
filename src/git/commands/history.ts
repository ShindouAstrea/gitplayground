// merge, rebase, cherry-pick, revert, reset
import { parseArgs } from '../args';
import { allPaths, mergeTrees } from '../diff';
import {
  applyMergeResult,
  commitsBetween,
  computeStatus,
  createCommit,
  Ctx,
  currentBranch,
  firstLine,
  GitError,
  has,
  hardReset,
  hasTrackedChanges,
  headId,
  headTree,
  isAncestor,
  logRef,
  mergeBase,
  requireHead,
  requireRev,
  resolveRev,
  setHead,
  snapshot,
  treeOf,
  treesEqual,
  updateTrees,
} from '../repo';
import type { Operation, RebasePlan, RebaseStep, RepoState } from '../types';
import { commit, revertMessage } from './basic';
import { ensureNoOperation, printCommitSummary, statSummary } from './common';

type RebaseOp = Extract<Operation, { type: 'rebase' }>;
type SeqOp = Extract<Operation, { type: 'cherry-pick' | 'revert' }>;

const unresolvedError = () =>
  new GitError(
    "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.",
    'unmergedFiles',
  );

// ---- merge ------------------------------------------------------------------------

function defaultMergeMessage(s: RepoState, label: string): string {
  const cb = currentBranch(s);
  const into = cb && cb !== 'main' && cb !== 'master' ? ` into ${cb}` : '';
  if (has(s.branches, label)) return `Merge branch '${label}'${into}`;
  if (has(s.remoteBranches, label)) return `Merge remote-tracking branch '${label}'${into}`;
  if (has(s.tags, label)) return `Merge tag '${label}'${into}`;
  return `Merge commit '${label}'${into}`;
}

export interface MergeOptions {
  noFF?: boolean;
  ffOnly?: boolean;
  squash?: boolean;
  noCommit?: boolean;
  message?: string;
}

export function doMerge(ctx: Ctx, theirs: string, label: string, opts: MergeOptions = {}) {
  const s = ctx.s;
  const head = requireHead(s);
  if (isAncestor(s.commits, theirs, head)) {
    ctx.print('Already up to date.');
    ctx.hint('alreadyUpToDate', { target: label });
    return;
  }
  const canFF = isAncestor(s.commits, head, theirs);
  if (opts.ffOnly && !canFF) throw new GitError('fatal: Not possible to fast-forward, aborting.');
  if (canFF && !opts.noFF && !opts.squash) {
    updateTrees(s, s.commits[head].tree, s.commits[theirs].tree, 'merge');
    s.origHead = head;
    setHead(s, theirs, `merge ${label}: Fast-forward`);
    ctx.print(`Updating ${head}..${theirs}\nFast-forward`);
    const stat = statSummary(s.commits[head].tree, s.commits[theirs].tree);
    if (stat.length) ctx.print(stat.join('\n'));
    ctx.hint('fastForward', { branch: currentBranch(s) ?? 'HEAD', target: label });
    return;
  }
  const base = mergeBase(s.commits, head, theirs);
  if (!base) throw new GitError('fatal: refusing to merge unrelated histories');
  const ours = s.commits[head].tree;
  const m = mergeTrees(treeOf(s, base), ours, s.commits[theirs].tree, { ours: 'HEAD', theirs: label });
  const snap = snapshot(s);
  applyMergeResult(s, ours, m, 'merge');
  for (const msg of m.messages) ctx.print(msg);
  const conflicted = Object.keys(m.conflicts);
  const message = opts.message ?? defaultMergeMessage(s, label);
  if (opts.squash) {
    ctx.print('Squash commit -- not updating HEAD');
    if (conflicted.length) {
      ctx.print('Automatic merge failed; fix conflicts and then commit the result.');
      ctx.failed = true;
    }
    return;
  }
  s.origHead = head;
  if (conflicted.length) {
    s.operation = { type: 'merge', theirs, message, origHead: head, snapshot: snap };
    ctx.print('Automatic merge failed; fix conflicts and then commit the result.');
    ctx.hint('mergeConflict', { files: conflicted.join(', ') });
    ctx.failed = true;
    return;
  }
  if (opts.noCommit) {
    s.operation = { type: 'merge', theirs, message, origHead: head, snapshot: snap };
    ctx.print('Automatic merge went well; stopped before committing as requested');
    return;
  }
  const id = createCommit(s, [head, theirs], message, s.index);
  setHead(s, id, `merge ${label}: Merge made by the 'ort' strategy.`);
  ctx.print("Merge made by the 'ort' strategy.");
  const stat = statSummary(ours, s.commits[id].tree);
  if (stat.length) ctx.print(stat.join('\n'));
  ctx.hint('mergeCommit', { id, target: label });
}

export function merge(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--no-ff': 'bool',
    '--ff': 'bool',
    '--ff-only': 'bool',
    '--squash': 'bool',
    '--abort': 'bool',
    '--continue': 'bool',
    '-m': 'value',
    '--message': 'value',
    '--no-edit': 'bool',
    '--edit': 'bool',
    '--no-commit': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  if (a.has('--abort')) {
    const op = s.operation;
    if (op?.type !== 'merge') throw new GitError('fatal: There is no merge to abort (MERGE_HEAD missing).');
    s.index = { ...op.snapshot.index };
    s.workdir = { ...op.snapshot.workdir };
    s.conflicts = {};
    s.operation = null;
    ctx.hint('mergeAborted');
    return;
  }
  if (a.has('--continue')) {
    if (s.operation?.type !== 'merge') throw new GitError('fatal: There is no merge in progress (MERGE_HEAD missing).');
    commit(ctx, []);
    return;
  }
  ensureNoOperation(s);
  let target = a.pos[0];
  if (a.pos.length > 1) throw new GitError('error: merging several branches at once (octopus) is not supported in this simulator', 'unsupported', { option: 'octopus' });
  if (!target) {
    const cb = currentBranch(s);
    const up = cb ? s.upstreams[cb] : undefined;
    if (!up) throw new GitError('fatal: No remote for the current branch.');
    target = up;
  }
  const theirs = resolveRev(s, target);
  if (!theirs) throw new GitError(`merge: ${target} - not something we can merge`);
  const msgs = a.values('-m', '--message');
  doMerge(ctx, theirs, target, {
    noFF: a.has('--no-ff'),
    ffOnly: a.has('--ff-only'),
    squash: a.has('--squash'),
    noCommit: a.has('--no-commit'),
    message: msgs.length ? msgs.join('\n\n') : undefined,
  });
}

// ---- rebase -----------------------------------------------------------------------

function rebaseOp(s: RepoState): RebaseOp {
  if (s.operation?.type !== 'rebase') throw new GitError('fatal: No rebase in progress?');
  return s.operation;
}

/** Commits a replayed step. Returns true when the rebase must stop (edit). */
function commitRebaseStep(ctx: Ctx, step: RebaseStep): boolean {
  const s = ctx.s;
  const op = rebaseOp(s);
  const c = s.commits[step.commit];
  const head = headId(s)!;
  if (step.action === 'squash' || step.action === 'fixup') {
    const prev = s.commits[head];
    const message = step.message ?? (step.action === 'squash' ? `${prev.message}\n\n${c.message}` : prev.message);
    const id = createCommit(s, prev.parents, message, s.index, prev.author);
    s.head = { type: 'detached', id };
    logRef(s, id, `rebase (${step.action}): ${firstLine(message)}`);
  } else if (treesEqual(s.index, s.commits[head].tree)) {
    ctx.print(`dropping ${c.id} ${firstLine(c.message)} -- patch contents already upstream`, 'dim');
  } else {
    const message = step.action === 'reword' && step.message ? step.message : c.message;
    const id = createCommit(s, [head], message, s.index, c.author);
    s.head = { type: 'detached', id };
    logRef(s, id, `rebase (${step.action === 'reword' ? 'reword' : 'pick'}): ${firstLine(message)}`);
  }
  op.done++;
  op.current = null;
  if (step.action === 'edit') return stopForEdit(ctx, op);
  return false;
}

function stopForEdit(ctx: Ctx, op: RebaseOp): boolean {
  const s = ctx.s;
  const id = headId(s)!;
  op.stoppedForEdit = true;
  op.stopHead = id;
  ctx.print(
    `Stopped at ${id}...  ${firstLine(s.commits[id].message)}\nYou can amend the commit now, with\n\n  git commit --amend \n\nOnce you are satisfied with your changes, run\n\n  git rebase --continue`,
  );
  ctx.hint('rebaseEditStop');
  return true;
}

function runRebase(ctx: Ctx) {
  const s = ctx.s;
  const op = rebaseOp(s);
  while (op.todo.length) {
    const step = op.todo.shift()!;
    if (step.action === 'drop') continue;
    const c = s.commits[step.commit];
    const head = headId(s)!;
    // Unchanged pick on top of its own parent: git just fast-forwards (same commit id)
    if ((step.action === 'pick' || step.action === 'edit') && c.parents[0] === head) {
      updateTrees(s, s.commits[head].tree, c.tree, 'checkout', true);
      s.head = { type: 'detached', id: c.id };
      logRef(s, c.id, `rebase (pick): ${firstLine(c.message)}`);
      op.done++;
      if (step.action === 'edit' && stopForEdit(ctx, op)) return;
      continue;
    }
    const ours = s.commits[head].tree;
    const m = mergeTrees(treeOf(s, c.parents[0]), ours, c.tree, {
      ours: 'HEAD',
      theirs: `${c.id} (${firstLine(c.message)})`,
    });
    applyMergeResult(s, ours, m, 'rebase');
    for (const msg of m.messages) ctx.print(msg);
    const conflicted = Object.keys(m.conflicts);
    if (conflicted.length) {
      op.current = step;
      op.stopHead = head;
      ctx.print(`error: could not apply ${c.id}... ${firstLine(c.message)}`, 'err');
      ctx.print(
        'hint: Resolve all conflicts manually, mark them as resolved with\n' +
          'hint: "git add/rm <conflicted_files>", then run "git rebase --continue".\n' +
          'hint: You can instead skip this commit: run "git rebase --skip".\n' +
          'hint: To abort and get back to the state before "git rebase", run "git rebase --abort".',
        'dim',
      );
      ctx.print(`Could not apply ${c.id}... ${firstLine(c.message)}`);
      ctx.hint('rebaseConflict', { files: conflicted.join(', '), commit: c.id });
      ctx.hint('rebaseOursTheirs', { onto: op.ontoLabel, commit: c.id });
      ctx.failed = true;
      return;
    }
    op.current = step;
    if (commitRebaseStep(ctx, step)) return;
  }
  const head = headId(s)!;
  if (op.branch) {
    s.branches[op.branch] = head;
    s.head = { type: 'branch', name: op.branch };
    logRef(s, head, `rebase (finish): returning to refs/heads/${op.branch}`);
  }
  s.operation = null;
  ctx.print(`Successfully rebased and updated ${op.branch ? `refs/heads/${op.branch}` : 'detached HEAD'}.`, 'ok');
  ctx.hint('rebaseDone', { branch: op.branch ?? 'HEAD', onto: op.ontoLabel });
}

export function startRebase(ctx: Ctx, plan: RebasePlan, interactive: boolean) {
  const s = ctx.s;
  const head = requireHead(s);
  const firstReal = plan.steps.find((st) => st.action !== 'drop');
  if (firstReal && (firstReal.action === 'squash' || firstReal.action === 'fixup')) {
    throw new GitError(`error: cannot '${firstReal.action}' without a previous commit`);
  }
  s.origHead = head;
  s.operation = {
    type: 'rebase',
    branch: currentBranch(s),
    onto: plan.onto,
    ontoLabel: plan.ontoLabel,
    origHead: head,
    todo: plan.steps.map((st) => ({ ...st })),
    current: null,
    stopHead: null,
    stoppedForEdit: false,
    done: 0,
    total: plan.steps.filter((st) => st.action !== 'drop').length,
    interactive,
    snapshot: snapshot(s),
  };
  updateTrees(s, s.commits[head].tree, s.commits[plan.onto].tree, 'checkout');
  s.head = { type: 'detached', id: plan.onto };
  logRef(s, plan.onto, `rebase (start): checkout ${plan.ontoLabel}`);
  runRebase(ctx);
}

/** Commits that `git rebase <upstream>` would replay (merges are dropped like git does) */
export function rebaseCommits(s: RepoState, upstream: string, head: string): string[] {
  return commitsBetween(s, upstream, head).filter((id) => s.commits[id].parents.length < 2);
}

export function rebase(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-i': 'bool',
    '--interactive': 'bool',
    '--onto': 'value',
    '--continue': 'bool',
    '--abort': 'bool',
    '--skip': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  if (a.has('--abort')) {
    const op = rebaseOp(s);
    if (op.branch) {
      s.branches[op.branch] = op.origHead;
      s.head = { type: 'branch', name: op.branch };
    } else s.head = { type: 'detached', id: op.origHead };
    s.index = { ...op.snapshot.index };
    s.workdir = { ...op.snapshot.workdir };
    s.conflicts = {};
    s.operation = null;
    logRef(s, op.origHead, `rebase (abort): returning to ${op.branch ? 'refs/heads/' + op.branch : op.origHead}`);
    ctx.hint('rebaseAborted', { branch: op.branch ?? op.origHead });
    return;
  }
  if (a.has('--skip')) {
    const op = rebaseOp(s);
    hardReset(s, headTree(s));
    op.current = null;
    op.stoppedForEdit = false;
    runRebase(ctx);
    return;
  }
  if (a.has('--continue')) {
    const op = rebaseOp(s);
    if (Object.keys(s.conflicts).length) {
      throw new GitError(
        `error: you must edit all merge conflicts and then\nmark them as resolved using git add\n` +
          Object.keys(s.conflicts)
            .map((p) => `${p}: needs merge`)
            .join('\n'),
        'unmergedFiles',
      );
    }
    const head = headId(s)!;
    if (op.stoppedForEdit) {
      if (!treesEqual(s.index, s.commits[head].tree)) {
        throw new GitError(
          'error: you have staged changes in your working tree\nIf these changes are meant to be squashed into the previous commit, run:\n\n  git commit --amend\n\nIf they are meant to go into a new commit, run:\n\n  git commit\n\nIn both cases, once you\'re done, continue with:\n\n  git rebase --continue',
        );
      }
      op.stoppedForEdit = false;
      op.current = null;
    } else if (op.current) {
      const step = op.current;
      if (head !== op.stopHead) {
        op.done++;
        op.current = null;
      } else if (step.action !== 'squash' && step.action !== 'fixup' && treesEqual(s.index, s.commits[head].tree)) {
        throw new GitError(
          "No changes - did you forget to use 'git add'?\nIf there is nothing left to stage, chances are that something else\nalready introduced the same changes; you might want to skip this patch.",
          'rebaseNoChanges',
        );
      } else {
        const id = headId(s);
        if (commitRebaseStep(ctx, step)) return;
        const now = headId(s)!;
        if (now !== id) ctx.parts({ t: '[detached HEAD ' }, { t: now, c: 'yellow' }, { t: `] ${firstLine(s.commits[now].message)}` });
      }
    }
    runRebase(ctx);
    return;
  }

  ensureNoOperation(s);
  if (a.pos.length > 1) {
    const branchName = a.pos[1];
    if (!has(s.branches, branchName)) throw new GitError(`fatal: invalid branch name: ${branchName}`);
    const from = treeOf(s, headId(s));
    updateTrees(s, from, treeOf(s, s.branches[branchName]), 'checkout');
    if (s.head.type === 'branch') s.prevBranch = s.head.name;
    s.head = { type: 'branch', name: branchName };
  }
  const head = requireHead(s);
  let upstreamArg: string | undefined = a.pos[0];
  if (!upstreamArg) {
    const cb = currentBranch(s);
    upstreamArg = cb ? s.upstreams[cb] : undefined;
    if (!upstreamArg) {
      throw new GitError(
        'There is no tracking information for the current branch.\nPlease specify which branch you want to rebase against.\n\n    git rebase <branch>\n',
      );
    }
  }
  const upstream = resolveRev(s, upstreamArg);
  if (!upstream) throw new GitError(`fatal: invalid upstream '${upstreamArg}'`);
  const ontoArg = a.value('--onto');
  const onto = ontoArg ? requireRev(s, ontoArg) : upstream;
  const ontoLabel = ontoArg ?? upstreamArg;
  if (hasTrackedChanges(s)) {
    const st = computeStatus(s);
    throw new GitError(
      st.staged.length
        ? 'error: cannot rebase: Your index contains uncommitted changes.\nerror: Please commit or stash them.'
        : 'error: cannot rebase: You have unstaged changes.\nerror: Please commit or stash them.',
      'rebaseDirty',
    );
  }
  const commits = rebaseCommits(s, upstream, head);
  if (a.has('-i', '--interactive')) {
    if (!commits.length) {
      ctx.print('Successfully rebased and updated ' + (currentBranch(s) ? `refs/heads/${currentBranch(s)}` : 'detached HEAD') + '.');
      return;
    }
    ctx.print('hint: Waiting for your editor to close the file...', 'dim');
    ctx.ui = {
      type: 'rebase-todo',
      plan: { onto, ontoLabel, steps: commits.map((id) => ({ action: 'pick', commit: id })) },
    };
    ctx.hint('interactiveEditor');
    return;
  }
  const alreadyOn = isAncestor(s.commits, onto, head) && rebaseCommits(s, onto, head).join() === commits.join();
  if (alreadyOn) {
    ctx.print(`Current branch ${currentBranch(s) ?? 'HEAD'} is up to date.`);
    return;
  }
  startRebase(ctx, { onto, ontoLabel, steps: commits.map((id) => ({ action: 'pick', commit: id })) }, false);
}

// ---- cherry-pick / revert -------------------------------------------------------------

function seqOp(s: RepoState, type: 'cherry-pick' | 'revert'): SeqOp {
  const op = s.operation;
  if (op?.type !== type) throw new GitError(`error: no ${type} in progress`);
  return op;
}

function runSequencer(ctx: Ctx) {
  const s = ctx.s;
  const op = s.operation as SeqOp;
  const isRevert = op.type === 'revert';
  while (op.todo.length) {
    const id = op.todo.shift()!;
    const c = s.commits[id];
    const head = requireHead(s);
    op.current = id;
    if (c.parents.length > 1 && !op.mainline) {
      throw new GitError(
        `error: commit ${id} is a merge but no -m option was given.\nfatal: ${op.type} failed`,
        isRevert ? 'revertMergeNeedsM' : 'unsupported',
        { option: '-m' },
      );
    }
    const parentTree = treeOf(s, c.parents[(op.mainline ?? 1) - 1]);
    const base = isRevert ? c.tree : parentTree;
    const theirs = isRevert ? parentTree : c.tree;
    const ours = s.commits[head].tree;
    const label = isRevert ? `parent of ${id} (${firstLine(c.message)})` : `${id} (${firstLine(c.message)})`;
    const m = mergeTrees(base, ours, theirs, { ours: 'HEAD', theirs: label });
    applyMergeResult(s, ours, m, 'merge');
    for (const msg of m.messages) ctx.print(msg);
    const conflicted = Object.keys(m.conflicts);
    if (conflicted.length) {
      ctx.print(`error: could not ${isRevert ? 'revert' : 'apply'} ${id}... ${firstLine(c.message)}`, 'err');
      ctx.print(
        'hint: After resolving the conflicts, mark them with\nhint: "git add/rm <pathspec>", then run\n' +
          `hint: "git ${op.type} --continue".\nhint: You can instead skip this commit with "git ${op.type} --skip".\n` +
          `hint: To abort and get back to the state before "git ${op.type}",\nhint: run "git ${op.type} --abort".`,
        'dim',
      );
      ctx.hint(isRevert ? 'revertConflict' : 'cherryPickConflict', { files: conflicted.join(', '), commit: id });
      ctx.failed = true;
      return;
    }
    if (treesEqual(s.index, ours)) {
      ctx.print(
        `The previous ${op.type} is now empty, possibly due to conflict resolution.\nIf you wish to commit it anyway, use:\n\n    git commit --allow-empty\n\nOtherwise, please use 'git ${op.type} --skip'`,
      );
      ctx.failed = true;
      return;
    }
    const message = isRevert ? revertMessage(s, id) : c.message;
    const newId = createCommit(s, [head], message, s.index, isRevert ? undefined : c.author);
    setHead(s, newId, `${op.type}: ${firstLine(message)}`);
    printCommitSummary(ctx, newId);
    op.current = null;
  }
  s.operation = null;
  ctx.hint(isRevert ? 'revertDone' : 'cherryPickDone');
}

function sequencer(ctx: Ctx, argv: string[], type: 'cherry-pick' | 'revert') {
  const a = parseArgs(argv, {
    '--continue': 'bool',
    '--abort': 'bool',
    '--skip': 'bool',
    '--no-edit': 'bool',
    '--edit': 'bool',
    '-e': 'bool',
    '-x': 'bool',
    '-m': 'value',
    '--mainline': 'value',
  });
  const s = ctx.s;
  if (a.has('--abort')) {
    const op = seqOp(s, type);
    if (s.head.type === 'branch') s.branches[s.head.name] = op.origHead;
    else s.head = { type: 'detached', id: op.origHead };
    s.index = { ...op.snapshot.index };
    s.workdir = { ...op.snapshot.workdir };
    s.conflicts = {};
    s.operation = null;
    logRef(s, op.origHead, `${type}: abort`);
    return;
  }
  if (a.has('--skip')) {
    const op = seqOp(s, type);
    hardReset(s, headTree(s));
    op.current = null;
    runSequencer(ctx);
    return;
  }
  if (a.has('--continue')) {
    const op = seqOp(s, type);
    if (Object.keys(s.conflicts).length) throw unresolvedError();
    if (op.current) {
      const head = requireHead(s);
      if (treesEqual(s.index, s.commits[head].tree)) {
        throw new GitError(
          `The previous ${type} is now empty, possibly due to conflict resolution.\nIf you wish to commit it anyway, use:\n\n    git commit --allow-empty\n\nOtherwise, please use 'git ${type} --skip'`,
        );
      }
      const message = type === 'revert' ? revertMessage(s, op.current) : s.commits[op.current].message;
      const id = createCommit(s, [head], message, s.index, type === 'revert' ? undefined : s.commits[op.current].author);
      setHead(s, id, `${type}: ${firstLine(message)}`);
      printCommitSummary(ctx, id);
      op.current = null;
    }
    runSequencer(ctx);
    return;
  }
  ensureNoOperation(s);
  const head = requireHead(s);
  if (!a.pos.length) throw new GitError(`usage: git ${type} [<options>] <commit-ish>...`);
  const ids: string[] = [];
  for (const p of a.pos) {
    if (p.includes('..')) {
      const [x, y] = p.split('..');
      const range = commitsBetween(s, requireRev(s, x || 'HEAD'), requireRev(s, y || 'HEAD'));
      ids.push(...(type === 'revert' ? range.reverse() : range));
    } else {
      const id = resolveRev(s, p);
      if (!id) throw new GitError(`fatal: bad revision '${p}'`);
      ids.push(id);
    }
  }
  if (!ids.length) throw new GitError('error: empty commit set passed');
  const mainline = a.value('-m', '--mainline');
  s.operation = {
    type,
    current: null,
    todo: ids,
    origHead: head,
    mainline: mainline ? Number(mainline) : undefined,
    snapshot: snapshot(s),
  };
  runSequencer(ctx);
}

export function cherryPick(ctx: Ctx, argv: string[]) {
  sequencer(ctx, argv, 'cherry-pick');
}

export function revert(ctx: Ctx, argv: string[]) {
  sequencer(ctx, argv, 'revert');
}

// ---- reset ----------------------------------------------------------------------------

export function reset(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '--soft': 'bool', '--mixed': 'bool', '--hard': 'bool', '-q': 'bool', '--quiet': 'bool' });
  const s = ctx.s;
  const isPath = (p: string) => has(s.workdir, p) || has(s.index, p) || has(headTree(s), p) || has(s.conflicts, p);

  let revArg: string | undefined;
  let paths: string[] | null = a.paths;
  if (paths === null) {
    const [first, ...rest] = a.pos;
    if (first !== undefined && resolveRev(s, first) && !(isPath(first) && !rest.length && !/[~^@]/.test(first))) {
      revArg = first;
      if (rest.length) paths = rest;
    } else if (a.pos.length) paths = a.pos;
  } else revArg = a.pos[0];

  if (paths) {
    if (a.has('--soft', '--hard')) throw new GitError(`fatal: Cannot do ${a.has('--soft') ? 'soft' : 'hard'} reset with paths.`);
    const tree = revArg ? treeOf(s, requireRev(s, revArg)) : headTree(s);
    const st = computeStatus(s);
    const matched = paths.flatMap((sp) => {
      const m = allPaths(s.index, tree, s.conflicts).filter((p) => p === sp || p.startsWith(sp.replace(/\/$/, '') + '/') || sp === '.');
      if (!m.length && !st.untracked.includes(sp)) throw new GitError(`fatal: ambiguous argument '${sp}': unknown revision or path not in the working tree.`);
      return m;
    });
    for (const p of matched) {
      if (tree[p] === undefined) delete s.index[p];
      else s.index[p] = tree[p];
      delete s.conflicts[p];
    }
    const unstaged = computeStatus(s).unstaged;
    if (unstaged.length && !a.has('-q', '--quiet')) {
      ctx.print('Unstaged changes after reset:');
      for (const c of unstaged) ctx.print(`${c.type === 'deleted' ? 'D' : 'M'}\t${c.path}`);
    }
    return;
  }

  const mode = a.has('--soft') ? 'soft' : a.has('--hard') ? 'hard' : 'mixed';
  const head = headId(s);
  if (!head && !revArg) {
    // unborn branch: `git reset` just empties the index
    if (mode !== 'soft') s.index = {};
    return;
  }
  const target = requireRev(s, revArg ?? 'HEAD');
  const op = s.operation;
  if (mode === 'soft' && op?.type === 'merge') throw new GitError('fatal: Cannot do a soft reset in the middle of a merge.');
  s.origHead = head;
  const tree = s.commits[target].tree;
  if (mode === 'hard') hardReset(s, tree);
  else if (mode === 'mixed') {
    s.index = { ...tree };
    s.conflicts = {};
  }
  setHead(s, target, `reset: moving to ${revArg ?? 'HEAD'}`);
  if (mode !== 'soft' && op && op.type !== 'rebase') s.operation = null;

  if (mode === 'hard') ctx.print(`HEAD is now at ${target} ${firstLine(s.commits[target].message)}`);
  else if (mode === 'mixed') {
    const unstaged = computeStatus(s).unstaged;
    if (unstaged.length && !a.has('-q', '--quiet')) {
      ctx.print('Unstaged changes after reset:');
      for (const c of unstaged) ctx.print(`${c.type === 'deleted' ? 'D' : 'M'}\t${c.path}`);
    }
  }
  if (head !== target || mode === 'hard') {
    const key = mode === 'soft' ? 'resetSoft' : mode === 'hard' ? 'resetHard' : 'resetMixed';
    ctx.hint(key, { target: revArg ?? 'HEAD', id: target });
  }
}

