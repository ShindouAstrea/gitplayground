// git stash: push / list / show / pop / apply / drop / clear
import { parseArgs } from '../args';
import { allPaths, mergeTrees } from '../diff';
import {
  applyMergeResult,
  computeStatus,
  Ctx,
  currentBranch,
  firstLine,
  GitError,
  hardReset,
  has,
  headTree,
  requireHead,
  treeOf,
} from '../repo';
import type { RepoState } from '../types';
import { statSummary } from './common';
import { printStatus } from './basic';

function stashIndex(s: RepoState, ref: string | undefined): number {
  if (!s.stash.length) throw new GitError('No stash entries found.');
  if (ref === undefined) return 0;
  const m = /^(?:stash@\{(\d+)\}|(\d+))$/.exec(ref);
  const n = m ? Number(m[1] ?? m[2]) : -1;
  if (n < 0 || n >= s.stash.length) throw new GitError(`error: ${ref} is not a valid reference`);
  return n;
}

function fakeHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

function push(ctx: Ctx, argv: string[], legacySave: boolean) {
  const a = parseArgs(argv, {
    '-m': 'value',
    '--message': 'value',
    '-u': 'bool',
    '--include-untracked': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  const head = requireHead(s);
  if (Object.keys(s.conflicts).length) {
    throw new GitError(
      Object.keys(s.conflicts)
        .map((p) => `${p}: needs merge`)
        .join('\n') + '\nerror: could not save index tree',
      'unmergedFiles',
    );
  }
  const st = computeStatus(s);
  const untracked = a.has('-u', '--include-untracked');
  if (!st.staged.length && !st.unstaged.length && !(untracked && st.untracked.length)) {
    ctx.print('No local changes to save');
    return;
  }
  const headT = s.commits[head].tree;
  const saved: Record<string, string> = {};
  for (const p of allPaths(s.index, headT)) if (has(s.workdir, p) && has(s.index, p)) saved[p] = s.workdir[p];
  if (untracked) for (const p of st.untracked) saved[p] = s.workdir[p];
  const msg = a.value('-m', '--message') ?? (legacySave && a.pos.length ? a.pos.join(' ') : undefined);
  const cb = currentBranch(s) ?? '(no branch)';
  const message = msg ? `On ${cb}: ${msg}` : `WIP on ${cb}: ${head} ${firstLine(s.commits[head].message)}`;
  s.stash.unshift({ message, base: head, index: { ...s.index }, workdir: saved });
  hardReset(s, headT);
  if (untracked) for (const p of st.untracked) delete s.workdir[p];
  ctx.print(`Saved working directory and index state ${message}`);
  ctx.hint('stashSaved');
}

function apply(ctx: Ctx, argv: string[], pop: boolean) {
  const a = parseArgs(argv, { '--index': 'bool', '-q': 'bool' });
  const s = ctx.s;
  const n = stashIndex(s, a.pos[0]);
  const entry = s.stash[n];
  requireHead(s);
  if (Object.keys(s.conflicts).length) throw new GitError('error: you need to resolve your current index first', 'unmergedFiles');
  const base = treeOf(s, entry.base);
  const ours = headTree(s);
  const m = mergeTrees(base, ours, entry.workdir, { ours: 'Updated upstream', theirs: 'Stashed changes' });
  const before = { ...s.index };
  applyMergeResult(s, ours, m, 'merge');
  // changes come back unstaged, except files that were new and staged when stashed
  for (const p of allPaths(ours, m.tree)) {
    if (has(m.conflicts, p) || ours[p] === m.tree[p]) continue;
    const stagedNew = base[p] === undefined && entry.index[p] !== undefined;
    if (stagedNew || a.has('--index')) s.index[p] = m.tree[p];
    else if (before[p] === undefined) delete s.index[p];
    else s.index[p] = before[p];
  }
  for (const msg of m.messages) ctx.print(msg);
  if (Object.keys(m.conflicts).length) {
    ctx.print('On branch ' + (currentBranch(s) ?? 'HEAD'));
    if (pop) ctx.print('The stash entry is kept in case you need it again.');
    ctx.hint('stashConflict', { files: Object.keys(m.conflicts).join(', ') });
    ctx.failed = true;
    return;
  }
  printStatus(ctx);
  if (pop) {
    s.stash.splice(n, 1);
    ctx.print(`Dropped refs/stash@{${n}} (${fakeHash(entry.message)})`);
  }
}

export function stash(ctx: Ctx, argv: string[]) {
  const s = ctx.s;
  const sub = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'push';
  const rest = sub === argv[0] ? argv.slice(1) : argv;
  switch (sub) {
    case 'push':
      return push(ctx, rest, false);
    case 'save':
      return push(ctx, rest, true);
    case 'list':
      s.stash.forEach((e, i) => ctx.parts({ t: `stash@{${i}}`, c: 'yellow' }, { t: `: ${e.message}` }));
      return;
    case 'show': {
      const e = s.stash[stashIndex(s, rest[0])];
      const base = treeOf(s, e.base);
      const lines = statSummary(base, e.workdir);
      for (const p of allPaths(base, e.workdir)) if (base[p] !== e.workdir[p]) ctx.print(` ${p}`);
      if (lines.length) ctx.print(lines[0]);
      return;
    }
    case 'pop':
      return apply(ctx, rest, true);
    case 'apply':
      return apply(ctx, rest, false);
    case 'drop': {
      const n = stashIndex(s, rest[0]);
      const [e] = s.stash.splice(n, 1);
      ctx.print(`Dropped refs/stash@{${n}} (${fakeHash(e.message)})`);
      return;
    }
    case 'clear':
      s.stash = [];
      return;
    default:
      throw new GitError(`error: unknown subcommand: ${sub}`);
  }
}
