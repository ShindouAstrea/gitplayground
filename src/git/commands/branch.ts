// branch, switch, checkout, restore, tag
import { parseArgs } from '../args';
import { allPaths } from '../diff';
import {
  aheadBehind,
  Ctx,
  currentBranch,
  firstLine,
  GitError,
  has,
  headId,
  headTree,
  isAncestor,
  REPO_PATH,
  requireHead,
  requireRev,
  resolveRev,
  treeOf,
} from '../repo';
import type { Color, Part, RepoState, Tree } from '../types';
import { createBranch, expandPathspecs, remoteDwim, switchTo } from './common';

function listBranches(ctx: Ctx, opts: { all: boolean; remotes: boolean; verbose: number; filter?: (tip: string) => boolean }) {
  const s = ctx.s;
  const cb = currentBranch(s);
  const op = s.operation;
  const rows: { name: string; tip: string; current: boolean; remote: boolean }[] = [];
  if (!opts.remotes) {
    if (s.head.type === 'detached') {
      const label = op?.type === 'rebase' && op.branch ? `(no branch, rebasing ${op.branch})` : `(HEAD detached at ${s.head.id})`;
      rows.push({ name: label, tip: s.head.id, current: true, remote: false });
    }
    for (const name of Object.keys(s.branches).sort()) rows.push({ name, tip: s.branches[name], current: name === cb, remote: false });
  }
  if (opts.all || opts.remotes) {
    for (const name of Object.keys(s.remoteBranches).sort()) {
      rows.push({ name: opts.remotes ? name : `remotes/${name}`, tip: s.remoteBranches[name], current: false, remote: true });
    }
  }
  const visible = rows.filter((r) => !opts.filter || opts.filter(r.tip));
  const width = Math.max(0, ...visible.map((r) => r.name.length));
  for (const r of visible) {
    const color: Color | undefined = r.current ? 'green' : r.remote ? 'red' : undefined;
    const parts: Part[] = [{ t: r.current ? '* ' : '  ' }, { t: opts.verbose ? r.name.padEnd(width) : r.name, c: color }];
    if (opts.verbose) {
      let track = '';
      const up = s.upstreams[r.name];
      if (opts.verbose > 1 && up && !r.remote) {
        const remoteId = s.remoteBranches[up];
        if (!remoteId) track = `[${up}: gone] `;
        else {
          const { ahead, behind } = aheadBehind(s, r.tip, remoteId);
          const parts2 = [ahead && `ahead ${ahead}`, behind && `behind ${behind}`].filter(Boolean).join(', ');
          track = `[${up}${parts2 ? ': ' + parts2 : ''}] `;
        }
      }
      parts.push({ t: ' ' }, { t: r.tip, c: 'yellow' }, { t: ` ${track}${firstLine(s.commits[r.tip].message)}` });
    }
    ctx.parts(...parts);
  }
}

