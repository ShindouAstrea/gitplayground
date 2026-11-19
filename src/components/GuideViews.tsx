// Rendering of guide entries, shared by the Guide page and the in-workspace modal.
import { useState } from 'react';
import type { GuideCommand, GuideConcept, GuideRecipe } from '../content/types';
import { exercises } from '../exercises/defs';
import { useI18n } from '../i18n';
import { Markdown } from './Markdown';

export type GuideRef = { kind: 'cmd' | 'recipe' | 'concept'; id: string };

interface Common {
  /** Navigate to another entry */
  onOpen: (ref: GuideRef) => void;
  /** Click on a code line: copy (guide page) or paste into the terminal (workspace) */
  codeAction?: { label: string; run: (code: string) => void };
}

function CodeLine({ code, codeAction }: { code: string; codeAction?: Common['codeAction'] }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (codeAction) {
      codeAction.run(code);
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable: ignore
    }
  };
  return (
    <div className="code-line">
      <code className="mono">{code}</code>
      <button type="button" className="chip" onClick={copy}>
        {codeAction ? codeAction.label : copied ? t.ui.common.copied : t.ui.common.copy}
      </button>
    </div>
  );
}

function Related({ ids, onOpen }: { ids?: string[]; onOpen: Common['onOpen'] }) {
  const { t } = useI18n();
  if (!ids?.length) return null;
  const byId = new Map(t.guide.commands.map((c) => [c.id, c]));
  return (
    <section>
      <h4>{t.ui.guide.related}</h4>
      <div className="chips">
        {ids.map((id) => (
          <button key={id} type="button" className="chip" onClick={() => onOpen({ kind: 'cmd', id })}>
            {byId.get(id)?.command ?? id}
          </button>
        ))}
      </div>
    </section>
  );
}

function PracticeLinks({ commandIds }: { commandIds: string[] }) {
  const { t } = useI18n();
  const list = exercises.filter((e) => e.guide.some((g) => commandIds.includes(g)));
  if (!list.length) return null;
  return (
    <section>
      <h4>{t.ui.guide.practice}</h4>
      <div className="chips">
        {list.slice(0, 6).map((e) => (
          <a key={e.id} className="chip accent" href={`#/practice/${e.id}`}>
            {t.exercises[e.id]?.title ?? e.id}
          </a>
        ))}
      </div>
    </section>
  );
}

function Meta({ level, category }: { level: number; category: string }) {
  const { t } = useI18n();
  return (
    <div className="chips">
      <span className={`badge lvl-${level}`}>{t.ui.levels[level as 1 | 2 | 3]}</span>
      <span className="badge">{t.ui.categories[category as keyof typeof t.ui.categories] ?? category}</span>
    </div>
  );
}

export function CommandView({ cmd, onOpen, codeAction }: Common & { cmd: GuideCommand }) {
  const { t } = useI18n();
  return (
    <article className="guide-entry">
      <header>
        <h2 className="mono">{cmd.command}</h2>
        <Meta level={cmd.level} category={cmd.category} />
        <p className="lead">
          <Markdown inline text={cmd.summary} />
        </p>
      </header>
      <Markdown text={cmd.description} />
      {cmd.warning && (
        <div className="callout danger">
          <strong>⚠ {t.ui.guide.warning}: </strong>
          <Markdown inline text={cmd.warning} />
        </div>
      )}
      <section>
        <h4>{t.ui.guide.syntax}</h4>
        <pre className="syntax mono">{cmd.syntax.join('\n')}</pre>
      </section>
      <section>
        <h4>{t.ui.guide.examples}</h4>
        {cmd.examples.map((ex, i) => (
          <div key={i} className="example">
            <CodeLine code={ex.code} codeAction={codeAction} />
            <Markdown text={ex.explanation} className="muted" />
          </div>
        ))}
      </section>
      {cmd.tips?.length ? (
        <section>
          <h4>{t.ui.guide.tips}</h4>
          <ul>
            {cmd.tips.map((tip, i) => (
              <li key={i}>
                <Markdown inline text={tip} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <Related ids={cmd.related} onOpen={onOpen} />
      <PracticeLinks commandIds={[cmd.id]} />
    </article>
  );
}

export function RecipeView({ recipe, onOpen, codeAction }: Common & { recipe: GuideRecipe }) {
  const { t } = useI18n();
  return (
    <article className="guide-entry">
      <header>
        <h2>{recipe.title}</h2>
        <Meta level={recipe.level} category={recipe.category} />
      </header>
      <section>
        <h4>{t.ui.guide.problem}</h4>
        <Markdown text={recipe.problem} />
      </section>
      <section>
        <h4>{t.ui.guide.steps}</h4>
        <ol className="steps">
          {recipe.steps.map((st, i) => (
            <li key={i}>
              <Markdown text={st.text} />
              {st.code && <CodeLine code={st.code} codeAction={codeAction} />}
            </li>
          ))}
        </ol>
      </section>
      {recipe.notes?.length ? (
        <section>
          <h4>{t.ui.guide.notes}</h4>
          <ul>
            {recipe.notes.map((n, i) => (
              <li key={i}>
                <Markdown inline text={n} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <Related ids={recipe.related} onOpen={onOpen} />
      <PracticeLinks commandIds={recipe.related ?? []} />
    </article>
  );
}

export function ConceptView({ concept, onOpen }: Common & { concept: GuideConcept }) {
  return (
    <article className="guide-entry">
      <header>
        <h2>{concept.title}</h2>
      </header>
      <Markdown text={concept.body} />
      <Related ids={concept.related} onOpen={onOpen} />
    </article>
  );
}

/** Renders any entry by reference */
export function GuideEntryView({ entry, onOpen, codeAction }: Common & { entry: GuideRef }) {
  const { t } = useI18n();
  if (entry.kind === 'cmd') {
    const cmd = t.guide.commands.find((c) => c.id === entry.id);
    return cmd ? <CommandView cmd={cmd} onOpen={onOpen} codeAction={codeAction} /> : null;
  }
  if (entry.kind === 'recipe') {
    const recipe = t.guide.recipes.find((r) => r.id === entry.id);
    return recipe ? <RecipeView recipe={recipe} onOpen={onOpen} codeAction={codeAction} /> : null;
  }
  const concept = t.guide.concepts.find((c) => c.id === entry.id);
  return concept ? <ConceptView concept={concept} onOpen={onOpen} /> : null;
}
