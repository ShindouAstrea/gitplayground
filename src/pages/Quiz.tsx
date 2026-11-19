import { useMemo, useRef, useState } from 'react';
import { Markdown } from '../components/Markdown';
import { quizItems } from '../content/quiz';
import { matchesAnswer } from '../content/quizMatch';
import type { GuideCategory, QuizItem } from '../content/types';
import { fmt, useI18n } from '../i18n';
import { recordQuiz, useProgress, type Progress } from '../store/progress';

type Phase = 'setup' | 'question' | 'feedback' | 'done';

/** Least-known questions first (more misses, fewer hits), shuffled within ties */
function pickQuestions(pool: QuizItem[], count: number, progress: Progress): QuizItem[] {
  const weight = (q: QuizItem) => {
    const st = progress.quiz[q.id];
    return st ? st.right - st.wrong * 2 : -0.5;
  };
  return [...pool]
    .map((q) => ({ q, w: weight(q) + Math.random() * 0.9 }))
    .sort((a, b) => a.w - b.w)
    .slice(0, count)
    .map((x) => x.q);
}

export function Quiz() {
  const { t } = useI18n();
  const q = t.ui.quiz;
  const progress = useProgress();
  const [category, setCategory] = useState<GuideCategory | 'all'>('all');
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0);
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [right, setRight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(
    () => quizItems.filter((it) => (category === 'all' || it.category === category) && (!level || it.level === level)),
    [category, level],
  );
  const seen = Object.keys(progress.quiz).length;
  const mastered = Object.values(progress.quiz).filter((s) => s.right >= 2 && s.right > s.wrong).length;
  const categories = [...new Set(quizItems.map((i) => i.category))];

  const start = () => {
    setQuestions(pickQuestions(pool, count, progress));
    setIndex(0);
    setRight(0);
    setAnswer('');
    setPhase('question');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const current = questions[index];
  const check = (giveUp = false) => {
    if (!current) return;
    const ok = !giveUp && matchesAnswer(answer, current.answers);
    setLastCorrect(ok);
    if (ok) setRight((r) => r + 1);
    recordQuiz(current.id, ok);
    setPhase('feedback');
  };
  const next = () => {
    if (index + 1 >= questions.length) setPhase('done');
    else {
      setIndex(index + 1);
      setAnswer('');
      setPhase('question');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="page quiz-page">
      <header className="page-head">
        <h1>{q.title}</h1>
        <p className="muted">{q.subtitle}</p>
        <p className="small muted">{fmt(q.stats, { seen, mastered })}</p>
      </header>

      {phase === 'setup' && (
        <section className="panel quiz-card">
          <h2>{q.setup}</h2>
          <label className="field">
            <span>{q.category}</span>
            <div className="chips">
              <button type="button" className={`chip${category === 'all' ? ' on' : ''}`} onClick={() => setCategory('all')}>
                {t.ui.common.all}
              </button>
              {categories.map((c) => (
                <button key={c} type="button" className={`chip${category === c ? ' on' : ''}`} onClick={() => setCategory(c)}>
                  {t.ui.categories[c]}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>{q.level}</span>
            <div className="chips">
              <button type="button" className={`chip${!level ? ' on' : ''}`} onClick={() => setLevel(0)}>
                {t.ui.common.all}
              </button>
              {([1, 2, 3] as const).map((l) => (
                <button key={l} type="button" className={`chip${level === l ? ' on' : ''}`} onClick={() => setLevel(l)}>
                  {t.ui.levels[l]}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>{q.count}</span>
            <div className="chips">
              {[5, 10, 20].map((n) => (
                <button key={n} type="button" className={`chip${count === n ? ' on' : ''}`} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </label>
          {pool.length === 0 ? (
            <p className="muted">{q.noQuestions}</p>
          ) : (
            <button type="button" className="btn primary" onClick={start}>
              {q.start} ({Math.min(count, pool.length)})
            </button>
          )}
          <p className="small muted">{q.mastery}</p>
        </section>
      )}

      {(phase === 'question' || phase === 'feedback') && current && (
        <section className="panel quiz-card">
          <div className="quiz-progress">
            <span className="muted small">{fmt(q.questionN, { n: index + 1, total: questions.length })}</span>
            <span className="chips">
              <span className="badge">{t.ui.categories[current.category]}</span>
              <span className={`badge lvl-${current.level}`}>{t.ui.levels[current.level]}</span>
            </span>
          </div>
          <div className="bar">
            <span style={{ width: `${((index + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
          <div className="quiz-prompt">
            <Markdown text={t.quiz[current.id]?.prompt ?? current.id} />
          </div>
          <form
            className="quiz-input"
            onSubmit={(e) => {
              e.preventDefault();
              if (phase === 'question') check();
              else next();
            }}
          >
            <span className="mono c-green">$</span>
            <input
              ref={inputRef}
              className="mono"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={q.placeholder}
              readOnly={phase === 'feedback'}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </form>
          {phase === 'question' ? (
            <div className="row">
              <button type="button" className="btn primary" onClick={() => check()} disabled={!answer.trim()}>
                {q.check}
              </button>
              <button type="button" className="btn ghost" onClick={() => check(true)}>
                {q.reveal}
              </button>
            </div>
          ) : (
            <div className={`feedback ${lastCorrect ? 'ok' : 'bad'}`}>
              <strong>{lastCorrect ? `✓ ${q.correct}` : `✗ ${q.incorrect}`}</strong>
              <div className="small muted">{q.accepted}:</div>
              <div className="answers">
                {current.answers.map((a) => (
                  <code key={a} className="mono">
                    {a}
                  </code>
                ))}
              </div>
              {current.answers.some((a) => a.includes('<any>')) && <div className="small muted">{q.anyNote}</div>}
              <Markdown text={t.quiz[current.id]?.explanation ?? ''} />
              <div className="row">
                <button type="button" className="btn primary" onClick={next} autoFocus>
                  {index + 1 >= questions.length ? q.finish : q.next} →
                </button>
                {current.guide && (
                  <a className="btn ghost" href={`#/guide/cmd/${current.guide}`}>
                    {q.openGuide}
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {phase === 'done' && (
        <section className="panel quiz-card center">
          <div className="score">{Math.round((right / Math.max(1, questions.length)) * 100)}%</div>
          <h2>{fmt(q.score, { right, total: questions.length })}</h2>
          <p className="muted">{q.mastery}</p>
          <button type="button" className="btn primary" onClick={() => setPhase('setup')}>
            {q.again}
          </button>
        </section>
      )}
    </div>
  );
}
