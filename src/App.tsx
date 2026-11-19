import { useEffect, useState } from 'react';
import { useI18n } from './i18n';
import { locales } from './i18n/locales';
import { Guide } from './pages/Guide';
import { Home } from './pages/Home';
import { ExerciseList, ExerciseRunner } from './pages/Practice';
import { Quiz } from './pages/Quiz';
import { Sandbox } from './pages/Sandbox';
import { useRoute } from './router';
import { storage } from './store/storage';

type Theme = 'dark' | 'light';

function Header() {
  const { t, lang, setLang } = useI18n();
  const route = useRoute();
  const [theme, setTheme] = useState<Theme>(() => storage.get<Theme>('theme') ?? 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set('theme', theme);
  }, [theme]);
  const section = route.parts[0] ?? '';
  const links = [
    { key: 'practice', label: t.ui.nav.practice },
    { key: 'sandbox', label: t.ui.nav.sandbox },
    { key: 'guide', label: t.ui.nav.guide },
    { key: 'quiz', label: t.ui.nav.quiz },
  ];
  return (
    <header className="app-header">
      <a href="#/" className="brand">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
          <circle cx="8" cy="8" r="4" className="brand-a" />
          <circle cx="8" cy="24" r="4" className="brand-a" />
          <circle cx="24" cy="16" r="4" className="brand-b" />
          <path d="M8 12v8M8 13c0 3 16 0 16 3" className="brand-line" />
        </svg>
        <span>{t.ui.appName}</span>
      </a>
      <nav className="nav">
        {links.map((l) => (
          <a key={l.key} href={`#/${l.key}`} className={section === l.key ? 'active' : ''}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="header-tools">
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t.ui.common.language} className="lang-select">
          {Object.values(locales).map((l) => (
            <option key={l.code} value={l.code}>
              {l.code.toUpperCase()} · {l.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`${t.ui.common.theme}: ${theme === 'dark' ? t.ui.common.dark : t.ui.common.light}`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

function Page() {
  const route = useRoute();
  const [section, a, b] = route.parts;
  switch (section) {
    case 'practice':
      return a ? <ExerciseRunner id={a} variant={Number(route.query.get('v') ?? 0) || 0} /> : <ExerciseList />;
    case 'sandbox':
      return <Sandbox />;
    case 'guide':
      return <Guide kind={a} id={b} />;
    case 'quiz':
      return <Quiz />;
    default:
      return <Home />;
  }
}

export function App() {
  const { t } = useI18n();
  return (
    <div className="app">
      <Header />
      <main>
        <Page />
      </main>
      <footer className="app-footer muted small">{t.ui.footer}</footer>
    </div>
  );
}
