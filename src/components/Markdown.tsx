// Renders the tiny markdown subset used by the dictionaries:
// paragraphs (blank line), "- " bullets, `code` and **bold**.
import type { ReactNode } from 'react';

interface Props {
  text: string;
  /** When set, inline code that looks like a command becomes clickable */
  onCode?: (code: string) => void;
  inline?: boolean;
  className?: string;
}

const COMMAND = /^(git|echo|cat|ls|nano|touch|rm|mv)\b/;

function renderInline(text: string, onCode?: (code: string) => void, keyBase = ''): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      const code = part.slice(1, -1);
      if (onCode && COMMAND.test(code) && !code.includes('<')) {
        return (
          <code key={key} className="clickable" onClick={() => onCode(code)} title="↵">
            {code}
          </code>
        );
      }
      return <code key={key}>{code}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function Markdown({ text, onCode, inline, className }: Props) {
  if (inline) return <span className={className}>{renderInline(text, onCode)}</span>;
  const blocks = text.split(/\n{2,}/);
  const out: ReactNode[] = [];
  blocks.forEach((block, b) => {
    const lines = block.split('\n');
    let para: string[] = [];
    let bullets: string[] = [];
    const flushPara = () => {
      if (para.length) out.push(<p key={`p${b}-${out.length}`}>{renderInline(para.join(' '), onCode, `p${b}${out.length}`)}</p>);
      para = [];
    };
    const flushList = () => {
      if (bullets.length) {
        out.push(
          <ul key={`u${b}-${out.length}`}>
            {bullets.map((item, i) => (
              <li key={i}>{renderInline(item, onCode, `l${b}${i}`)}</li>
            ))}
          </ul>,
        );
      }
      bullets = [];
    };
    for (const line of lines) {
      if (line.startsWith('- ')) {
        flushPara();
        bullets.push(line.slice(2));
      } else {
        flushList();
        if (line.trim()) para.push(line);
      }
    }
    flushPara();
    flushList();
  });
  return <div className={`md ${className ?? ''}`}>{out}</div>;
}