export function branch(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-d': 'bool',
    '--delete': 'bool',
    '-D': 'bool',
    '-m': 'bool',
    '--move': 'bool',
    '-M': 'bool',
    '-a': 'bool',
    '--all': 'bool',
    '-r': 'bool',
    '--remotes': 'bool',
    '-v': 'bool',
    '--verbose': 'bool',
    '-f': 'bool',
    '--force': 'bool',
    '-u': 'value',
    '--set-upstream-to': 'value',
    '--unset-upstream': 'bool',
    '--merged': 'bool',
    '--no-merged': 'bool',
    '--list': 'bool',
    '-l': 'bool',
    '--show-current': 'bool',
  });
  const s = ctx.s;
  const cb = currentBranch(s);
  const force = a.has('-f', '--force');

  if (a.has('--show-current')) {
    if (cb) ctx.print(cb);
    return;
  }

  if (a.has('-d', '--delete', '-D')) {
    if (!a.pos.length) throw new GitError('fatal: branch name required');
    const hard = a.has('-D') || force;
    for (const name of a.pos) {
      if (!has(s.branches, name)) throw new GitError(`error: branch '${name}' not found`);
      if (name === cb) throw new GitError(`error: cannot delete branch '${name}' used by worktree at '${REPO_PATH}'`);
      const tip = s.branches[name];
      const up = s.upstreams[name] ? s.remoteBranches[s.upstreams[name]] : undefined;
      const head = headId(s);
      const merged = (head && isAncestor(s.commits, tip, head)) || (up && isAncestor(s.commits, tip, up));
      if (!hard && !merged) {
        throw new GitError(
          `error: the branch '${name}' is not fully merged\nhint: If you are sure you want to delete it, run 'git branch -D ${name}'`,
          'branchNotMerged',
          { branch: name },
        );
      }
      delete s.branches[name];
      delete s.upstreams[name];
      ctx.print(`Deleted branch ${name} (was ${tip}).`);
    }
    return;
  }

  if (a.has('-m', '--move', '-M')) {
    const [x, y] = a.pos;
    const oldName = y ? x : cb;
    const newName = y ?? x;
    if (!oldName || !newName) throw new GitError('fatal: branch name required');
    const unbornCurrent = oldName === cb && !headId(s);
    if (!has(s.branches, oldName) && !unbornCurrent) {
      throw new GitError(`error: refname refs/heads/${oldName} not found\nfatal: Branch rename failed`);
    }
    if (has(s.branches, newName) && !a.has('-M') && !force) throw new GitError(`fatal: a branch named '${newName}' already exists`);
    if (!unbornCurrent) {
      createBranch(s, newName, s.branches[oldName], true);
      delete s.branches[oldName];
    }
    if (has(s.upstreams, oldName)) {
      s.upstreams[newName] = s.upstreams[oldName];
      delete s.upstreams[oldName];
    }
    if (oldName === cb) s.head = { type: 'branch', name: newName };
    return;
  }

  const upstream = a.value('-u', '--set-upstream-to');
  if (upstream) {
    const target = a.pos[0] ?? cb;
    if (!target || !has(s.branches, target)) throw new GitError(`fatal: branch '${target ?? 'HEAD'}' does not exist`);
    if (!has(s.remoteBranches, upstream) && !has(s.branches, upstream)) {
      throw new GitError(`error: the requested upstream branch '${upstream}' does not exist`);
    }
    s.upstreams[target] = upstream;
    ctx.print(`branch '${target}' set up to track '${upstream}'.`);
    return;
  }
  if (a.has('--unset-upstream')) {
    const target = a.pos[0] ?? cb;
    if (!target || !has(s.upstreams, target)) throw new GitError(`fatal: branch '${target}' has no upstream information`);
    delete s.upstreams[target];
    return;
  }

  const listing = !a.pos.length || a.has('--list', '-l', '-a', '--all', '-r', '--remotes', '--merged', '--no-merged');
  if (listing) {
    const head = headId(s);
    const merged = a.has('--merged');
    const noMerged = a.has('--no-merged');
    const ref = a.pos[0] ? requireRev(s, a.pos[0]) : head;
    listBranches(ctx, {
      all: a.has('-a', '--all'),
      remotes: a.has('-r', '--remotes'),
      verbose: a.values('-v', '--verbose').length,
      filter:
        (merged || noMerged) && ref ? (tip) => isAncestor(s.commits, tip, ref) === merged : undefined,
    });
    return;
  }

  const [name, startArg] = a.pos;
  const start = startArg ? requireRev(s, startArg) : headId(s);
  if (!start) throw new GitError(`fatal: not a valid object name: '${cb}'`);
  if (force && name === cb) throw new GitError(`fatal: cannot force update the branch '${name}' used by worktree at '${REPO_PATH}'`);
  createBranch(s, name, start, force);
  if (startArg && has(s.remoteBranches, startArg)) {
    s.upstreams[name] = startArg;
    ctx.print(`branch '${name}' set up to track '${startArg}'.`);
  }
  ctx.hint('branchCreated', { branch: name });
}

function createAndSwitch(ctx: Ctx, name: string, startArg: string | undefined, force: boolean) {
  const s = ctx.s;
  let start = startArg ? requireRev(s, startArg) : headId(s);
  if (!startArg && !start) {
    // unborn repository: just point HEAD at the new (still unborn) branch
    s.head = { type: 'branch', name };
    ctx.print(`Switched to a new branch '${name}'`);
    return;
  }
  if (force && name === currentBranch(s)) {
    s.branches[name] = start!;
    return;
  }
  createBranch(s, name, start!, force);
  start = s.branches[name];
  if (startArg && has(s.remoteBranches, startArg)) {
    s.upstreams[name] = startArg;
    ctx.print(`branch '${name}' set up to track '${startArg}'.`);
  }
  switchTo(ctx, { branch: name, isNew: true });
}

