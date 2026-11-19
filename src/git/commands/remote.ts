// remote, fetch, pull, push — against simulated remotes living in the same state
import { parseArgs } from '../args';
import {
  ancestors,
  Ctx,
  currentBranch,
  GitError,
  has,
  hasTrackedChanges,
  headId,
  isAncestor,
  requireHead,
  setHead,
  updateTrees,
} from '../repo';
import type { Commit, RemoteRepo, RepoState } from '../types';
import { ensureNoOperation, splitRemoteRef } from './common';
import { doMerge, rebaseCommits, startRebase } from './history';

function getRemote(s: RepoState, name: string): RemoteRepo {
  const r = s.remotes[name];
  if (!r) {
    throw new GitError(
      `fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.`,
    );
  }
  return r;
}

function defaultRemote(s: RepoState): string {
  const cb = currentBranch(s);
  const up = cb ? s.upstreams[cb] : undefined;
  if (up) return splitRemoteRef(up)[0];
  if (has(s.remotes, 'origin')) return 'origin';
  const names = Object.keys(s.remotes);
  if (!names.length) throw new GitError('fatal: No remote repository specified.', 'noRemote');
  return names[0];
}

export function copyCommits(from: Record<string, Commit>, to: Record<string, Commit>, tip: string) {
  for (const id of ancestors(from, tip)) if (!has(to, id)) to[id] = structuredClone(from[id]);
}

const pad = (name: string) => name.padEnd(10);

export function remote(ctx: Ctx, argv: string[]) {
  const s = ctx.s;
  const [sub, ...rest] = argv;
  if (!sub || sub === '-v' || sub === '--verbose') {
    for (const [name, r] of Object.entries(s.remotes)) {
      if (sub) ctx.print(`${name}\t${r.url} (fetch)\n${name}\t${r.url} (push)`);
      else ctx.print(name);
    }
    return;
  }
  const [name, url] = rest;
  switch (sub) {
    case 'add':
      if (!name || !url) throw new GitError('usage: git remote add <name> <url>');
      if (has(s.remotes, name)) throw new GitError(`error: remote ${name} already exists.`);
      s.remotes[name] = { url, commits: {}, branches: {}, tags: {} };
      return;
    case 'remove':
    case 'rm':
      getRemote(s, name);
      delete s.remotes[name];
      for (const key of Object.keys(s.remoteBranches)) if (key.startsWith(name + '/')) delete s.remoteBranches[key];
      for (const [b, up] of Object.entries(s.upstreams)) if (up.startsWith(name + '/')) delete s.upstreams[b];
      return;
    case 'rename': {
      const newName = rest[1];
      getRemote(s, name);
      if (!newName) throw new GitError('usage: git remote rename <old> <new>');
      s.remotes[newName] = s.remotes[name];
      delete s.remotes[name];
      for (const key of Object.keys(s.remoteBranches)) {
        if (!key.startsWith(name + '/')) continue;
        s.remoteBranches[newName + key.slice(name.length)] = s.remoteBranches[key];
        delete s.remoteBranches[key];
      }
      for (const [b, up] of Object.entries(s.upstreams)) {
        if (up.startsWith(name + '/')) s.upstreams[b] = newName + up.slice(name.length);
      }
      return;
    }
    case 'set-url':
      getRemote(s, name).url = url;
      return;
    case 'get-url':
      ctx.print(getRemote(s, name).url);
      return;
    case 'show': {
      const r = getRemote(s, name);
      ctx.print(`* remote ${name}\n  Fetch URL: ${r.url}\n  Push  URL: ${r.url}\n  Remote branches:`);
      for (const b of Object.keys(r.branches).sort()) {
        ctx.print(`    ${pad(b)} ${has(s.remoteBranches, `${name}/${b}`) ? 'tracked' : 'new (next fetch will store in remotes/' + name + ')'}`);
      }
      return;
    }
    default:
      throw new GitError(`error: unknown subcommand: ${sub}`);
  }
}

