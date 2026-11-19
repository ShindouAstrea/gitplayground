import { useState } from 'react';
import { hasConflictMarkers } from '../git/diff';
import { fmt, useI18n } from '../i18n';
import { Markdown } from './Markdown';
import { Modal } from './Modal';

interface Props {
  /** Empty string = new file */
  path: string;
  content: string;
  exists: boolean;
  onSave: (path: string, content: string) => void;
  onDelete: (path: string) => void;
  onClose: () => void;
}

export function FileEditor({ path, content, exists, onSave, onDelete, onClose }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(path);
  const [text, setText] = useState(content);
  const conflicted = hasConflictMarkers(text);
  const valid = name.trim() && !/\s/.test(name.trim());
  return (
    <Modal
      title={path ? fmt(t.ui.files.editTitle, { file: path }) : t.ui.files.newFile}
      onClose={onClose}
      wide
      footer={
        <>
          {exists && (
            <button type="button" className="btn danger ghost" onClick={() => onDelete(path)}>
              {t.ui.files.deleteFile}
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onClose}>
            {t.ui.common.cancel}
          </button>
          <button type="button" className="btn primary" disabled={!valid} onClick={() => onSave(name.trim(), text)}>
            {t.ui.common.save}
          </button>
        </>
      }
    >
      {!path && (
        <input
          className="text-input mono"
          placeholder={t.ui.files.fileName}
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
      )}
      {conflicted && (
        <div className="callout warn">
          <Markdown inline text={t.ui.files.conflictHelp} />
        </div>
      )}
      <textarea
        className={`editor mono${conflicted ? ' has-conflict' : ''}`}
        value={text}
        autoFocus={!!path}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (valid) onSave(name.trim(), text);
          }
        }}
        rows={14}
      />
      <p className="muted small">{t.ui.files.editorNote}</p>
    </Modal>
  );
}
