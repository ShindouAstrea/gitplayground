// Computes positions for the commit graph: time flows left → right, each
// branch gets a lane (row). Lanes are reused when their ranges don't overlap.
import type { Commit, Head, Tag } from '../git/types';

export interface GraphInput {
  commits: Record<string, Commit>;
  branches: Record<string, string>;
  remoteBranches: Record<string, string>;
  tags: Record<string, Tag>;
  head: Head | null;
  showUnreachable: boolean;
}

export type LabelKind = 'current' | 'head' | 'branch' | 'remote' | 'tag';

export interface GNode {
  id: string;
  x: number;
  y: number;
  lane: number;
  unreachable: boolean;
  isHead: boolean;
  isMerge: boolean;
  commit: Commit;
}

export interface GEdge {
  key: string;
  d: string;
  lane: number;
  unreachable: boolean;
}

export interface GLabel {
  key: string;
  text: string;
  kind: LabelKind;
  x: number;
  y: number;
  width: number;
}

export interface GraphLayout {
  nodes: GNode[];
  edges: GEdge[];
  labels: GLabel[];
  width: number;
  height: number;
  headPos: { x: number; y: number } | null;
}

export const COL = 72;
export const NODE_R = 11;
const PAD_X = 44;
const PAD_TOP = 30;
const LABEL_H = 21;
const LANE_BASE = 52;
const PRIORITY = ['main', 'master', 'develop'];

const labelWidth = (text: string) => Math.round(text.length * 7.1 + 18);

