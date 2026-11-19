// Local progress (exercises completed, quiz stats), shared through a tiny store.
import { useSyncExternalStore } from 'react';
import { storage } from './storage';

export interface Progress {
  exercises: Record<string, { done: boolean; best?: number }>;
  quiz: Record<string, { right: number; wrong: number }>;
}

let progress: Progress = { exercises: {}, quiz: {}, ...storage.get<Progress>('progress') };
const listeners = new Set<() => void>();

function update(next: Progress) {
  progress = next;
  storage.set('progress', next);
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => progress,
  );
}

export function markExercise(id: string, commands: number) {
  const prev = progress.exercises[id];
  const best = prev?.best ? Math.min(prev.best, commands) : commands;
  update({ ...progress, exercises: { ...progress.exercises, [id]: { done: true, best } } });
}

export function recordQuiz(id: string, correct: boolean) {
  const prev = progress.quiz[id] ?? { right: 0, wrong: 0 };
  const next = correct ? { ...prev, right: prev.right + 1 } : { ...prev, wrong: prev.wrong + 1 };
  update({ ...progress, quiz: { ...progress.quiz, [id]: next } });
}