/** Downloads commits and updates remote-tracking branches. Returns whether anything changed. */
export function fetchRemote(ctx: Ctx, name: string, prune = false): boolean {
  const s = ctx.s;
  const r = getRemote(s, name);
  const lines: string[] = [];
  for (const [b, id] of Object.entries(r.branches)) {
    copyCommits(r.commits, s.commits, id);
    const key = `${name}/${b}`;
    const old = s.remoteBranches[key];
    if (old === id) continue;
    if (!old) lines.push(` * [new branch]      ${pad(b)} -> ${key}`);
    else if (isAncestor(s.commits, old, id)) lines.push(`   ${old}..${id}  ${pad(b)} -> ${key}`);
    else lines.push(` + ${old}...${id} ${pad(b)} -> ${key}  (forced update)`);
    s.remoteBranches[key] = id;
  }
  for (const [t, tag] of Object.entries(r.tags)) {
    if (has(s.tags, t)) continue;
    copyCommits(r.commits, s.commits, tag.target);
    s.tags[t] = { ...tag };
    lines.push(` * [new tag]         ${pad(t)} -> ${t}`);
  }
  if (prune) {
    for (const key of Object.keys(s.remoteBranches)) {
      if (key.startsWith(name + '/') && !has(r.branches, key.slice(name.length + 1))) {
        lines.push(` - [deleted]         (none)     -> ${key}`);
        delete s.remoteBranches[key];
      }
    }
  }
  if (lines.length) ctx.print(`From ${r.url}\n${lines.join('\n')}`);
  return lines.length > 0;
}

export function fetch(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '--all': 'bool', '--prune': 'bool', '-p': 'bool', '-q': 'bool', '--tags': 'bool', '-t': 'bool' });
  const s = ctx.s;
  if (!Object.keys(s.remotes).length) throw new GitError('fatal: No remote repository specified.', 'noRemote');
  const names = a.has('--all') ? Object.keys(s.remotes) : [a.pos[0] ?? defaultRemote(s)];
  let changed = false;
  for (const name of names) changed = fetchRemote(ctx, name, a.has('--prune', '-p')) || changed;
  if (changed) ctx.hint('fetchDone', { remote: names.join(', ') });
}

export function pull(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--rebase': 'bool',
    '-r': 'bool',
    '--no-rebase': 'bool',
    '--ff-only': 'bool',
    '--ff': 'bool',
    '--no-ff': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  ensureNoOperation(s);
  const cb = currentBranch(s);
  if (!cb) {
    throw new GitError('You are not currently on a branch.\nPlease specify which branch you want to merge with.\n\n    git pull <remote> <branch>\n');
  }
  let remoteName: string;
  let branchName: string | undefined;
  if (a.pos.length) {
    remoteName = a.pos[0];
    branchName = a.pos[1] ?? (s.upstreams[cb] ? splitRemoteRef(s.upstreams[cb])[1] : undefined);
  } else {
    const up = s.upstreams[cb];
    if (!up) {
      if (!Object.keys(s.remotes).length) throw new GitError('fatal: No remote repository specified.', 'noRemote');
      throw new GitError(
        `There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\n\n    git pull <remote> <branch>\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/<branch> ${cb}\n`,
        'pullNoTracking',
        { branch: cb },
      );
    }
    [remoteName, branchName] = splitRemoteRef(up);
  }
  if (!branchName) throw new GitError(`fatal: you must specify a branch: git pull ${remoteName} <branch>`);
  getRemote(s, remoteName);
  fetchRemote(ctx, remoteName);
  const label = `${remoteName}/${branchName}`;
  const target = s.remoteBranches[label];
  if (!target) throw new GitError(`fatal: couldn't find remote ref ${branchName}`);
  const head = headId(s);
  if (!head) {
    s.branches[cb] = target;
    updateTrees(s, {}, s.commits[target].tree, 'checkout');
    return;
  }
  if (isAncestor(s.commits, target, head)) {
    ctx.print('Already up to date.');
    return;
  }
  const canFF = isAncestor(s.commits, head, target);
  let mode: 'merge' | 'rebase' | 'ff-only' | null;
  if (a.has('--rebase', '-r')) mode = 'rebase';
  else if (a.has('--no-rebase')) mode = 'merge';
  else if (a.has('--ff-only')) mode = 'ff-only';
  else if (s.config['pull.rebase'] === 'true') mode = 'rebase';
  else if (s.config['pull.rebase'] === 'false') mode = 'merge';
  else if (s.config['pull.ff'] === 'only') mode = 'ff-only';
  else mode = canFF ? 'merge' : null;

  if (mode === null) {
    ctx.print(
      'hint: You have divergent branches and need to specify how to reconcile them.\n' +
        'hint: You can do so by running one of the following commands sometime before\n' +
        'hint: your next pull:\nhint:\n' +
        'hint:   git config pull.rebase false  # merge\n' +
        'hint:   git config pull.rebase true   # rebase\n' +
        'hint:   git config pull.ff only       # fast-forward only\nhint:\n' +
        'hint: You can replace "git config" with "git config --global" to set a default\n' +
        'hint: preference for all repositories. You can also pass --rebase, --no-rebase,\n' +
        'hint: or --ff-only on the command line to override the configured default per\nhint: invocation.',
      'dim',
    );
    ctx.print('fatal: Need to specify how to reconcile divergent branches.', 'err');
    ctx.hint('pullDivergent');
    ctx.failed = true;
    return;
  }
  if (mode === 'ff-only') {
    if (!canFF) throw new GitError('fatal: Not possible to fast-forward, aborting.');
    doMerge(ctx, target, label, { ffOnly: true });
    return;
  }
  if (mode === 'merge') {
    doMerge(ctx, target, label, {
      noFF: a.has('--no-ff'),
      message: `Merge branch '${branchName}' of ${getRemote(s, remoteName).url}`,
    });
    return;
  }
  if (hasTrackedChanges(s)) {
    throw new GitError('error: cannot pull with rebase: You have unstaged changes.\nerror: Please commit or stash them.', 'rebaseDirty');
  }
  if (canFF) {
    updateTrees(s, s.commits[head].tree, s.commits[target].tree, 'checkout');
    setHead(s, target, `pull --rebase: Fast-forward`);
    ctx.print(`Updating ${head}..${target}\nFast-forward`);
    return;
  }
  const steps = rebaseCommits(s, target, head).map((id) => ({ action: 'pick' as const, commit: id }));
  startRebase(ctx, { onto: target, ontoLabel: label, steps }, false);
}

