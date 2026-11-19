// init, status, add, rm, mv, commit, config, clean
import { parseArgs } from '../args';
import { allPaths, hasConflictMarkers } from '../diff';
import {
  computeStatus,
  createCommit,
  Ctx,
  currentBranch,
  DEFAULT_BRANCH,
  firstLine,
  GitError,
  has,
  headId,
  headTree,
  REPO_PATH,
  setHead,
  treeOf,
  treesEqual,
} from '../repo';
import type { RepoState } from '../types';
import { expandPathspecs, printCommitSummary, trackingInfo } from './common';

export function init(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '-b': 'value', '--initial-branch': 'value', '-q': 'bool', '--quiet': 'bool' });
  const s = ctx.s;
  if (s.initialized) {
    ctx.print(`Reinitialized existing Git repository in ${REPO_PATH}/.git/`);
    return;
  }
  s.initialized = true;
  s.head = { type: 'branch', name: a.value('-b', '--initial-branch') ?? DEFAULT_BRANCH };
  ctx.print(`Initialized empty Git repository in ${REPO_PATH}/.git/`);
  ctx.hint('initDone');
}

function opStatusLines(s: RepoState): string[] {
  const op = s.operation;
  const unresolved = Object.keys(s.conflicts).length > 0;
  if (!op) return [];
  if (op.type === 'merge') {
    return unresolved
      ? [
          'You have unmerged paths.',
          '  (fix conflicts and run "git commit")',
          '  (use "git merge --abort" to abort the merge)',
        ]
      : ['All conflicts fixed but you are still merging.', '  (use "git commit" to conclude merge)'];
  }
  if (op.type === 'rebase') {
    const branch = op.branch ?? 'HEAD';
    if (op.stoppedForEdit) {
      return [
        `You are currently editing a commit while rebasing branch '${branch}' on '${op.onto}'.`,
        '  (use "git commit --amend" to amend the current commit)',
        '  (use "git rebase --continue" once you are satisfied with your changes)',
      ];
    }
    return [
      `You are currently rebasing branch '${branch}' on '${op.onto}'.`,
      unresolved ? '  (fix conflicts and then run "git rebase --continue")' : '  (all conflicts fixed: run "git rebase --continue")',
      '  (use "git rebase --skip" to skip this patch)',
      '  (use "git rebase --abort" to check out the original branch)',
    ];
  }
  const verb = op.type === 'revert' ? 'reverting' : 'cherry-picking';
  return [
    `You are currently ${verb} commit ${op.current ?? ''}.`,
    unresolved
      ? `  (fix conflicts and run "git ${op.type} --continue")`
      : `  (all conflicts fixed: run "git ${op.type} --continue")`,
    `  (use "git ${op.type} --skip" to skip this patch)`,
    `  (use "git ${op.type} --abort" to cancel the ${op.type} operation)`,
  ];
}

function conflictLabel(s: RepoState, p: string): string {
  const c = s.conflicts[p];
  if (c.ours === undefined) return 'deleted by us:   ';
  if (c.theirs === undefined) return 'deleted by them: ';
  if (c.base === undefined) return 'both added:      ';
  return 'both modified:   ';
}

