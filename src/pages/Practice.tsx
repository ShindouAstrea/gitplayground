import { useEffect, useMemo, useRef, useState } from 'react';
import { Markdown } from '../components/Markdown';
import type { TerminalHandle } from '../components/Terminal';
import { Workspace } from '../components/Workspace';
import { exerciseById, exercises } from '../exercises/defs';
import { createRng, type ExerciseDef } from '../exercises/types';
import { useRepo } from '../hooks/useRepo';
import { fmt, useI18n } from '../i18n';
import { navigate } from '../router';
import { markExercise, useProgress } from '../store/progress';

const LEVELS = [1, 2, 3, 4] as const;

export function ExerciseList() {
  const { t } = useI18n();
  const progress = useProgress();
  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.ui.practice.title}</h1>
        <p className="muted">{t.ui.practice.subtitle}</p>
      </header>
      {LEVELS.map((level) => {
        const list = exercises.filter((e) => e.level === level);
        const done = list.filter((e) => progress.exercises[e.id]?.done).length;
        return (
          <section key={level} className="level-section">
            <div className="level-head">
              <h2>
                <span className="level-num">{level}</span> {t.ui.exerciseLevels[level].title}
              </h2>
              <span className="muted small">
                {done}/{list.length}
              </span>
            </div>
            <p className="muted">{t.ui.exerciseLevels[level].text}</p>
            <div className="card-grid">
              {list.map((e) => {
                const text = t.exercises[e.id];
                const isDone = progress.exercises[e.id]?.done;
                return (
                  <a key={e.id} className={`card ex-card${isDone ? ' done' : ''}`} href={`#/practice/${e.id}`}>
                    <div className="ex-card-top">
                      <h3>{text.title}</h3>
                      {isDone && <span className="badge b-clean">✓ {t.ui.practice.completed}</span>}
                    </div>
                    <p className="muted">{text.summary}</p>
                    <div className="chips">
                      {e.guide.slice(0, 4).map((g) => (
                        <span key={g} className="chip mono small">
                          {t.guide.commands.find((c) => c.id === g)?.command.replace(/^git /, '') ?? g}
                        </span>
                      ))}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ExercisePanel({
  ex,
  params,
  goals,
  solved,
  usedCommands,
  variant,
  onPaste,
  onOpenGuide,
}: {
  ex: ExerciseDef;
  params: Record<string, string>;
  goals: { id: string; done: boolean; constraint?: boolean }[];
  solved: boolean;
  usedCommands: number | null;
  variant: number;
  onPaste: (code: string) => void;
  onOpenGuide: (id: string) => void;
}) {
  const { t } = useI18n();
  const p = t.ui.practice;
  const text = t.exercises[ex.id];
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const initialRef = useMemo(() => ex.setup(params), [ex, params]);
  const solution = useMemo(() => ex.solution(params, initialRef), [ex, params, initialRef]);
  const best = solution.filter((l) => !l.startsWith('#')).length;
  const index = exercises.indexOf(ex);
  const next = exercises[index + 1];

  return (
    <section className="panel exercise-panel">
      <div className="ex-meta">
        <span className="badge">{fmt(p.levelN, { n: ex.level })}</span>
        <span className="muted small">{fmt(p.variant, { n: variant })}</span>
      </div>
      <h1 className="ex-title">{text.title}</h1>
      <Markdown text={fmt(text.description, params)} onCode={onPaste} />

      <h3>{p.goals}</h3>
      <ul className="goals">
        {goals.map((g) => (
          <li key={g.id} className={g.constraint ? (g.done ? 'constraint' : 'constraint broken') : g.done ? 'done' : ''}>
            <span className="check" aria-hidden>
              {g.constraint ? (g.done ? '=' : '✗') : g.done ? '✓' : ''}
            </span>
            <Markdown inline text={fmt(text.goals[g.id] ?? g.id, params)} />
          </li>
        ))}
      </ul>

      {solved && (
        <div className="success">
          <strong>🎉 {p.successTitle}</strong>
          {usedCommands !== null && <p>{fmt(p.successText, { used: usedCommands, best })}</p>}
          <div className="row">
            {next && (
              <a className="btn primary" href={`#/practice/${next.id}`}>
                {p.next} →
              </a>
            )}
            <button type="button" className="btn ghost" onClick={() => navigate(`/practice/${ex.id}?v=${1 + Math.floor(Math.random() * 999)}`)}>
              🎲 {p.another}
            </button>
          </div>
        </div>
      )}

      <h3>{p.hints}</h3>
      <ol className="hints">
        {text.hints.slice(0, hintsShown).map((h, i) => (
          <li key={i}>
            <Markdown inline text={fmt(h, params)} onCode={onPaste} />
          </li>
        ))}
      </ol>
      {hintsShown < text.hints.length && (
        <button type="button" className="btn ghost small" onClick={() => setHintsShown(hintsShown + 1)}>
          💡 {fmt(p.showHint, { n: text.hints.length - hintsShown })}
        </button>
      )}

      <h3>{p.solution}</h3>
      {showSolution ? (
        <>
          <p className="muted small">{p.solutionNote}</p>
          <div className="solution">
            {solution.map((line, i) =>
              line.startsWith('#') ? (
                <div key={i} className="sol-comment mono">
                  {line}
                </div>
              ) : (
                <button key={i} type="button" className="sol-line mono" onClick={() => onPaste(line)}>
                  $ {line}
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <button type="button" className="btn ghost small" onClick={() => setShowSolution(true)}>
          👀 {p.showSolution}
        </button>
      )}

      <h3>{p.related}</h3>
      <div className="chips">
        {ex.guide.map((g) => (
          <button key={g} type="button" className="chip mono" onClick={() => onOpenGuide(g)}>
            {t.guide.commands.find((c) => c.id === g)?.command ?? g}
          </button>
        ))}
      </div>
    </section>
  );
}

function Runner({ ex, variant }: { ex: ExerciseDef; variant: number }) {
  const { t } = useI18n();
  const p = t.ui.practice;
  const params = useMemo(() => ex.params(createRng(variant)), [ex, variant]);
  const initial = useMemo(() => ex.setup(params), [ex, params]);
  const repo = useRepo(() => initial);
  const terminalRef = useRef<TerminalHandle>(null);
  const [usedCommands, setUsedCommands] = useState<number | null>(null);

  const goals = ex.goals.map((g) => ({ id: g.id, done: g.check(repo.repo, params, initial), constraint: g.constraint }));
  const solved = goals.every((g) => g.done);

  useEffect(() => {
    if (solved && usedCommands === null) {
      setUsedCommands(repo.commands);
      markExercise(ex.id, repo.commands);
    }
  }, [solved, usedCommands, repo.commands, ex.id]);

  const restart = () => {
    repo.reset(ex.setup(params));
    setUsedCommands(null);
  };

  return (
    <div className="practice">
      <div className="practice-bar">
        <a href="#/practice" className="btn ghost small">
          ← {p.allExercises}
        </a>
        <span className="spacer" />
        <button type="button" className="btn ghost small" onClick={repo.undo} disabled={!repo.undo.length} title={t.ui.workspace.undo}>
          ↶ {t.ui.common.undo}
        </button>
        <button type="button" className="btn ghost small" onClick={restart}>
          ↺ {p.restart}
        </button>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => navigate(`/practice/${ex.id}?v=${1 + Math.floor(Math.random() * 999)}`)}
        >
          🎲 {p.newVariant}
        </button>
      </div>
      <Workspace
        repo={repo}
        terminalRef={terminalRef}
        side={
          <ExercisePanel
            ex={ex}
            params={params}
            goals={goals}
            solved={solved}
            usedCommands={usedCommands}
            variant={variant}
            onPaste={(code) => terminalRef.current?.insert(code, true)}
            onOpenGuide={(id) => repo.openGuide(id)}
          />
        }
      />
    </div>
  );
}

export function ExerciseRunner({ id, variant }: { id: string; variant: number }) {
  const { t } = useI18n();
  const ex = exerciseById(id);
  if (!ex) {
    return (
      <div className="page">
        <p>{t.ui.practice.notFound}</p>
        <a href="#/practice">← {t.ui.practice.allExercises}</a>
      </div>
    );
  }
  return <Runner key={`${id}:${variant}`} ex={ex} variant={variant} />;
}
