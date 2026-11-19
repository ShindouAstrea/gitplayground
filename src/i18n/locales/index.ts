import type { LocaleBundle } from '../types';
import { en } from './en';
import { es } from './es';

// Register new languages here (and add their folder next to en/ and es/).
export const locales: Record<string, LocaleBundle> = { es, en };

export const DEFAULT_LOCALE = 'es';