export function printStatus(ctx: Ctx) {
  const s = ctx.s;
  const st = computeStatus(s);
  const op = s.operation;
  const cb = currentBranch(s);
  if (op?.type === 'rebase') {
    ctx.print(`${op.interactive ? 'interactive rebase' : 'rebase'} in progress; onto ${op.onto}`);
  } else if (cb) {
    ctx.print(`On branch ${cb}`);
  } else {
    ctx.parts({ t: `HEAD detached at ${headId(s)}`, c: 'red' });
  }
  if (cb && !headId(s)) ctx.print('\nNo commits yet');
  if (cb && op?.type !== 'rebase') {
    const info = trackingInfo(s, cb);
    if (info.length) ctx.print(info.join('\n'));
  }
  const opLines = opStatusLines(s);
  if (opLines.length) ctx.print('\n' + opLines.join('\n'));

  const label = { new: 'new file:   ', modified: 'modified:   ', deleted: 'deleted:    ' } as const;
  if (st.staged.length) {
    ctx.print('\nChanges to be committed:');
    ctx.print(headId(s) ? '  (use "git restore --staged <file>..." to unstage)' : '  (use "git rm --cached <file>..." to unstage)');
    for (const c of st.staged) ctx.parts({ t: '\t' + label[c.type] + c.path, c: 'green' });
  }
  if (st.conflicted.length) {
    ctx.print('\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)');
    for (const p of st.conflicted) ctx.parts({ t: '\t' + conflictLabel(s, p) + p, c: 'red' });
  }
  if (st.unstaged.length) {
    ctx.print('\nChanges not staged for commit:');
    ctx.print('  (use "git add <file>..." to update what will be committed)');
    ctx.print('  (use "git restore <file>..." to discard changes in working directory)');
    for (const c of st.unstaged) ctx.parts({ t: '\t' + label[c.type] + c.path, c: 'red' });
  }
  if (st.untracked.length) {
    ctx.print('\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)');
    for (const p of st.untracked) ctx.parts({ t: '\t' + p, c: 'red' });
  }
  ctx.print('');
  if (st.staged.length || st.conflicted.length) return;
  if (st.unstaged.length) ctx.print('no changes added to commit (use "git add" and/or "git commit -a")');
  else if (st.untracked.length) {
    ctx.print(
      headId(s)
        ? 'nothing added to commit but untracked files present (use "git add" to track)'
        : 'nothing added to commit but untracked files present (use "git add" to track)',
    );
  } else ctx.print(headId(s) ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
}

export function status(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '-s': 'bool', '--short': 'bool', '-b': 'bool', '--branch': 'bool', '--long': 'bool' });
  if (!a.has('-s', '--short')) {
    printStatus(ctx);
    return;
  }
  const s = ctx.s;
  const st = computeStatus(s);
  if (a.has('-b', '--branch')) {
    const cb = currentBranch(s);
    const up = cb ? s.upstreams[cb] : undefined;
    ctx.parts({ t: '## ' }, { t: cb ?? 'HEAD (no branch)', c: 'green' }, ...(up ? [{ t: '...' }, { t: up, c: 'red' as const }] : []));
  }
  const letter = { new: 'A', modified: 'M', deleted: 'D' } as const;
  const rows = new Map<string, [string, string]>();
  for (const c of st.staged) rows.set(c.path, [letter[c.type], ' ']);
  for (const c of st.unstaged) rows.set(c.path, [rows.get(c.path)?.[0] ?? ' ', letter[c.type]]);
  for (const p of st.conflicted) {
    const c = s.conflicts[p];
    rows.set(p, c.ours === undefined ? ['D', 'U'] : c.theirs === undefined ? ['U', 'D'] : c.base === undefined ? ['A', 'A'] : ['U', 'U']);
  }
  for (const p of [...rows.keys()].sort()) {
    const [x, y] = rows.get(p)!;
    const conflicted = has(s.conflicts, p);
    ctx.parts({ t: x, c: conflicted ? 'red' : 'green' }, { t: y, c: 'red' }, { t: ' ' + p });
  }
  for (const p of st.untracked) ctx.parts({ t: '??', c: 'red' }, { t: ' ' + p });
}

function resolvedHint(ctx: Ctx) {
  const op = ctx.s.operation;
  if (Object.keys(ctx.s.conflicts).length) return;
  const next =
    op?.type === 'rebase'
      ? 'git rebase --continue'
      : op?.type === 'cherry-pick'
        ? 'git cherry-pick --continue'
        : op?.type === 'revert'
          ? 'git revert --continue'
          : 'git commit';
  ctx.hint('mergeConflictResolved', { next });
}

