import { allPaths } from '../git/diff';
import { computeStatus, has, headId, headTree } from '../git/repo';
import type { RepoState } from '../git/types';
import { fmt, useI18n } from '../i18n';
import { Markdown } from './Markdown';

interface Props {
  repo: RepoState;
  onOpen: (path: string) => void;
}

type Badge = 'untracked' | 'modified' | 'staged' | 'new' | 'deleted' | 'conflict' | 'clean';

export function FilesPanel({ repo, onOpen }: Props) {
  const { t } = useI18n();
  const st = computeStatus(repo);
  const head = headTree(repo);
  const paths = allPaths(repo.workdir, repo.index, head, repo.conflicts);
  const s = t.ui.files.status;

  const rows = paths.map((p) => {
    const badges: { kind: Badge; label: string; area: 'wd' | 'idx' }[] = [];
    if (!repo.initialized) return { path: p, badges, missing: false };
    if (has(repo.conflicts, p)) badges.push({ kind: 'conflict', label: s.conflict, area: 'wd' });
    const staged = st.staged.find((c) => c.path === p);
    if (staged) badges.push({ kind: 'staged', label: `${s.staged}${staged.type !== 'modified' ? ` · ${s[staged.type]}` : ''}`, area: 'idx' });
    const unstaged = st.unstaged.find((c) => c.path === p);
    if (unstaged) badges.push({ kind: unstaged.type === 'deleted' ? 'deleted' : 'modified', label: s[unstaged.type], area: 'wd' });
    if (st.untracked.includes(p)) badges.push({ kind: 'untracked', label: s.untracked, area: 'wd' });
    if (!badges.length && has(repo.workdir, p)) badges.push({ kind: 'clean', label: s.clean, area: 'wd' });
    return { path: p, badges, missing: !has(repo.workdir, p) };
  });

  const wdChanges = st.unstaged.length + st.untracked.length + st.conflicted.length;
  const id = headId(repo);

  return (
    <section className="panel files-panel">
      <header className="panel-head">
        <span className="panel-title">📁 {t.ui.files.title}</span>
        <span className="panel-actions">
          <button type="button" className="chip" onClick={() => onOpen('')}>
            + {t.ui.files.newFile}
          </button>
        </span>
      </header>
      {repo.initialized && (
        <div className="areas">
          <div className={`area${wdChanges ? ' active' : ''}`}>
            <strong>{t.ui.files.areas.workdir}</strong>
            <span>{fmt(t.ui.files.changes, { n: wdChanges })}</span>
          </div>
          <span className="area-arrow">
            <code>add</code>→
          </span>
          <div className={`area${st.staged.length ? ' active staged' : ''}`}>
            <strong>{t.ui.files.areas.staging}</strong>
            <span>{fmt(t.ui.files.staged, { n: st.staged.length })}</span>
          </div>
          <span className="area-arrow">
            <code>commit</code>→
          </span>
          <div className="area">
            <strong>{t.ui.files.areas.repo}</strong>
            <span className="mono">{id ? fmt(t.ui.files.head, { id }) : t.ui.files.unborn}</span>
          </div>
        </div>
      )}
      <ul className="file-list">
        {rows.length === 0 && (
          <li className="muted small">
            <Markdown inline text={t.ui.files.empty} />
          </li>
        )}
        {rows.map((r) => (
          <li key={r.path}>
            <button type="button" className={`file-row${r.missing ? ' missing' : ''}`} onClick={() => onOpen(r.path)}>
              <span className="file-name mono">{r.path}</span>
              <span className="badges">
                {r.badges.map((b) => (
                  <span key={b.kind + b.area} className={`badge b-${b.kind}`}>
                    {b.label}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {repo.stash.length > 0 && (
        <div className="stash-list">
          <strong className="small">{fmt(t.ui.files.stash, { n: repo.stash.length })}</strong>
          {repo.stash.map((e, i) => (
            <div key={i} className="mono small muted">
              stash@{'{'}
              {i}
              {'}'}: {e.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