function trySwitchByName(ctx: Ctx, target: string): boolean {
  const s = ctx.s;
  if (has(s.branches, target)) {
    switchTo(ctx, { branch: target });
    return true;
  }
  const remote = remoteDwim(s, target);
  if (remote) {
    createBranch(s, target, s.remoteBranches[remote]);
    s.upstreams[target] = remote;
    ctx.print(`branch '${target}' set up to track '${remote}'.`);
    switchTo(ctx, { branch: target, isNew: true });
    return true;
  }
  return false;
}

function previousBranch(s: RepoState): string {
  if (!s.prevBranch || !has(s.branches, s.prevBranch)) throw new GitError('fatal: invalid reference: @{-1}');
  return s.prevBranch;
}

export function switchCmd(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-c': 'value',
    '--create': 'value',
    '-C': 'value',
    '--force-create': 'value',
    '-d': 'bool',
    '--detach': 'bool',
    '-t': 'bool',
    '--track': 'bool',
    '--no-track': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  const create = a.value('-c', '--create', '-C', '--force-create');
  if (create) {
    createAndSwitch(ctx, create, a.pos[0], a.has('-C', '--force-create'));
    return;
  }
  let target = a.pos[0];
  if (!target) throw new GitError('fatal: missing branch or commit argument');
  if (target === '-') target = previousBranch(s);
  if (a.has('-d', '--detach')) {
    switchTo(ctx, { detach: requireRev(s, target), label: target });
    return;
  }
  if (trySwitchByName(ctx, target)) return;
  if (resolveRev(s, target)) {
    const kind = has(s.remoteBranches, target) ? 'remote branch' : has(s.tags, target) ? 'tag' : 'commit';
    throw new GitError(`fatal: a branch is expected, got ${kind} '${target}'\nhint: If you want to detach HEAD at the commit, try again with the --detach option.`, 'switchDetach', {
      target,
    });
  }
  throw new GitError(`fatal: invalid reference: ${target}`);
}

/** Restores paths in the index and/or working tree from a source tree */
function restorePaths(s: RepoState, source: Tree, paths: string[], opts: { index: boolean; worktree: boolean }) {
  for (const p of paths) {
    if (opts.index) {
      if (source[p] === undefined) delete s.index[p];
      else s.index[p] = source[p];
      delete s.conflicts[p];
    }
    if (opts.worktree) {
      if (source[p] === undefined) delete s.workdir[p];
      else s.workdir[p] = source[p];
    }
  }
}

function checkoutSide(ctx: Ctx, specs: string[], side: 'ours' | 'theirs') {
  const s = ctx.s;
  const paths = expandPathspecs(allPaths(s.index, s.conflicts), specs);
  for (const p of paths) {
    const c = s.conflicts[p];
    if (!c) {
      if (has(s.index, p)) s.workdir[p] = s.index[p];
      continue;
    }
    const version = c[side];
    if (version === undefined) throw new GitError(`error: path '${p}' does not have ${side === 'ours' ? 'our' : 'their'} version`);
    s.workdir[p] = version;
  }
  ctx.print(`Updated ${paths.length} path${paths.length === 1 ? '' : 's'} from the index`);
  const op = s.operation;
  ctx.hint('checkoutSide', { side, files: paths.join(', '), rebase: op?.type === 'rebase' ? 1 : 0 });
}

function unmergedGuard(s: RepoState, paths: string[]) {
  const bad = paths.filter((p) => has(s.conflicts, p));
  if (bad.length) throw new GitError(bad.map((p) => `error: path '${p}' is unmerged`).join('\n'), 'unmergedFiles');
}

