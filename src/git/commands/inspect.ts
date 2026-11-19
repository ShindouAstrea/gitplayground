// log, show, diff, reflog, blame
import { parseArgs } from '../args';
import { allPaths, countChanges, diffLines, splitLines, unifiedHunks } from '../diff';
import {
  ancestors,
  authorLine,
  Ctx,
  decorationParts,
  firstLine,
  formatDate,
  GitError,
  has,
  headId,
  headTree,
  requireHead,
  requireRev,
  resolveRev,
  treeOf,
} from '../repo';
import type { Commit, Part, Tree } from '../types';
import { statSummary } from './common';

function printDiff(ctx: Ctx, from: Tree, to: Tree, paths?: string[] | null) {
  for (const p of allPaths(from, to)) {
    if (from[p] === to[p]) continue;
    if (paths?.length && !paths.some((sp) => p === sp || p.startsWith(sp.replace(/\/$/, '') + '/'))) continue;
    ctx.parts({ t: `diff --git a/${p} b/${p}`, c: 'bold' });
    if (from[p] === undefined) ctx.parts({ t: 'new file mode 100644', c: 'bold' });
    if (to[p] === undefined) ctx.parts({ t: 'deleted file mode 100644', c: 'bold' });
    ctx.parts({ t: from[p] === undefined ? '--- /dev/null' : `--- a/${p}`, c: 'bold' });
    ctx.parts({ t: to[p] === undefined ? '+++ /dev/null' : `+++ b/${p}`, c: 'bold' });
    for (const line of unifiedHunks(from[p], to[p])) {
      const c = line.startsWith('@@') ? 'cyan' : line.startsWith('+') ? 'green' : line.startsWith('-') ? 'red' : undefined;
      ctx.parts({ t: line, c });
    }
  }
}

function printStat(ctx: Ctx, from: Tree, to: Tree) {
  const changed = allPaths(from, to).filter((p) => from[p] !== to[p]);
  const width = Math.max(0, ...changed.map((p) => p.length));
  for (const p of changed) {
    const { ins, del } = countChanges(from[p], to[p]);
    ctx.parts(
      { t: ` ${p.padEnd(width)} | ${String(ins + del).padStart(2)} ` },
      { t: '+'.repeat(Math.min(ins, 30)), c: 'green' },
      { t: '-'.repeat(Math.min(del, 30)), c: 'red' },
    );
  }
  const summary = statSummary(from, to);
  if (summary.length) ctx.print(summary[0]);
}

function printCommitLong(ctx: Ctx, c: Commit) {
  ctx.parts({ t: `commit ${c.id}`, c: 'yellow' }, ...decorationParts(ctx.s, c.id));
  if (c.parents.length > 1) ctx.print(`Merge: ${c.parents.join(' ')}`);
  ctx.print(`Author: ${authorLine(c.author)}\nDate:   ${formatDate(c.time)}\n`);
  ctx.print(
    c.message
      .split('\n')
      .map((l) => (l ? '    ' + l : ''))
      .join('\n'),
  );
}

/** Very small `--graph` renderer: good enough to read branches and merges */
function graphPrefixes(order: Commit[], visible: Set<string>): { id?: string; prefix: string }[] {
  const cols: string[] = [];
  const rows: { id?: string; prefix: string }[] = [];
  for (const c of order) {
    let col = cols.indexOf(c.id);
    if (col < 0) {
      cols.push(c.id);
      col = cols.length - 1;
    }
    rows.push({ id: c.id, prefix: cols.map((_, i) => (i === col ? '*' : '|')).join(' ') });
    const parents = c.parents.filter((p) => visible.has(p));
    if (!parents.length) {
      cols.splice(col, 1);
      if (col < cols.length) rows.push({ prefix: cols.map((_, i) => (i < col ? '|' : '/')).join(' ') });
      continue;
    }
    cols[col] = parents[0];
    if (parents.length > 1 && !cols.includes(parents[1])) {
      cols.splice(col + 1, 0, parents[1]);
      rows.push({ prefix: cols.map((_, i) => (i <= col ? '|' : '\\')).join(' ') });
    }
    // collapse columns that now wait for the same commit
    for (let j = cols.length - 1; j > 0; j--) {
      const i = cols.indexOf(cols[j]);
      if (i < j) {
        cols.splice(j, 1);
        const left = cols.slice(0, j).map(() => '|').join(' ');
        rows.push({ prefix: left + '/' + ' /'.repeat(cols.length - j) });
      }
    }
  }
  return rows;
}

