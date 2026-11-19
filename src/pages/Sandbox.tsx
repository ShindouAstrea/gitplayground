import { useRef, useState } from 'react';
import { Markdown } from '../components/Markdown';
import type { TerminalHandle } from '../components/Terminal';
import { Workspace } from '../components/Workspace';
import { useRepo } from '../hooks/useRepo';
import { useI18n } from '../i18n';
import { PRESETS, type PresetId } from '../sandboxPresets';

export function Sandbox() {
  const { t } = useI18n();
  const s = t.ui.sandbox;
  const [preset, setPreset] = useState<PresetId>('history');
  const repo = useRepo(() => PRESETS.history());
  const terminalRef = useRef<TerminalHandle>(null);

  const choose = (id: PresetId) => {
    setPreset(id);
    repo.reset(PRESETS[id]());
  };

  const hasRemote = Object.keys(repo.repo.remotes).some((r) => repo.repo.remotes[r].branches.main);

  return (
    <div className="practice">
      <div className="practice-bar">
        <strong>{s.title}</strong>
        <span className="muted small hide-sm">{s.subtitle}</span>
        <span className="spacer" />
        <button type="button" className="btn ghost small" onClick={repo.undo} disabled={!repo.undo.length}>
          ↶ {t.ui.common.undo}
        </button>
        <button type="button" className="btn ghost small" onClick={() => choose(preset)}>
          ↺ {t.ui.common.reset}
        </button>
      </div>
      <Workspace
        repo={repo}
        terminalRef={terminalRef}
        toolbar={
          hasRemote ? (
            <button type="button" className="chip accent" onClick={repo.teammate} title={t.ui.workspace.teammateHelp}>
              👥 {t.ui.workspace.teammate}
            </button>
          ) : null
        }
        side={
          <section className="panel sandbox-panel">
            <h3>{s.presets}</h3>
            <div className="preset-grid">
              {(Object.keys(PRESETS) as PresetId[]).map((id) => (
                <button key={id} type="button" className={`preset${preset === id ? ' active' : ''}`} onClick={() => choose(id)}>
                  {s.preset[id]}
                </button>
              ))}
            </div>
            <h3>{s.tips}</h3>
            <ul className="ideas">
              {s.ideas.map((idea, i) => (
                <li key={i}>
                  <Markdown inline text={idea} onCode={(c) => terminalRef.current?.insert(c, true)} />
                </li>
              ))}
            </ul>
          </section>
        }
      />
    </div>
  );
}
