import type { LocaleBundle } from '../../types';
import { exercises } from './exercises';
import { guideCommands } from './guideCommands';
import { guideConcepts } from './guideConcepts';
import { guideRecipes } from './guideRecipes';
import { hints } from './hints';
import { quizTexts } from './quiz';
import { ui } from './ui';

export const es: LocaleBundle = {
  code: 'es',
  name: 'Español',
  ui,
  hints,
  exercises,
  guide: { commands: guideCommands, recipes: guideRecipes, concepts: guideConcepts },
  quiz: quizTexts,
};
