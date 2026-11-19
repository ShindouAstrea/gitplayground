// Entry point of the simulator: parses a command line and runs it on a copy
// of the state. The input state is never mutated, which makes undo trivial.
import { tokenize, type Token } from './args';
import { add, clean, commit, config, init, mv, rm, status } from './commands/basic';
import { branch, checkout, restore, switchCmd, tag } from './commands/branch';
import { cherryPick, merge, rebase, reset, revert, startRebase } from './commands/history';
import { blame, diff, log, reflog, show } from './commands/inspect';
import { fetch, pull, push, remote } from './commands/remote';
import { stash } from './commands/stash';
import { normalizeContent } from './diff';
import { createCommit, Ctx, GitError } from './repo';
import { redirect, shell } from './shell';
import type { ExecResult, OutLine, RebasePlan, RepoState } from './types';

type Command = (ctx: Ctx, argv: string[]) => void;

const COMMANDS: Record<string, Command> = {
  init,
  status,
  add,
  rm,
  mv,
  commit,
  config,
  clean,
  log,
  show,
  diff,
  reflog,
  blame,
  branch,
  switch: switchCmd,
  checkout,
  restore,
  tag,
  merge,
  rebase,
  'cherry-pick': cherryPick,
  revert,
  reset,
  remote,
  fetch,
  pull,
  push,
  stash,
};

export const GIT_SUBCOMMANDS = Object.keys(COMMANDS).sort();

const UNSUPPORTED = new Set([
  'clone',
  'bisect',
  'worktree',
  'submodule',
  'am',
  'apply',
  'format-patch',
  'gc',
  'fsck',
  'grep',
  'shortlog',
  'describe',
  'notes',
  'archive',
  'bundle',
  'filter-branch',
  'sparse-checkout',
  'range-diff',
  'gui',
]);

const NO_REPO_NEEDED = new Set(['init', 'config']);

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function printGitHelp(ctx: Ctx) {
  ctx.print(
    [
      'usage: git <command> [<args>]',
      '',
      'start a working area',
      '   init         Create an empty Git repository',
      '',
      'work on the current change',
      '   add          Add file contents to the index',
      '   mv           Move or rename a file',
      '   restore      Restore working tree files',
      '   rm           Remove files from the working tree and from the index',
      '',
      'examine the history and state',
      '   diff         Show changes between commits, commit and working tree, etc',
      '   log          Show commit logs',
      '   show         Show various types of objects',
      '   status       Show the working tree status',
      '   blame        Show what revision and author last modified each line',
      '   reflog       Show where HEAD has been',
      '',
      'grow, mark and tweak your common history',
      '   branch       List, create, or delete branches',
      '   commit       Record changes to the repository',
      '   merge        Join two or more development histories together',
      '   rebase       Reapply commits on top of another base tip',
      '   reset        Reset current HEAD to the specified state',
      '   switch       Switch branches',
      '   checkout     Switch branches or restore working tree files',
      '   cherry-pick  Apply the changes introduced by some existing commits',
      '   revert       Revert some existing commits',
      '   stash        Stash the changes in a dirty working directory away',
      '   tag          Create, list or delete tags',
      '',
      'collaborate',
      '   fetch        Download objects and refs from another repository',
      '   pull         Fetch from and integrate with another repository or a local branch',
      '   push         Update remote refs along with associated objects',
      '   remote       Manage set of tracked repositories',
      '',
      "'git <command> --help' opens the guide for that command.",
    ].join('\n'),
  );
}

function git(ctx: Ctx, argv: string[]) {
  const [sub, ...rest] = argv;
  if (!sub || sub === 'help' || sub === '--help' || sub === '-h') {
    if (sub === 'help' && rest[0]) {
      ctx.ui = { type: 'guide', id: rest[0] };
      ctx.print(`Opening the guide for git ${rest[0]}...`, 'dim');
      return;
    }
    printGitHelp(ctx);
    return;
  }
  if (sub === '--version' || sub === 'version') {
    ctx.print('git version 2.47.1 (git-playground simulator)');
    return;
  }
  if (rest.includes('--help') || (rest.length === 1 && rest[0] === '-h')) {
    ctx.ui = { type: 'guide', id: sub };
    ctx.print(`Opening the guide for git ${sub}...`, 'dim');
    return;
  }
  const fn = COMMANDS[sub];
  if (!fn) {
    if (UNSUPPORTED.has(sub)) {
      throw new GitError(`git: '${sub}' is not available in this simulator.`, 'unsupported', { option: `git ${sub}` });
    }
    const best = GIT_SUBCOMMANDS.map((c) => [c, distance(sub, c)] as const).sort((x, y) => x[1] - y[1])[0];
    throw new GitError(
      `git: '${sub}' is not a git command. See 'git --help'.` +
        (best && best[1] <= 2 ? `\n\nThe most similar command is\n\t${best[0]}` : ''),
      'unknownCommand',
    );
  }
  if (!ctx.s.initialized && !NO_REPO_NEEDED.has(sub)) {
    throw new GitError('fatal: not a git repository (or any of the parent directories): .git', 'notARepo');
  }
  fn(ctx, rest);
}

function dispatch(ctx: Ctx, words: string[]) {
  const [cmd, ...rest] = words;
  if (cmd === 'git') return git(ctx, rest);
  if (shell(ctx, words)) return;
  throw new GitError(`bash: ${cmd}: command not found`, 'unknownCommand');
}

