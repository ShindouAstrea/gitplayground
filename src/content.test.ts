// Guards for the dictionaries and exercises: every language must provide the
// same keys, and every reference solution must actually solve its exercise.
import { describe, expect, it } from 'vitest';
import { quizItems } from './content/quiz';
import { matchesAnswer } from './content/quizMatch';
import { exercises } from './exercises/defs';
import { createRng } from './exercises/types';
import { applyRebasePlan, run } from './git/engine';
import { locales } from './i18n/locales';
import { en } from './i18n/locales/en';

function shape(value: unknown): unknown {
  if (typeof value === 'string') return 'string';
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

describe('locales', () => {
  for (const [code, bundle] of Object.entries(locales)) {
    it(`${code}: ui and hints have the same keys as en`, () => {
      expect(shape(bundle.ui)).toEqual(shape(en.ui));
      expect(Object.keys(bundle.hints).sort()).toEqual(Object.keys(en.hints).sort());
    });

    it(`${code}: every exercise has texts for all goals`, () => {
      for (const ex of exercises) {
        const text = bundle.exercises[ex.id];
        expect(text, ex.id).toBeDefined();
        expect(Object.keys(text.goals).sort(), ex.id).toEqual(ex.goals.map((g) => g.id).sort());
        expect(text.hints.length, ex.id).toBeGreaterThan(0);
      }
    });

    it(`${code}: guide entries match en (ids, examples, steps)`, () => {
      const ids = (list: { id: string }[]) => list.map((e) => e.id);
      expect(ids(bundle.guide.commands)).toEqual(ids(en.guide.commands));
      expect(ids(bundle.guide.recipes)).toEqual(ids(en.guide.recipes));
      expect(ids(bundle.guide.concepts)).toEqual(ids(en.guide.concepts));
      bundle.guide.commands.forEach((c, i) => {
        expect(c.examples.map((e) => e.code), c.id).toEqual(en.guide.commands[i].examples.map((e) => e.code));
      });
      bundle.guide.recipes.forEach((r, i) => {
        expect(r.steps.map((st) => st.code ?? ''), r.id).toEqual(en.guide.recipes[i].steps.map((st) => st.code ?? ''));
      });
    });

    it(`${code}: every quiz item has a text`, () => {
      expect(Object.keys(bundle.quiz).sort()).toEqual(quizItems.map((q) => q.id).sort());
    });
  }

  it('guide links point to existing commands', () => {
    const cmdIds = new Set(en.guide.commands.map((c) => c.id));
    for (const ex of exercises) for (const g of ex.guide) expect(cmdIds.has(g), `${ex.id} -> ${g}`).toBe(true);
    for (const q of quizItems) if (q.guide) expect(cmdIds.has(q.guide), q.id).toBe(true);
  });
});

describe('quiz matching', () => {
  it('every accepted answer matches itself', () => {
    for (const q of quizItems) {
      for (const a of q.answers) expect(matchesAnswer(a.replace(/<any>/g, '"some text"'), q.answers), `${q.id}: ${a}`).toBe(true);
    }
  });
  it('ignores quote style and extra spaces, but not wrong flags', () => {
    expect(matchesAnswer(`git   commit -m 'Fix login'`, ['git commit -m <any>'])).toBe(true);
    expect(matchesAnswer('git switch -c hotfix', ['git switch -c hotfix'])).toBe(true);
    expect(matchesAnswer('git switch hotfix', ['git switch -c hotfix'])).toBe(false);
    expect(matchesAnswer('', ['git status'])).toBe(false);
  });
});

describe('exercises', () => {
  for (const ex of exercises) {
    for (const seed of [0, 1, 2, 3]) {
      it(`${ex.id} (variant ${seed}) is solved by its reference solution`, () => {
        const params = ex.params(createRng(seed));
        const initial = ex.setup(params);
        // only constraints ("don't move main") may already hold at the start
        const premature = ex.goals.filter((g) => !g.constraint && g.check(initial, params, initial)).map((g) => g.id);
        expect(premature).toEqual([]);
        let s = initial;
        for (const line of ex.solution(params, initial)) {
          const r = run(s, line);
          s = r.state;
          if (r.ui?.type === 'rebase-todo' && ex.id === 'rebase-interactive') {
            const steps = r.ui.plan.steps.map((st) => {
              const msg = s.commits[st.commit].message;
              if (msg === 'Add debug logs') return { ...st, action: 'drop' as const };
              if (msg.endsWith('veiw')) return { ...st, action: 'reword' as const, message: msg.replace('veiw', 'view') };
              return st;
            });
            s = applyRebasePlan(s, { ...r.ui.plan, steps }).state;
          }
        }
        const failing = ex.goals.filter((g) => !g.check(s, params, initial)).map((g) => g.id);
        expect(failing).toEqual([]);
      });
    }
  }
});