export function push(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '-u': 'bool',
    '--set-upstream': 'bool',
    '-f': 'bool',
    '--force': 'bool',
    '--force-with-lease': 'bool',
    '--tags': 'bool',
    '-d': 'bool',
    '--delete': 'bool',
    '--all': 'bool',
    '-q': 'bool',
  });
  const s = ctx.s;
  if (!Object.keys(s.remotes).length) {
    throw new GitError(
      'fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>\n\nand then push using the remote name\n\n    git push <name>\n',
      'noRemote',
    );
  }
  const cb = currentBranch(s);
  let remoteName = a.pos[0];
  let refspecs = a.pos.slice(1);
  if (!remoteName) {
    remoteName = defaultRemote(s);
    if (!a.has('--tags', '--all')) {
      if (!cb) {
        throw new GitError(
          'fatal: You are not currently on a branch.\nTo push the history leading to the current (detached HEAD)\nstate now, use\n\n    git push origin HEAD:<name-of-remote-branch>\n',
        );
      }
      const up = s.upstreams[cb];
      if (!up) {
        throw new GitError(
          `fatal: The current branch ${cb} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${cb}\n\nTo have this happen automatically for branches without a tracking\nupstream, see 'push.autoSetupRemote' in 'git help config'.\n`,
          'pushNoUpstream',
          { branch: cb },
        );
      }
      const [upRemote, upBranch] = splitRemoteRef(up);
      remoteName = upRemote;
      refspecs = [`${cb}:${upBranch}`];
    }
  }
  const r = getRemote(s, remoteName);
  if (!refspecs.length && !a.has('--tags')) {
    if (a.has('--all')) refspecs = Object.keys(s.branches);
    else {
      if (!cb) throw new GitError('fatal: You are not currently on a branch.');
      refspecs = [cb];
    }
  }
  if (refspecs.length) requireHead(s);

  const ok: string[] = [];
  const rejected: string[] = [];
  const trailer: string[] = [];
  let rejectKind: 'fetch' | 'nonff' | 'stale' | null = null;
  let forcedAny = false;
  const deleting = a.has('-d', '--delete');

  for (const spec of refspecs) {
    let [src, dst] = spec.includes(':') ? spec.split(':') : [spec, spec];
    if (deleting || src === '') {
      const target = deleting ? src : dst;
      if (has(r.tags, target) && !has(r.branches, target)) {
        delete r.tags[target];
        ok.push(` - [deleted]         ${target}`);
        continue;
      }
      if (!has(r.branches, target)) {
        throw new GitError(`error: unable to delete '${target}': remote ref does not exist\nerror: failed to push some refs to '${r.url}'`);
      }
      delete r.branches[target];
      delete s.remoteBranches[`${remoteName}/${target}`];
      ok.push(` - [deleted]         ${target}`);
      continue;
    }
    if (src === 'HEAD') {
      if (!cb && dst === 'HEAD') throw new GitError('fatal: You are not currently on a branch.');
      if (dst === 'HEAD') dst = cb!;
    }
    if (has(s.tags, src) && !has(s.branches, src)) {
      if (r.tags[src]?.target === s.tags[src].target) continue;
      copyCommits(s.commits, r.commits, s.tags[src].target);
      r.tags[src] = { ...s.tags[src] };
      ok.push(` * [new tag]         ${src} -> ${src}`);
      continue;
    }
    const id = src === 'HEAD' ? headId(s) : (s.branches[src] ?? null);
    if (!id) throw new GitError(`error: src refspec ${src} does not match any\nerror: failed to push some refs to '${r.url}'`);
    const remoteId = r.branches[dst];
    if (remoteId === id) continue;
    let forced = false;
    if (remoteId) {
      const known = has(s.commits, remoteId);
      const ff = known && isAncestor(s.commits, remoteId, id);
      if (!ff) {
        if (a.has('--force-with-lease')) {
          if (s.remoteBranches[`${remoteName}/${dst}`] !== remoteId) {
            rejected.push(` ! [rejected]        ${src} -> ${dst} (stale info)`);
            rejectKind = 'stale';
            continue;
          }
          forced = true;
        } else if (a.has('-f', '--force')) forced = true;
        else {
          rejected.push(` ! [rejected]        ${src} -> ${dst} (${known ? 'non-fast-forward' : 'fetch first'})`);
          rejectKind = known ? 'nonff' : 'fetch';
          continue;
        }
      }
    }
    copyCommits(s.commits, r.commits, id);
    r.branches[dst] = id;
    s.remoteBranches[`${remoteName}/${dst}`] = id;
    forcedAny ||= forced;
    ok.push(
      !remoteId
        ? ` * [new branch]      ${src} -> ${dst}`
        : forced
          ? ` + ${remoteId}...${id} ${src} -> ${dst} (forced update)`
          : `   ${remoteId}..${id}  ${src} -> ${dst}`,
    );
    if (a.has('-u', '--set-upstream') && has(s.branches, src)) {
      s.upstreams[src] = `${remoteName}/${dst}`;
      trailer.push(`branch '${src}' set up to track '${remoteName}/${dst}'.`);
    }
  }
  if (a.has('--tags')) {
    for (const [t, tag] of Object.entries(s.tags)) {
      if (r.tags[t]?.target === tag.target) continue;
      copyCommits(s.commits, r.commits, tag.target);
      r.tags[t] = { ...tag };
      ok.push(` * [new tag]         ${t} -> ${t}`);
    }
  }

  if (!ok.length && !rejected.length) {
    ctx.print('Everything up-to-date');
    return;
  }
  ctx.print(`To ${r.url}`);
  if (ok.length) ctx.print(ok.join('\n'));
  if (rejected.length) {
    ctx.print(rejected.join('\n'), 'err');
    ctx.print(`error: failed to push some refs to '${r.url}'`, 'err');
    if (rejectKind === 'fetch') {
      ctx.print(
        'hint: Updates were rejected because the remote contains work that you do not\n' +
          'hint: have locally. This is usually caused by another repository pushing to\n' +
          "hint: the same ref. If you want to integrate the remote changes, use\nhint: 'git pull' before pushing again.",
        'dim',
      );
      ctx.hint('pushRejectedFetchFirst');
    } else if (rejectKind === 'nonff') {
      ctx.print(
        'hint: Updates were rejected because the tip of your current branch is behind\n' +
          "hint: its remote counterpart. If you want to integrate the remote changes,\nhint: use 'git pull' before pushing again.",
        'dim',
      );
      ctx.hint('pushRejectedNonFF');
    } else ctx.hint('pushStale');
    ctx.failed = true;
  }
  if (trailer.length) ctx.print(trailer.join('\n'));
  if (forcedAny) ctx.hint('pushForce');
}
