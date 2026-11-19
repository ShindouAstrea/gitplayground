// Line diffs, unified diff output and a diff3 three-way merge.
import type { ConflictInfo, Tree } from './types';

export function splitLines(text: string): string[] {
  if (text === '') return [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function joinLines(lines: string[]): string {
  return lines.length ? lines.join('\n') + '\n' : '';
}

/** Normalizes user-entered file content: LF endings and a trailing newline */
export function normalizeContent(text: string): string {
  return joinLines(splitLines(text.replace(/\r\n?/g, '\n')));
}

export type DiffOp = { type: ' ' | '-' | '+'; line: string };

/** LCS based line diff (files are tiny, O(n*m) is fine) */
export function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: ' ', line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: '-', line: a[i++] });
    } else {
      ops.push({ type: '+', line: b[j++] });
    }
  }
  while (i < n) ops.push({ type: '-', line: a[i++] });
  while (j < m) ops.push({ type: '+', line: b[j++] });
  return ops;
}

export function countChanges(oldText: string | undefined, newText: string | undefined) {
  let ins = 0;
  let del = 0;
  for (const op of diffLines(splitLines(oldText ?? ''), splitLines(newText ?? ''))) {
    if (op.type === '+') ins++;
    else if (op.type === '-') del++;
  }
  return { ins, del };
}

/** Unified diff lines (without the `diff --git` header) with 2 lines of context */
export function unifiedHunks(oldText: string | undefined, newText: string | undefined, context = 2): string[] {
  const ops = diffLines(splitLines(oldText ?? ''), splitLines(newText ?? ''));
  const out: string[] = [];
  const changed = ops.map((o) => o.type !== ' ');
  let k = 0;
  while (k < ops.length) {
    if (!changed[k]) {
      k++;
      continue;
    }
    const start = Math.max(0, k - context);
    let end = k;
    // extend hunk while changes are within 2*context of each other
    while (end < ops.length) {
      if (changed[end]) {
        end++;
        continue;
      }
      let next = end;
      while (next < ops.length && !changed[next]) next++;
      if (next < ops.length && next - end <= context * 2) end = next;
      else break;
    }
    end = Math.min(ops.length, end + context);
    // line numbers
    let oldLine = 1;
    let newLine = 1;
    for (let x = 0; x < start; x++) {
      if (ops[x].type !== '+') oldLine++;
      if (ops[x].type !== '-') newLine++;
    }
    const slice = ops.slice(start, end);
    const oldCount = slice.filter((o) => o.type !== '+').length;
    const newCount = slice.filter((o) => o.type !== '-').length;
    out.push(`@@ -${oldCount ? oldLine : oldLine - 1},${oldCount} +${newCount ? newLine : newLine - 1},${newCount} @@`);
    for (const o of slice) out.push(o.type + o.line);
    k = end;
  }
  return out;
}

interface Hunk {
  aStart: number;
  aEnd: number;
  lines: string[];
  side: 0 | 1;
}

function hunks(base: string[], other: string[], side: 0 | 1): Hunk[] {
  const result: Hunk[] = [];
  let ai = 0;
  let cur: Hunk | null = null;
  for (const op of diffLines(base, other)) {
    if (op.type === ' ') {
      if (cur) result.push(cur);
      cur = null;
      ai++;
    } else if (op.type === '-') {
      cur ??= { aStart: ai, aEnd: ai, lines: [], side };
      ai++;
      cur.aEnd = ai;
    } else {
      cur ??= { aStart: ai, aEnd: ai, lines: [], side };
      cur.lines.push(op.line);
    }
  }
  if (cur) result.push(cur);
  return result;
}

/** Classic diff3: changes on different regions merge cleanly, overlapping ones conflict */
export function merge3(
  base: string[],
  ours: string[],
  theirs: string[],
  labels: { ours: string; theirs: string },
): { lines: string[]; conflict: boolean } {
  const all = [...hunks(base, ours, 0), ...hunks(base, theirs, 1)].sort(
    (x, y) => x.aStart - y.aStart || x.aEnd - y.aEnd,
  );
  const out: string[] = [];
  let pos = 0;
  let conflict = false;
  let i = 0;
  while (i < all.length) {
    const group = [all[i]];
    const start = all[i].aStart;
    let end = all[i].aEnd;
    i++;
    while (i < all.length && all[i].aStart <= end) {
      group.push(all[i]);
      end = Math.max(end, all[i].aEnd);
      i++;
    }
    out.push(...base.slice(pos, start));
    const build = (side: 0 | 1) => {
      const r: string[] = [];
      let p = start;
      for (const h of group.filter((g) => g.side === side)) {
        r.push(...base.slice(p, h.aStart), ...h.lines);
        p = h.aEnd;
      }
      r.push(...base.slice(p, end));
      return r;
    };
    const sides = new Set(group.map((h) => h.side));
    if (sides.size === 1) {
      out.push(...build(group[0].side));
    } else {
      const o = build(0);
      const t = build(1);
      if (o.join('\n') === t.join('\n')) out.push(...o);
      else {
        conflict = true;
        out.push(`<<<<<<< ${labels.ours}`, ...o, '=======', ...t, `>>>>>>> ${labels.theirs}`);
      }
    }
    pos = end;
  }
  out.push(...base.slice(pos));
  return { lines: out, conflict };
}

export interface TreeMerge {
  /** Content for the working directory (conflicted files contain markers) */
  tree: Tree;
  conflicts: Record<string, ConflictInfo>;
  messages: string[];
}

export function allPaths(...trees: Record<string, unknown>[]): string[] {
  return [...new Set(trees.flatMap((t) => Object.keys(t)))].sort();
}

export function mergeTrees(
  base: Tree,
  ours: Tree,
  theirs: Tree,
  labels: { ours: string; theirs: string },
): TreeMerge {
  const tree: Tree = {};
  const conflicts: Record<string, ConflictInfo> = {};
  const messages: string[] = [];
  for (const p of allPaths(base, ours, theirs)) {
    const b = base[p];
    const o = ours[p];
    const t = theirs[p];
    let result: string | undefined;
    if (o === t) result = o;
    else if (b === o) result = t;
    else if (b === t) result = o;
    else if (o === undefined || t === undefined) {
      result = o ?? t;
      conflicts[p] = { base: b, ours: o, theirs: t };
      const deletedIn = o === undefined ? labels.ours : labels.theirs;
      const modifiedIn = o === undefined ? labels.theirs : labels.ours;
      messages.push(`CONFLICT (modify/delete): ${p} deleted in ${deletedIn} and modified in ${modifiedIn}.`);
    } else {
      messages.push(`Auto-merging ${p}`);
      const m = merge3(splitLines(b ?? ''), splitLines(o), splitLines(t), labels);
      result = joinLines(m.lines);
      if (m.conflict) {
        conflicts[p] = { base: b, ours: o, theirs: t };
        messages.push(`CONFLICT (${b === undefined ? 'add/add' : 'content'}): Merge conflict in ${p}`);
      }
    }
    if (result !== undefined) tree[p] = result;
  }
  return { tree, conflicts, messages };
}

export function hasConflictMarkers(text: string | undefined): boolean {
  return !!text && /^(<{7}|={7}|>{7})( |$)/m.test(text);
}
