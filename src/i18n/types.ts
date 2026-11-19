import type { GuideCommand, GuideConcept, GuideRecipe, QuizText } from '../content/types';
import type { ExerciseText } from '../exercises/types';
import type { HintKey } from '../git/types';
import type { ui } from './locales/en/ui';

/** Same shape as the English dictionary, with any string values */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type UiDict = Widen<typeof ui>;

/**
 * Everything a language provides. To add a language: copy `locales/en`,
 * translate it, and register it in `locales/index.ts`.
 */
export interface LocaleBundle {
  code: string;
  /** Name of the language in that language, e.g. "Español" */
  name: string;
  ui: UiDict;
  hints: Record<HintKey, string>;
  exercises: Record<string, ExerciseText>;
  guide: {
    commands: GuideCommand[];
    recipes: GuideRecipe[];
    concepts: GuideConcept[];
  };
  quiz: Record<string, QuizText>;
}