export function layoutGraph(input: GraphInput): GraphLayout {
  const { commits, branches, remoteBranches, tags, head } = input;
  const headId = head ? (head.type === 'branch' ? (branches[head.name] ?? null) : head.id) : null;

  // ---- visible commits
  const reachable = new Set<string>();
  const tips = [
    ...Object.values(branches),
    ...Object.values(remoteBranches),
    ...Object.values(tags).map((t) => t.target),
    ...(headId ? [headId] : []),
  ];
  const stack = [...tips];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id) || !commits[id]) continue;
    reachable.add(id);
    stack.push(...commits[id].parents);
  }
  const visible = input.showUnreachable ? new Set(Object.keys(commits)) : reachable;
  if (!visible.size) return { nodes: [], edges: [], labels: [], width: 0, height: 0, headPos: null };

  const sorted = [...visible].sort((a, b) => commits[a].time - commits[b].time);
  const parentsOf = (id: string) => commits[id].parents.filter((p) => visible.has(p));

  // ---- columns: generation number (longest path from a root)
  const col = new Map<string, number>();
  for (const id of sorted) {
    const ps = parentsOf(id);
    col.set(id, ps.length ? Math.max(...ps.map((p) => col.get(p) ?? 0)) + 1 : 0);
  }

  // ---- lanes
  const lane = new Map<string, number>();
  const occupied: { start: number; end: number }[][] = [];
  const localNames = Object.keys(branches).sort((a, b) => {
    const pa = PRIORITY.indexOf(a);
    const pb = PRIORITY.indexOf(b);
    if (pa !== pb) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    return a.localeCompare(b);
  });
  const mainName = localNames.find((n) => PRIORITY.includes(n));
  const childCount = new Map<string, number>();
  for (const id of sorted) for (const p of parentsOf(id)) childCount.set(p, (childCount.get(p) ?? 0) + 1);
  const orphanTips = sorted.filter((id) => !reachable.has(id) && !childCount.get(id)).reverse();

  const order: { tip: string; main: boolean }[] = [
    ...localNames.map((n) => ({ tip: branches[n], main: n === mainName })),
    ...(head?.type === 'detached' ? [{ tip: head.id, main: false }] : []),
    ...Object.keys(remoteBranches)
      .sort()
      .map((n) => ({ tip: remoteBranches[n], main: false })),
    ...Object.keys(tags)
      .sort()
      .map((n) => ({ tip: tags[n].target, main: false })),
    ...orphanTips.map((tip) => ({ tip, main: false })),
    ...[...sorted].reverse().map((tip) => ({ tip, main: false })),
  ];

  for (const { tip, main } of order) {
    const chain: string[] = [];
    let cur: string | undefined = tip;
    while (cur && visible.has(cur) && !lane.has(cur)) {
      chain.push(cur);
      cur = parentsOf(cur)[0];
    }
    if (!chain.length) continue;
    const fork = cur && visible.has(cur) ? col.get(cur)! : col.get(chain[chain.length - 1])!;
    const range = { start: fork, end: col.get(chain[0])! };
    let l = 0;
    if (!main) {
      l = mainName ? 1 : 0;
      while (occupied[l]?.some((r) => range.start <= r.end && r.start <= range.end)) l++;
    }
    (occupied[l] ??= []).push(range);
    for (const id of chain) lane.set(id, l);
  }

  // ---- labels per commit
  const labelsOf = new Map<string, { key: string; text: string; kind: LabelKind }[]>();
  const add = (id: string, key: string, text: string, kind: LabelKind) => {
    if (!visible.has(id)) return;
    const list = labelsOf.get(id) ?? [];
    list.push({ key, text, kind });
    labelsOf.set(id, list);
  };
  if (head?.type === 'detached') add(head.id, 'HEAD', 'HEAD', 'head');
  for (const n of localNames) {
    const isCurrent = head?.type === 'branch' && head.name === n;
    add(branches[n], `b:${n}`, isCurrent ? `HEAD → ${n}` : n, isCurrent ? 'current' : 'branch');
  }
  for (const n of Object.keys(remoteBranches).sort()) add(remoteBranches[n], `r:${n}`, n, 'remote');
  for (const n of Object.keys(tags).sort()) add(tags[n].target, `t:${n}`, `🏷 ${n}`, 'tag');
  for (const list of labelsOf.values()) list.sort((a, b) => (a.kind === 'current' || a.kind === 'head' ? -1 : 0) - (b.kind === 'current' || b.kind === 'head' ? -1 : 0));

  // label rows inside each lane (avoid horizontal overlaps)
  const laneCount = Math.max(...lane.values()) + 1;
  const rowsUsed = new Array<number>(laneCount).fill(0);
  const rowEnds: number[][] = Array.from({ length: laneCount }, () => []);
  const placed: { key: string; text: string; kind: LabelKind; id: string; row: number; x: number; width: number }[] = [];
  const xOf = (id: string) => PAD_X + col.get(id)! * COL;
  for (const id of [...sorted].sort((a, b) => col.get(a)! - col.get(b)!)) {
    const list = labelsOf.get(id);
    if (!list) continue;
    const l = lane.get(id)!;
    let row = 0;
    for (const lab of list) {
      const width = labelWidth(lab.text);
      const x = xOf(id) - Math.min(width / 2, 30);
      while ((rowEnds[l][row] ?? -Infinity) + 6 > x) row++;
      rowEnds[l][row] = x + width;
      rowsUsed[l] = Math.max(rowsUsed[l], row + 1);
      placed.push({ ...lab, id, row, x, width });
      row++;
    }
  }

  const laneY: number[] = [];
  let y = PAD_TOP;
  for (let l = 0; l < laneCount; l++) {
    laneY[l] = y;
    y += LANE_BASE + Math.max(1, rowsUsed[l]) * LABEL_H;
  }

  const nodes: GNode[] = sorted.map((id) => ({
    id,
    x: xOf(id),
    y: laneY[lane.get(id)!],
    lane: lane.get(id)!,
    unreachable: !reachable.has(id),
    isHead: id === headId,
    isMerge: commits[id].parents.length > 1,
    commit: commits[id],
  }));
  const pos = new Map(nodes.map((n) => [n.id, n]));

  const edges: GEdge[] = [];
  for (const n of nodes) {
    parentsOf(n.id).forEach((p, i) => {
      const a = pos.get(p)!;
      let d: string;
      if (a.y === n.y) d = `M ${a.x} ${a.y} L ${n.x} ${n.y}`;
      else {
        const dx = n.x - a.x;
        const bend = Math.min(COL, dx);
        if (i === 0) {
          // branch leaving its parent: bend near the parent, then run along the child's lane
          d = `M ${a.x} ${a.y} C ${a.x + bend * 0.55} ${a.y}, ${a.x + bend * 0.45} ${n.y}, ${a.x + bend} ${n.y} L ${n.x} ${n.y}`;
        } else {
          // merged branch: run along its lane, bend near the merge commit
          const sx = n.x - bend;
          d = `M ${a.x} ${a.y} L ${sx} ${a.y} C ${sx + bend * 0.55} ${a.y}, ${sx + bend * 0.45} ${n.y}, ${n.x} ${n.y}`;
        }
      }
      edges.push({
        key: `${n.id}-${p}`,
        d,
        lane: i === 0 ? n.lane : a.lane,
        unreachable: n.unreachable || a.unreachable,
      });
    });
  }

  const labels: GLabel[] = placed.map((p) => {
    const node = pos.get(p.id)!;
    return { key: p.key, text: p.text, kind: p.kind, x: p.x, y: node.y + NODE_R + 8 + p.row * LABEL_H, width: p.width };
  });

  const maxX = Math.max(...nodes.map((n) => n.x), ...labels.map((l) => l.x + l.width));
  const headNode = headId ? pos.get(headId) : undefined;
  return {
    nodes,
    edges,
    labels,
    width: maxX + PAD_X,
    height: y + 4,
    headPos: headNode ? { x: headNode.x, y: headNode.y } : null,
  };
}