export function log(ctx: Ctx, argv: string[]) {
  const a = parseArgs(
    argv,
    {
      '--oneline': 'bool',
      '--all': 'bool',
      '--graph': 'bool',
      '-n': 'value',
      '--max-count': 'value',
      '--decorate': 'bool',
      '--reverse': 'bool',
      '--stat': 'bool',
      '-p': 'bool',
      '--patch': 'bool',
      '--first-parent': 'bool',
      '--author': 'value',
      '--grep': 'value',
      '--pretty': 'value',
      '--format': 'value',
      '--no-merges': 'bool',
      '--merges': 'bool',
      '-S': 'value',
    },
    true,
  );
  const s = ctx.s;
  const includes: string[] = [];
  const excludes: string[] = [];
  for (const p of a.pos) {
    if (p.includes('...')) throw new GitError("error: symmetric ranges ('A...B') are not supported in this simulator", 'unsupported', { option: '...' });
    if (p.includes('..')) {
      const [x, y] = p.split('..');
      excludes.push(requireRev(s, x || 'HEAD'));
      includes.push(requireRev(s, y || 'HEAD'));
    } else if (p.startsWith('^')) excludes.push(requireRev(s, p.slice(1)));
    else includes.push(requireRev(s, p));
  }
  if (a.has('--all')) {
    includes.push(...Object.values(s.branches), ...Object.values(s.remoteBranches), ...Object.values(s.tags).map((t) => t.target));
    const h = headId(s);
    if (h) includes.push(h);
  }
  if (!includes.length) includes.push(requireHead(s));

  const firstParent = a.has('--first-parent');
  const walk = (tip: string) => {
    if (!firstParent) return ancestors(s.commits, tip);
    const set = new Set<string>();
    for (let id: string | undefined = tip; id; id = s.commits[id]?.parents[0]) set.add(id);
    return set;
  };
  const excluded = new Set(excludes.flatMap((e) => [...ancestors(s.commits, e)]));
  const set = new Set<string>();
  for (const tip of includes) for (const id of walk(tip)) if (!excluded.has(id)) set.add(id);

  let list = [...set].map((id) => s.commits[id]).sort((x, y) => y.time - x.time);
  const author = a.value('--author');
  const grep = a.value('--grep');
  const pickaxe = a.value('-S');
  if (author) list = list.filter((c) => c.author.toLowerCase().includes(author.toLowerCase()));
  if (grep) list = list.filter((c) => c.message.toLowerCase().includes(grep.toLowerCase()));
  if (a.has('--no-merges')) list = list.filter((c) => c.parents.length < 2);
  if (a.has('--merges')) list = list.filter((c) => c.parents.length > 1);
  if (pickaxe) {
    const count = (t: Tree) => Object.values(t).reduce((n, txt) => n + txt.split(pickaxe).length - 1, 0);
    list = list.filter((c) => count(c.tree) !== count(treeOf(s, c.parents[0])));
  }
  if (a.paths?.length) {
    const paths = a.paths;
    list = list.filter((c) => {
      const parent = treeOf(s, c.parents[0]);
      return paths.some((p) => c.tree[p] !== parent[p]);
    });
  }
  const max = a.value('-n', '--max-count');
  if (max !== undefined) list = list.slice(0, Number(max));
  if (a.has('--reverse')) list.reverse();

  const pretty = a.value('--pretty', '--format');
  const oneline = a.has('--oneline') || pretty === 'oneline';
  const graph = a.has('--graph') && !a.has('--reverse');
  const rows = graph ? graphPrefixes(list, new Set(list.map((c) => c.id))) : list.map((c) => ({ id: c.id, prefix: '' }));
  const pad = graph ? ' ' : '';

  for (const row of rows) {
    if (!row.id) {
      ctx.parts({ t: row.prefix, c: 'red' });
      continue;
    }
    const c = s.commits[row.id];
    const prefix: Part[] = graph ? [{ t: row.prefix + pad, c: 'red' }] : [];
    if (oneline) {
      ctx.parts(...prefix, { t: c.id, c: 'yellow' }, ...decorationParts(s, c.id), { t: ' ' + firstLine(c.message) });
    } else {
      const sub = new Ctx(s);
      printCommitLong(sub, c);
      sub.out.forEach((line, i) => {
        const lead = graph ? (i === 0 ? prefix : [{ t: row.prefix.replace(/\*/g, '|') + pad, c: 'red' as const }]) : [];
        ctx.parts(...lead, ...(line.parts ?? [{ t: line.text ?? '' }]));
      });
      ctx.print('');
    }
    if (a.has('--stat')) printStat(ctx, treeOf(s, c.parents[0]), c.tree);
    if (a.has('-p', '--patch')) printDiff(ctx, treeOf(s, c.parents[0]), c.tree);
  }
}