export function checkout(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-b': 'value',
    '-B': 'value',
    '--ours': 'bool',
    '--theirs': 'bool',
    '-f': 'bool',
    '--force': 'bool',
    '--detach': 'bool',
    '-t': 'bool',
    '--track': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  if (a.has('--ours', '--theirs')) {
    const specs = [...a.pos, ...(a.paths ?? [])];
    if (!specs.length) throw new GitError('fatal: --ours/--theirs needs a path');
    checkoutSide(ctx, specs, a.has('--ours') ? 'ours' : 'theirs');
    return;
  }
  const newBranch = a.value('-b', '-B');
  if (newBranch) {
    createAndSwitch(ctx, newBranch, a.pos[0], a.has('-B'));
    return;
  }
  if (a.paths !== null) {
    const rev = a.pos[0];
    const source = rev ? treeOf(s, requireRev(s, rev)) : s.index;
    const paths = expandPathspecs(allPaths(source, s.index), a.paths);
    if (!rev) unmergedGuard(s, paths);
    restorePaths(s, source, paths, { index: !!rev, worktree: true });
    ctx.print(`Updated ${paths.length} path${paths.length === 1 ? '' : 's'} from ${rev ? requireRev(s, rev) : 'the index'}`);
    return;
  }
  let target = a.pos[0];
  if (!target) return;
  if (target === '-') target = previousBranch(s);
  if (a.pos.length > 1) {
    const id = requireRev(s, target);
    const source = treeOf(s, id);
    const paths = expandPathspecs(allPaths(source), a.pos.slice(1));
    restorePaths(s, source, paths, { index: true, worktree: true });
    ctx.print(`Updated ${paths.length} path${paths.length === 1 ? '' : 's'} from ${id}`);
    return;
  }
  if (!a.has('--detach') && trySwitchByName(ctx, target)) return;
  const id = resolveRev(s, target);
  if (id) {
    switchTo(ctx, { detach: id, label: target });
    return;
  }
  const known = allPaths(s.index, s.conflicts);
  if (known.some((p) => p === target || p.startsWith(target!.replace(/\/$/, '') + '/')) || target === '.') {
    const paths = expandPathspecs(known, [target]);
    unmergedGuard(s, paths);
    restorePaths(s, s.index, paths, { index: false, worktree: true });
    ctx.print(`Updated ${paths.length} path${paths.length === 1 ? '' : 's'} from the index`);
    return;
  }
  throw new GitError(`error: pathspec '${target}' did not match any file(s) known to git`);
}

export function restore(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--staged': 'bool',
    '-S': 'bool',
    '--worktree': 'bool',
    '-W': 'bool',
    '--source': 'value',
    '-s': 'value',
    '--ours': 'bool',
    '--theirs': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  const specs = [...a.pos, ...(a.paths ?? [])];
  if (!specs.length) throw new GitError('fatal: you must specify path(s) to restore');
  if (a.has('--ours', '--theirs')) {
    checkoutSide(ctx, specs, a.has('--ours') ? 'ours' : 'theirs');
    return;
  }
  const staged = a.has('--staged', '-S');
  const worktree = a.has('--worktree', '-W') || !staged;
  const sourceArg = a.value('--source', '-s');
  const source = sourceArg ? treeOf(s, requireRev(s, sourceArg)) : staged ? headTree(s) : s.index;
  const candidates = sourceArg || staged ? allPaths(source, s.index) : allPaths(s.index, s.conflicts);
  const paths = expandPathspecs(candidates, specs);
  if (worktree && !staged && !sourceArg) unmergedGuard(s, paths);
  restorePaths(s, source, paths, { index: staged, worktree });
}

export function tag(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-a': 'bool',
    '--annotate': 'bool',
    '-m': 'value',
    '--message': 'value',
    '-d': 'bool',
    '--delete': 'bool',
    '-l': 'bool',
    '--list': 'bool',
    '-f': 'bool',
    '--force': 'bool',
    '-n': 'bool',
  });
  const s = ctx.s;
  if (a.has('-d', '--delete')) {
    for (const name of a.pos) {
      if (!has(s.tags, name)) throw new GitError(`error: tag '${name}' not found.`);
      ctx.print(`Deleted tag '${name}' (was ${s.tags[name].target})`);
      delete s.tags[name];
    }
    return;
  }
  if (!a.pos.length || a.has('-l', '--list')) {
    const pattern = a.pos[0];
    const re = pattern ? new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$') : null;
    for (const name of Object.keys(s.tags).sort()) {
      if (re && !re.test(name)) continue;
      const t = s.tags[name];
      ctx.print(a.has('-n') ? `${name.padEnd(15)} ${firstLine(t.message ?? s.commits[t.target].message)}` : name);
    }
    return;
  }
  const [name, rev] = a.pos;
  const target = rev ? requireRev(s, rev) : requireHead(s);
  if (has(s.tags, name) && !a.has('-f', '--force')) throw new GitError(`fatal: tag '${name}' already exists`);
  const message = a.values('-m', '--message').join('\n\n');
  if (a.has('-a', '--annotate') && !message) {
    throw new GitError('fatal: no tag message given (this simulator cannot open an editor, use -m "message")', 'needMessage');
  }
  s.tags[name] = message ? { target, message } : { target };
  ctx.hint('tagCreated', { tag: name, id: target, annotated: message ? 1 : 0 });
}
