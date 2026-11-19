import { Markdown } from '../components/Markdown';
import { exercises } from '../exercises/defs';
import { fmt, useI18n } from '../i18n';
import { useProgress } from '../store/progress';

const HERO_GRAPH = (
  <svg viewBox="0 0 360 140" className="hero-graph" aria-hidden>
    <path d="M 30 40 L 330 40" className="g-edge lane-0" />
    <path d="M 90 40 C 120 40, 110 100, 150 100 L 250 100 C 280 100, 270 40, 300 40" className="g-edge lane-1" />
    {[30, 90, 160, 230, 300].map((x, i) => (
      <circle key={x} cx={x} cy={40} r={11} className={`hero-dot lane-0 d${i}`} />
    ))}
    {[150, 210].map((x, i) => (
      <circle key={x} cx={x} cy={100} r={11} className={`hero-dot lane-1 d${i + 2}`} />
    ))}
    <g className="g-label current" transform="translate(268 60)">
      <rect width="92" height="18" rx="9" />
      <text x="46" y="13">
        HEAD → main
      </text>
    </g>
    <g className="g-label branch" transform="translate(180 118)">
      <rect width="62" height="18" rx="9" />
      <text x="31" y="13">
        feature
      </text>
    </g>
  </svg>
);

export function Home() {
  const { t } = useI18n();
  const h = t.ui.home;
  const progress = useProgress();
  const done = exercises.filter((e) => progress.exercises[e.id]?.done).length;
  const cards = [
    { key: 'practice', href: '#/practice', icon: '🎯' },
    { key: 'sandbox', href: '#/sandbox', icon: '🧪' },
    { key: 'guide', href: '#/guide', icon: '📖' },
    { key: 'quiz', href: '#/quiz', icon: '🧠' },
  ] as const;

  return (
    <div className="page home">
      <section className="hero">
        <div>
          <h1>{h.title}</h1>
          <p className="lead">{h.subtitle}</p>
          <div className="row">
            <a className="btn primary" href="#/practice">
              {h.start} →
            </a>
            <a className="btn ghost" href="#/guide">
              {h.openGuide}
            </a>
          </div>
          <p className="muted small">{fmt(h.progress, { done, total: exercises.length })}</p>
          <div className="bar">
            <span style={{ width: `${(done / exercises.length) * 100}%` }} />
          </div>
        </div>
        {HERO_GRAPH}
      </section>

      <section className="card-grid four">
        {cards.map((c) => (
          <a key={c.key} className="card feature-card" href={c.href}>
            <span className="feature-icon">{c.icon}</span>
            <h3>{h.cards[c.key].title}</h3>
            <p className="muted">{h.cards[c.key].text}</p>
          </a>
        ))}
      </section>

      <section>
        <h2>{h.pathTitle}</h2>
        <ol className="path">
          {([1, 2, 3, 4] as const).map((level) => {
            const list = exercises.filter((e) => e.level === level);
            const n = list.filter((e) => progress.exercises[e.id]?.done).length;
            const first = list.find((e) => !progress.exercises[e.id]?.done) ?? list[0];
            return (
              <li key={level} className={n === list.length ? 'complete' : ''}>
                <a href={`#/practice/${first.id}`}>
                  <span className="level-num">{level}</span>
                  <span>
                    <strong>{t.ui.exerciseLevels[level].title}</strong>
                    <span className="muted small block">{t.ui.exerciseLevels[level].text}</span>
                  </span>
                  <span className="muted small">
                    {n}/{list.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2>{h.howTitle}</h2>
        <ul className="how">
          {h.how.map((line, i) => (
            <li key={i}>
              <Markdown inline text={line} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
