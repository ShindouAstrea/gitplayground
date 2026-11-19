import type { RepoState } from '../git/types';

export type Params = Record<string, string>;

export interface Rng {
  pick<T>(items: readonly T[]): T;
}

/** Seeded PRNG (mulberry32) so a variant number always builds the same scenario */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { pick: (items) => items[Math.floor(next() * items.length)] };
}

export interface Goal<P extends Params> {
  /** Key of the goal text in the locale's `exercises[id].goals` */
  id: string;
  check: (s: RepoState, p: P, initial: RepoState) => boolean;
  /** Something that must stay true ("don't move main"); it may already hold at the start */
  constraint?: boolean;
}

export interface ExerciseDef<P extends Params = Params> {
  id: string;
  /** Section of the learning path (1-4) */
  level: 1 | 2 | 3 | 4;
  /** Related guide command ids */
  guide: string[];
  params: (rng: Rng) => P;
  setup: (p: P) => RepoState;
  goals: Goal<P>[];
  /** Reference solution. Lines starting with # describe editor steps. */
  solution: (p: P, initial: RepoState) => string[];
}

/** Translatable texts of an exercise; {param} placeholders are interpolated */
export interface ExerciseText {
  title: string;
  summary: string;
  description: string;
  goals: Record<string, string>;
  hints: string[];
}

export function defineExercise<P extends Params>(def: ExerciseDef<P>): ExerciseDef {
  return def as unknown as ExerciseDef;
}
