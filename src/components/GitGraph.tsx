import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { firstLine } from '../git/repo';
import { layoutGraph, NODE_R, type GraphInput } from './graphLayout';

interface Props {
  input: GraphInput;
  selected?: string | null;
  onCommitClick?: (id: string) => void;
  unreachableLabel: string;
  compact?: boolean;
}

const LANES = 6;

export function GitGraph({ input, selected, onCommitClick, unreachableLabel, compact }: Props) {
  const layout = useMemo(() => layoutGraph(input), [input]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headX = layout.headPos?.x ?? layout.width;

  // keep HEAD (or the newest commit) in view after every change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = headX;
    if (target > el.scrollLeft + el.clientWidth - 90 || target < el.scrollLeft + 40) {
      el.scrollTo({ left: Math.max(0, target - el.clientWidth * 0.6), behavior: 'smooth' });
    }
  }, [headX, layout.width]);

  return (
    <div className={`graph-scroll${compact ? ' compact' : ''}`} ref={scrollRef}>
      <svg width={Math.max(layout.width, 10)} height={Math.max(layout.height, 10)} className="graph-svg">
        <g>
          {layout.edges.map((e) => (
            <path
              key={e.key}
              d={e.d}
              className={`g-edge lane-${e.lane % LANES}${e.unreachable ? ' unreachable' : ''}`}
              style={{ d: `path("${e.d}")` } as CSSProperties}
            />
          ))}
        </g>
        <g>
          {layout.nodes.map((n) => (
            <g
              key={n.id}
              className={`g-node lane-${n.lane % LANES}${n.unreachable ? ' unreachable' : ''}${n.isHead ? ' head' : ''}${
                selected === n.id ? ' selected' : ''
              }`}
              style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
              onClick={() => onCommitClick?.(n.id)}
            >
              <title>
                {`${n.id} — ${firstLine(n.commit.message)}\n${n.commit.author}${n.unreachable ? `\n(${unreachableLabel})` : ''}`}
              </title>
              <g className="g-node-inner">
                {n.isHead && <circle r={NODE_R + 5} className="g-head-ring" />}
                <circle r={NODE_R} className="g-dot" />
                {n.isMerge && <circle r={NODE_R - 5} className="g-merge-dot" />}
                <text y={-NODE_R - 7} className="g-hash">
                  {n.id}
                </text>
              </g>
            </g>
          ))}
        </g>
        <g>
          {layout.labels.map((l) => (
            <g key={l.key} className={`g-label ${l.kind}`} style={{ transform: `translate(${l.x}px, ${l.y}px)` }}>
              <rect width={l.width} height={18} rx={9} />
              <text x={l.width / 2} y={13}>
                {l.text}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