export function add(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-A': 'bool',
    '--all': 'bool',
    '-u': 'bool',
    '--update': 'bool',
    '-v': 'bool',
    '--verbose': 'bool',
    '-f': 'bool',
    '--force': 'bool',
  });
  const s = ctx.s;
  let specs = [...a.pos, ...(a.paths ?? [])];
  const update = a.has('-u', '--update');
  if (!specs.length && !a.has('-A', '--all') && !update) {
    ctx.print("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?", 'dim');
    return;
  }
  if (!specs.length) specs = ['.'];
  const candidates = update ? allPaths(s.index, s.conflicts) : allPaths(s.workdir, s.index, s.conflicts);
  const paths = expandPathspecs(candidates, specs);
  const hadConflicts = Object.keys(s.conflicts).length > 0;
  const withMarkers: string[] = [];
  for (const p of paths) {
    if (s.workdir[p] === undefined) delete s.index[p];
    else s.index[p] = s.workdir[p];
    if (has(s.conflicts, p)) {
      delete s.conflicts[p];
      if (hasConflictMarkers(s.workdir[p])) withMarkers.push(p);
    }
    if (a.has('-v', '--verbose')) ctx.print(`add '${p}'`);
  }
  if (withMarkers.length) ctx.hint('conflictMarkersStaged', { files: withMarkers.join(', ') });
  if (hadConflicts) resolvedHint(ctx);
}

export function rm(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--cached': 'bool',
    '-r': 'bool',
    '-f': 'bool',
    '--force': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  const specs = [...a.pos, ...(a.paths ?? [])];
  if (!specs.length) throw new GitError('usage: git rm [<options>] [--] <file>...');
  const paths = expandPathspecs(allPaths(s.index, s.conflicts), specs);
  const cached = a.has('--cached');
  if (!a.has('-f', '--force')) {
    const head = headTree(s);
    const dirty = paths.filter(
      (p) =>
        !has(s.conflicts, p) &&
        s.workdir[p] !== undefined &&
        (cached ? s.index[p] !== head[p] && s.workdir[p] !== s.index[p] : s.index[p] !== s.workdir[p] || s.index[p] !== head[p]),
    );
    if (dirty.length) {
      throw new GitError(
        `error: the following file${dirty.length > 1 ? 's have' : ' has'} local modifications:\n` +
          dirty.map((p) => `    ${p}`).join('\n') +
          '\n(use --cached to keep the file, or -f to force removal)',
      );
    }
  }
  for (const p of paths) {
    delete s.index[p];
    delete s.conflicts[p];
    if (!cached) delete s.workdir[p];
    if (!a.has('-q')) ctx.print(`rm '${p}'`);
  }
}

export function mv(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '-f': 'bool', '--force': 'bool' });
  const s = ctx.s;
  const [src, dst] = a.pos;
  if (!src || !dst) throw new GitError('usage: git mv [<options>] <source>... <destination>');
  if (!has(s.index, src)) throw new GitError(`fatal: not under version control, source=${src}, destination=${dst}`);
  if (has(s.workdir, dst) && !a.has('-f', '--force')) {
    throw new GitError(`fatal: destination exists, source=${src}, destination=${dst}`);
  }
  s.index[dst] = s.index[src];
  delete s.index[src];
  if (has(s.workdir, src)) {
    s.workdir[dst] = s.workdir[src];
    delete s.workdir[src];
  }
}

