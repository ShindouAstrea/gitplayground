import { useMemo, useState } from 'react';
import type { GuideCategory, Level } from '../content/types';
import { GuideEntryView, type GuideRef } from '../components/GuideViews';
import { Markdown } from '../components/Markdown';
import { fmt, useI18n } from '../i18n';
import { navigate } from '../router';

type Tab = 'all' | 'commands' | 'recipes' | 'concepts';

interface Item {
  ref: GuideRef;
  title: string;
  subtitle: string;
  category?: GuideCategory;
  level?: Level;
  fields: { text: string; weight: number }[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

function score(item: Item, words: string[]): number {
  let total = 0;
  for (const w of words) {
    let best = 0;
    for (const f of item.fields) if (f.weight > best && f.text.includes(w)) best = f.weight;
    if (!best) return 0;
    total += best;
  }
  return total;
}

export function Guide({ kind, id }: { kind?: string; id?: string }) {
  const { t } = useI18n();
  const g = t.ui.guide;
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<GuideCategory | null>(null);

  const items = useMemo<Item[]>(() => {
    const cmds: Item[] = t.guide.commands.map((c) => ({
      ref: { kind: 'cmd', id: c.id },
      title: c.command,
      subtitle: c.summary,
      category: c.category,
      level: c.level,
      fields: [
        { text: norm(`${c.command} ${c.id}`), weight: 100 },
        { text: norm((c.keywords ?? []).join(' ')), weight: 40 },
        { text: norm(c.summary), weight: 30 },
        { text: norm(c.examples.map((e) => e.code).join(' ')), weight: 15 },
        { text: norm(c.description + ' ' + c.examples.map((e) => e.explanation).join(' ')), weight: 8 },
      ],
    }));
    const recipes: Item[] = t.guide.recipes.map((r) => ({
      ref: { kind: 'recipe', id: r.id },
      title: r.title,
      subtitle: r.problem,
      category: r.category,
      level: r.level,
      fields: [
        { text: norm(r.title), weight: 90 },
        { text: norm((r.keywords ?? []).join(' ')), weight: 50 },
        { text: norm(r.problem), weight: 30 },
        { text: norm(r.steps.map((s) => `${s.code ?? ''} ${s.text}`).join(' ')), weight: 12 },
        { text: norm((r.notes ?? []).join(' ')), weight: 6 },
      ],
    }));
    const concepts: Item[] = t.guide.concepts.map((c) => ({
      ref: { kind: 'concept', id: c.id },
      title: c.title,
      subtitle: c.body.split('\n')[0],
      fields: [
        { text: norm(c.title), weight: 90 },
        { text: norm((c.keywords ?? []).join(' ')), weight: 50 },
        { text: norm(c.body), weight: 10 },
      ],
    }));
    return [...concepts, ...cmds, ...recipes];
  }, [t]);

  const words = norm(query).split(/\s+/).filter(Boolean);
  const kindOfTab: Record<Tab, GuideRef['kind'] | null> = { all: null, commands: 'cmd', recipes: 'recipe', concepts: 'concept' };
  let results = items.filter((it) => (!kindOfTab[tab] || it.ref.kind === kindOfTab[tab]) && (!category || it.category === category));
  if (words.length) {
    results = results
      .map((it) => ({ it, s: score(it, words) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.it);
  }

  const selected: GuideRef | null = kind && id ? { kind: kind as GuideRef['kind'], id } : null;
  const open = (ref: GuideRef) => navigate(`/guide/${ref.kind}/${ref.id}`);
  const categories = Object.keys(t.ui.categories) as GuideCategory[];
  const kindLabel = { cmd: g.kind.command, recipe: g.kind.recipe, concept: g.kind.concept };

  return (
    <div className="page guide-page">
      <header className="page-head">
        <h1>{g.title}</h1>
        <p className="muted">{g.subtitle}</p>
      </header>
      <div className={`guide-layout${selected ? ' has-selection' : ''}`}>
        <div className="guide-list">
          <input
            className="text-input search"
            type="search"
            placeholder={g.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={!selected}
          />
          <div className="tabs">
            {(Object.keys(g.tabs) as Tab[]).map((k) => (
              <button key={k} type="button" className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
                {g.tabs[k]}
              </button>
            ))}
          </div>
          {tab !== 'concepts' && (
            <div className="chips cat-chips">
              <button type="button" className={`chip${!category ? ' on' : ''}`} onClick={() => setCategory(null)}>
                {t.ui.common.all}
              </button>
              {categories.map((c) => (
                <button key={c} type="button" className={`chip${category === c ? ' on' : ''}`} onClick={() => setCategory(category === c ? null : c)}>
                  {t.ui.categories[c]}
                </button>
              ))}
            </div>
          )}
          <div className="muted small">{fmt(g.results, { n: results.length })}</div>
          <ul className="result-list">
            {results.length === 0 && <li className="muted">{g.noResults}</li>}
            {results.map((it) => {
              const active = selected?.kind === it.ref.kind && selected.id === it.ref.id;
              return (
                <li key={`${it.ref.kind}:${it.ref.id}`}>
                  <button type="button" className={`result${active ? ' active' : ''}`} onClick={() => open(it.ref)}>
                    <span className={`kind k-${it.ref.kind}`}>{kindLabel[it.ref.kind]}</span>
                    <span className={`result-title${it.ref.kind === 'cmd' ? ' mono' : ''}`}>{it.title}</span>
                    <span className="result-sub muted small">
                      <Markdown inline text={it.subtitle.replace(/\*\*/g, '')} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="guide-detail panel">
          {selected ? (
            <>
              <button type="button" className="btn ghost small back-sm" onClick={() => navigate('/guide')}>
                ← {t.ui.common.back}
              </button>
              <GuideEntryView entry={selected} onOpen={open} />
            </>
          ) : (
            <div className="muted guide-placeholder">{g.select}</div>
          )}
        </div>
      </div>
    </div>
  );
}