export function show(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '--stat': 'bool', '--oneline': 'bool', '--name-only': 'bool', '-s': 'bool', '--no-patch': 'bool' });
  const s = ctx.s;
  const target = a.pos[0] ?? 'HEAD';
  const colon = target.indexOf(':');
  if (colon >= 0) {
    const revPart = target.slice(0, colon);
    const path = target.slice(colon + 1).replace(/^\.\//, '');
    const tree = revPart ? treeOf(s, requireRev(s, revPart)) : s.index;
    if (!has(tree, path)) throw new GitError(`fatal: path '${path}' does not exist in '${revPart || 'the index'}'`);
    ctx.print(tree[path].replace(/\n$/, ''));
    return;
  }
  const id = requireRev(s, target);
  const tag = s.tags[target];
  if (tag?.message) {
    ctx.parts({ t: `tag ${target}`, c: 'yellow' });
    ctx.print(`Tagger: ${authorLine('You')}\n\n${tag.message}\n`);
  }
  const c = s.commits[id];
  if (a.has('--oneline')) ctx.parts({ t: c.id, c: 'yellow' }, ...decorationParts(s, c.id), { t: ' ' + firstLine(c.message) });
  else {
    printCommitLong(ctx, c);
    ctx.print('');
  }
  if (a.has('-s', '--no-patch') || c.parents.length > 1) return;
  const parent = treeOf(s, c.parents[0]);
  if (a.has('--name-only')) {
    for (const p of allPaths(parent, c.tree)) if (parent[p] !== c.tree[p]) ctx.print(p);
  } else if (a.has('--stat')) printStat(ctx, parent, c.tree);
  else printDiff(ctx, parent, c.tree);
}

