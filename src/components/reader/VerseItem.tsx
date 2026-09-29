import { memo } from 'react';
import { Icon } from '../ui/Icon';
import type { Highlight, Note } from '../../types/storage';

interface Props {
  verse: number;
  text: string;
  selected: boolean;
  targeted: boolean;
  highlight?: Highlight;
  note?: Note;
  bookmarked: boolean;
  showNumber: boolean;
  onToggle: (verse: number) => void;
  onEditNote: (verse: number) => void;
}

export const VerseItem = memo(function VerseItem({
  verse,
  text,
  selected,
  targeted,
  highlight,
  note,
  bookmarked,
  showNumber,
  onToggle,
  onEditNote,
}: Props) {
  const state = [
    highlight && `highlighted ${highlight.color}`,
    note && 'has a note',
    bookmarked && 'bookmarked',
  ].filter(Boolean);

  return (
    <li id={`v${verse}`} className="scroll-mt-28" data-highlighted={highlight ? '' : undefined}>
      <button
        type="button"
        onClick={() => onToggle(verse)}
        aria-pressed={selected}
        aria-label={`Verse ${verse}${state.length ? `, ${state.join(', ')}` : ''}. ${text}`}
        className={`group grid w-full grid-cols-[2.25rem_1fr] gap-x-2 rounded-xl px-1 py-2 text-left transition-colors sm:grid-cols-[2.75rem_1fr] ${
          selected ? 'bg-accent-soft ring-2 ring-accent' : targeted ? 'ring-2 ring-flame' : 'hover:bg-accent-soft/60'
        }`}
      >
        <span aria-hidden="true" className="pt-[0.35em] text-right font-sans text-[0.72em] font-bold leading-none text-muted">
          {showNumber ? verse : ''}
        </span>
        <span aria-hidden="true">
          <span
            className={`verse-text box-decoration-clone rounded-[4px] ${highlight ? `hl-${highlight.color} px-1 py-0.5` : ''}`}
          >
            {text}
          </span>
          {(note || bookmarked) && (
            <span className="ml-2 inline-flex translate-y-[0.1em] gap-1 text-accent">
              {bookmarked && <Icon name="bookmark" className="h-[0.9em] w-[0.9em]" />}
              {note && <Icon name="note" className="h-[0.9em] w-[0.9em]" />}
            </span>
          )}
        </span>
      </button>
      {note && (
        <div className="ml-[2.75rem] mt-1 mb-2 sm:ml-[3.25rem]">
          <button
            type="button"
            onClick={() => onEditNote(verse)}
            className="w-full rounded-xl border-l-4 border-accent bg-surface px-4 py-3 text-left font-sans text-[0.8em] leading-relaxed text-ink hover:bg-accent-soft"
            aria-label={`Your note on verse ${verse}: ${note.text}. Edit note`}
          >
            <span aria-hidden="true" className="mb-1 block text-[0.85em] font-bold text-accent">
              Your note
            </span>
            <span aria-hidden="true" className="whitespace-pre-wrap">
              {note.text}
            </span>
          </button>
        </div>
      )}
    </li>
  );
});