function errorLines(e: GitError): OutLine[] {
  const lines: OutLine[] = e.message.split('\n').map((text) => ({
    kind: text.startsWith('hint:') ? 'dim' : text.startsWith('warning:') ? 'warn' : 'err',
    text,
  }));
  if (e.hint) lines.push({ kind: 'hint', hint: e.hint, params: e.params });
  return lines;
}

function execute(state: RepoState, body: (ctx: Ctx) => void): ExecResult {
  const ctx = new Ctx(structuredClone(state));
  try {
    body(ctx);
    return { state: ctx.s, lines: ctx.out, ok: !ctx.failed, ui: ctx.ui };
  } catch (e) {
    if (e instanceof GitError) return { state, lines: errorLines(e), ok: false };
    console.error(e);
    return { state, lines: [{ kind: 'err', text: `simulator error: ${(e as Error).message}` }], ok: false };
  }
}

function runSegment(state: RepoState, tokens: Token[]): ExecResult {
  return execute(state, (ctx) => {
    if (tokens.some((t) => t.kind === 'op' && t.value === '|')) {
      throw new GitError('bash: pipes (|) are not supported in this simulator');
    }
    const ri = tokens.findIndex((t) => t.kind === 'op' && (t.value === '>' || t.value === '>>'));
    const words = (ri >= 0 ? tokens.slice(0, ri) : tokens).map((t) => t.value);
    if (ri >= 0) {
      const target = tokens[ri + 1];
      if (!target || target.kind !== 'word') throw new GitError("bash: syntax error near unexpected token `newline'");
      redirect(ctx, words, target.value, tokens[ri].value === '>>');
    } else dispatch(ctx, words);
  });
}

/** Runs a full command line (supports `&&`, `||` and `;`) */
export function run(state: RepoState, line: string): ExecResult {
  if (line.trim().startsWith('#')) return { state, lines: [], ok: true };
  let tokens: Token[];
  try {
    tokens = tokenize(line);
  } catch (e) {
    return { state, lines: [{ kind: 'err', text: (e as Error).message }], ok: false };
  }
  const segments: { tokens: Token[]; op: string | null }[] = [];
  let current: Token[] = [];
  let op: string | null = null;
  for (const t of tokens) {
    if (t.kind === 'op' && (t.value === '&&' || t.value === '||' || t.value === ';')) {
      segments.push({ tokens: current, op });
      op = t.value;
      current = [];
    } else current.push(t);
  }
  segments.push({ tokens: current, op });

  let s = state;
  let ok = true;
  const lines: OutLine[] = [];
  let ui: ExecResult['ui'];
  for (const seg of segments) {
    if ((seg.op === '&&' && !ok) || (seg.op === '||' && ok) || !seg.tokens.length) continue;
    const r = runSegment(s, seg.tokens);
    s = r.state;
    ok = r.ok;
    lines.push(...r.lines);
    if (r.ui) ui = r.ui;
  }
  return { state: s, lines, ok, ui };
}

/** Runs already-split words (no shell parsing); used by scenario builders */
export function runArgv(state: RepoState, words: string[]): ExecResult {
  return execute(state, (ctx) => dispatch(ctx, words));
}

/** Continues `git rebase -i` once the user has edited the todo list */
export function applyRebasePlan(state: RepoState, plan: RebasePlan): ExecResult {
  return execute(state, (ctx) => {
    if (!plan.steps.length) throw new GitError('error: nothing to do');
    startRebase(ctx, plan, true);
  });
}

/** Saves a file from the in-app editor into the working directory */
export function writeFile(state: RepoState, path: string, content: string | null): RepoState {
  const s = structuredClone(state);
  const p = path.trim().replace(/^\.\//, '');
  if (content === null) delete s.workdir[p];
  else s.workdir[p] = normalizeContent(content);
  return s;
}

/** A teammate pushes a commit to the remote (for practising fetch/pull/push) */
export function simulateTeammatePush(
  state: RepoState,
  opts: { remote?: string; branch?: string; author?: string } = {},
): ExecResult {
  const remoteName = opts.remote ?? 'origin';
  const branchName = opts.branch ?? 'main';
  const author = opts.author ?? 'Ana';
  return execute(state, (ctx) => {
    const s = ctx.s;
    const r = s.remotes[remoteName];
    const tip = r?.branches[branchName];
    if (!r || !tip) throw new GitError(`fatal: remote branch '${remoteName}/${branchName}' does not exist`, 'noRemote');
    const n = Object.keys(r.commits).length + 1;
    const tree = { ...r.commits[tip].tree };
    const path = 'docs/CHANGELOG.md';
    tree[path] = (tree[path] ?? '# Changelog\n') + `- Change #${n} by ${author}\n`;
    const id = createCommit(s, [tip], `Update changelog (#${n})`, tree, author, r.commits);
    r.branches[branchName] = id;
    ctx.hint('teammatePushed', { author, branch: branchName, remote: remoteName, id });
  });
}

export function promptInfo(s: RepoState): { ref: string; op: string | null } {
  if (!s.initialized) return { ref: '', op: null };
  const op = s.operation;
  let ref = s.head.type === 'branch' ? s.head.name : `(${s.head.id})`;
  if (op?.type === 'rebase' && op.branch) ref = op.branch;
  let label: string | null = null;
  if (op?.type === 'merge') label = 'MERGING';
  else if (op?.type === 'rebase') {
    const step = op.stoppedForEdit ? op.done : Math.min(op.done + 1, op.total);
    label = `REBASE${op.interactive ? '-i' : ''} ${step}/${op.total}`;
  } else if (op?.type === 'cherry-pick') label = 'CHERRY-PICKING';
  else if (op?.type === 'revert') label = 'REVERTING';
  return { ref, op: label };
}