export function diff(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, {
    '--staged': 'bool',
    '--cached': 'bool',
    '--stat': 'bool',
    '--name-only': 'bool',
    '--name-status': 'bool',
  });
  const s = ctx.s;
  const revs: string[] = [];
  const paths: string[] = [...(a.paths ?? [])];
  for (const p of a.pos) {
    if (p.includes('..') && !p.includes('...')) {
      const [x, y] = p.split('..');
      revs.push(x || 'HEAD', y || 'HEAD');
    } else if (a.paths === null && !resolveRev(s, p) && (has(s.workdir, p) || has(s.index, p))) paths.push(p);
    else revs.push(p);
  }
  let from: Tree;
  let to: Tree;
  const staged = a.has('--staged', '--cached');
  if (staged) {
    from = revs[0] ? treeOf(s, requireRev(s, revs[0])) : headTree(s);
    to = s.index;
  } else if (revs.length >= 2) {
    from = treeOf(s, requireRev(s, revs[0]));
    to = treeOf(s, requireRev(s, revs[1]));
  } else {
    from = revs.length ? treeOf(s, requireRev(s, revs[0])) : s.index;
    // working tree, tracked files only
    to = {};
    for (const p of allPaths(s.index, revs.length ? from : {})) if (has(s.workdir, p)) to[p] = s.workdir[p];
    if (!revs.length) {
      for (const p of Object.keys(s.conflicts)) {
        ctx.parts({ t: `* Unmerged path ${p}`, c: 'red' });
        from = { ...from };
        delete from[p];
        delete to[p];
      }
    }
  }
  if (paths.length) {
    const keep = (t: Tree) =>
      Object.fromEntries(Object.entries(t).filter(([p]) => paths.some((sp) => p === sp || p.startsWith(sp.replace(/\/$/, '') + '/'))));
    from = keep(from);
    to = keep(to);
  }
  if (a.has('--name-only') || a.has('--name-status')) {
    for (const p of allPaths(from, to)) {
      if (from[p] === to[p]) continue;
      const st = from[p] === undefined ? 'A' : to[p] === undefined ? 'D' : 'M';
      ctx.print(a.has('--name-status') ? `${st}\t${p}` : p);
    }
    return;
  }
  if (a.has('--stat')) printStat(ctx, from, to);
  else printDiff(ctx, from, to);
}

export function reflog(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '-n': 'value', '--max-count': 'value', '--oneline': 'bool' }, true);
  const s = ctx.s;
  const sub = a.pos[0];
  if (sub && sub !== 'show' && sub !== 'HEAD') {
    throw new GitError(`error: only the HEAD reflog is available in this simulator`, 'unsupported', { option: sub });
  }
  const max = Number(a.value('-n', '--max-count') ?? Infinity);
  s.reflog.slice(0, max).forEach((e, i) => {
    ctx.parts({ t: e.id, c: 'yellow' }, ...(i === 0 ? decorationParts(s, e.id) : []), { t: ` HEAD@{${i}}: ${e.message}` });
  });
}

export function blame(ctx: Ctx, argv: string[]) {
  const a = parseArgs(argv, { '-L': 'value' });
  const s = ctx.s;
  const args = [...a.pos, ...(a.paths ?? [])];
  const file = args[args.length - 1];
  if (!file) throw new GitError('usage: git blame [<options>] [<rev>] <file>');
  const start = args.length > 1 ? requireRev(s, args[0]) : requireHead(s);
  const content = s.commits[start].tree[file];
  if (content === undefined) throw new GitError(`fatal: no such path '${file}' in ${args.length > 1 ? args[0] : 'HEAD'}`);
  const lines = splitLines(content);
  const owner: (string | null)[] = lines.map(() => null);
  const pos = lines.map((_, i) => i);
  let cur: string | undefined = start;
  while (cur && owner.some((o) => o === null)) {
    const c: Commit = s.commits[cur];
    const parentId: string | undefined = c.parents[0];
    const parentText = parentId ? s.commits[parentId].tree[file] : undefined;
    if (parentText === undefined) {
      owner.forEach((o, i) => o === null && (owner[i] = cur!));
      break;
    }
    const map: number[] = [];
    let pi = 0;
    for (const op of diffLines(splitLines(parentText), splitLines(c.tree[file] ?? ''))) {
      if (op.type === ' ') map.push(pi++);
      else if (op.type === '-') pi++;
      else map.push(-1);
    }
    lines.forEach((_, i) => {
      if (owner[i] !== null) return;
      const p = map[pos[i]];
      if (p === -1 || p === undefined) owner[i] = cur!;
      else pos[i] = p;
    });
    cur = parentId;
  }
  const width = String(lines.length).length;
  lines.forEach((line, i) => {
    const c = s.commits[owner[i] ?? start];
    const date = formatDate(c.time).split(' ').slice(1, 4).join(' ');
    ctx.parts({ t: c.id, c: 'yellow' }, { t: ` (${c.author.padEnd(8)} ${date} ${String(i + 1).padStart(width)}) ${line}` });
  });
}
