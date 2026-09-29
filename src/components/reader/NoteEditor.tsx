import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { btn } from '../ui/styles';

interface Props {
  open: boolean;
  reference: string;
  verseText: string;
  initialText: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NoteEditor({ open, reference, verseText, initialText, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (open) setText(initialText);
  }, [open, initialText]);

  return (
    <Modal open={open} onClose={onClose} title={initialText ? `Edit note on ${reference}` : `Note on ${reference}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(text);
        }}
      >
        <blockquote className="scripture mb-4 border-l-4 border-line pl-4 text-lg text-muted">{verseText}</blockquote>
        <label htmlFor="note-text" className="mb-2 block text-lg font-bold">
          Your note
        </label>
        <textarea
          id="note-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          autoFocus
          placeholder="What stands out to you in this verse?"
          className="w-full rounded-xl border-2 border-line bg-paper p-4 text-lg leading-relaxed text-ink placeholder:text-muted"
        />
        <div className="mt-4 flex flex-wrap justify-between gap-3">
          {initialText ? (
            <button
              type="button"
              className={`${btn.quiet} text-[#b3261e]`}
              onClick={() => {
                if (window.confirm('Delete this note? This cannot be undone.')) onDelete();
              }}
            >
              Delete note
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className={btn.secondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btn.primary} disabled={!text.trim()}>
              Save note
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
