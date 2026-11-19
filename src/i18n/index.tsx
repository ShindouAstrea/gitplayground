import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '../store/storage';
import { DEFAULT_LOCALE, locales } from './locales';
import type { LocaleBundle } from './types';

/** Replaces {name} placeholders. Unknown placeholders (e.g. `HEAD@{1}`) are kept. */
export function fmt(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (Object.hasOwn(params, k) ? String(params[k]) : m));
}

interface I18nValue {
  lang: string;
  t: LocaleBundle;
  setLang: (lang: string) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): string {
  const saved = storage.get<string>('lang');
  if (saved && locales[saved]) return saved;
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : '';
  return locales[nav] ? nav : DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((next: string) => {
    if (!locales[next]) return;
    storage.set('lang', next);
    setLangState(next);
  }, []);
  const value = useMemo(() => ({ lang, t: locales[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