export function commit(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-m': 'value',
    '--message': 'value',
    '-a': 'bool',
    '--all': 'bool',
    '--amend': 'bool',
    '--no-edit': 'bool',
    '--allow-empty': 'bool',
    '-q': 'bool',
    '--quiet': 'bool',
    '-v': 'bool',
  });
  const s = ctx.s;
  if (Object.keys(s.conflicts).length) {
    throw new GitError(
      "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.",
      'unmergedFiles',
    );
  }
  if (a.pos.length || a.paths) {
    throw new GitError(
      'error: committing specific paths is not supported in this simulator.\nStage them with "git add <file>" and then run "git commit".',
      'unsupported',
      { option: 'git commit <paths>' },
    );
  }
  if (a.has('-a', '--all')) {
    for (const p of Object.keys(s.index)) {
      if (s.workdir[p] === undefined) delete s.index[p];
      else s.index[p] = s.workdir[p];
    }
  }
  const head = headId(s);
  const amend = a.has('--amend');
  if (amend && !head) throw new GitError('fatal: You have nothing to amend.');
  const op = s.operation;
  const mergeOp = op?.type === 'merge' ? op : null;

  if (!amend && !mergeOp && !a.has('--allow-empty') && treesEqual(s.index, headTree(s))) {
    const st = computeStatus(s);
    const cb = currentBranch(s);
    ctx.print(cb ? `On branch ${cb}` : `HEAD detached at ${head}`);
    if (st.unstaged.length) {
      ctx.print('Changes not staged for commit:');
      for (const c of st.unstaged) ctx.parts({ t: `\tmodified:   ${c.path}`, c: 'red' });
      ctx.print('\nno changes added to commit (use "git add" and/or "git commit -a")');
      ctx.hint('nothingStaged');
    } else if (st.untracked.length) {
      ctx.print('Untracked files:');
      for (const p of st.untracked) ctx.parts({ t: `\t${p}`, c: 'red' });
      ctx.print('\nnothing added to commit but untracked files present (use "git add" to track)');
      ctx.hint('nothingStaged');
    } else {
      ctx.print('nothing to commit, working tree clean');
      ctx.hint('nothingToCommit');
    }
    ctx.failed = true;
    return;
  }

  const msgs = a.values('-m', '--message');
  let message: string | null = msgs.length ? msgs.join('\n\n') : null;
  if (message === null) {
    if (amend) {
      message = s.commits[head!].message;
      if (!a.has('--no-edit')) ctx.hint('editorHint');
    } else if (mergeOp) message = mergeOp.message;
    else if (op?.type === 'cherry-pick' && op.current) message = s.commits[op.current].message;
    else if (op?.type === 'revert' && op.current) message = revertMessage(s, op.current);
    else if (op?.type === 'rebase' && op.current) {
      message = op.current.message ?? s.commits[op.current.commit].message;
    } else throw new GitError('Aborting commit due to empty commit message.', 'needMessage');
  }
  if (!message.trim()) throw new GitError('Aborting commit due to empty commit message.', 'needMessage');

  const parents = amend ? s.commits[head!].parents : mergeOp ? [head!, mergeOp.theirs] : head ? [head] : [];
  const id = createCommit(s, parents, message, s.index);
  const first = firstLine(message);
  const reflogMsg = amend
    ? `commit (amend): ${first}`
    : mergeOp
      ? `commit (merge): ${first}`
      : head
        ? `commit: ${first}`
        : `commit (initial): ${first}`;
  setHead(s, id, reflogMsg);
  if (!a.has('-q', '--quiet')) printCommitSummary(ctx, id, treeOf(s, parents[0]));

  if (mergeOp) s.operation = null;
  if (op && (op.type === 'cherry-pick' || op.type === 'revert')) {
    op.current = null;
    if (!op.todo.length) s.operation = null;
  }
  if (!head) ctx.hint('firstCommit');
  else if (amend) ctx.hint('amendDone', { old: head, id });
}

export function revertMessage(s: RepoState, id: string): string {
  return `Revert "${firstLine(s.commits[id].message)}"\n\nThis reverts commit ${id}.`;
}

export function config(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--global': 'bool',
    '--local': 'bool',
    '--list': 'bool',
    '-l': 'bool',
    '--unset': 'bool',
    '--get': 'bool',
  });
  const s = ctx.s;
  if (a.has('--list', '-l')) {
    for (const [k, v] of Object.entries(s.config)) ctx.print(`${k}=${v}`);
    return;
  }
  const [key, ...rest] = a.pos;
  if (!key) throw new GitError('usage: git config [<options>] <name> [<value>]');
  const k = key.toLowerCase() === 'init.defaultbranch' ? 'init.defaultBranch' : key;
  if (a.has('--unset')) {
    delete s.config[k];
    return;
  }
  if (!rest.length) {
    if (has(s.config, k)) ctx.print(s.config[k]);
    else ctx.failed = true;
    return;
  }
  s.config[k] = rest.join(' ');
}

export function clean(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-f': 'bool',
    '--force': 'bool',
    '-n': 'bool',
    '--dry-run': 'bool',
    '-d': 'bool',
    '-x': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  const dry = a.has('-n', '--dry-run');
  if (!dry && !a.has('-f', '--force')) {
    throw new GitError('fatal: clean.requireForce is true and -f not given: refusing to clean');
  }
  const specs = [...a.pos, ...(a.paths ?? [])];
  let untracked = computeStatus(s).untracked;
  if (specs.length) untracked = untracked.filter((p) => specs.some((sp) => p === sp || p.startsWith(sp.replace(/\/$/, '') + '/')));
  for (const p of untracked) {
    ctx.print(dry ? `Would remove ${p}` : `Removing ${p}`);
    if (!dry) delete s.workdir[p];
  }
}
