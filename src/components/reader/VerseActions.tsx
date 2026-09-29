import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { HIGHLIGHT_COLORS } from '../../services/storage';
import type { HighlightColor } from '../../types/storage';

interface Props {
  label: string;
  count: number;
  currentColor?: HighlightColor;
  hasNote: boolean;
  bookmarked: boolean;
  onHighlight: (color: HighlightColor | null) => void;
  onNote: () => void;
  onBookmark: () => void;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
}

const colorName = (c: HighlightColor) => c.charAt(0).toUpperCase() + c.slice(1);

export function VerseActions(props: Props) {
  const { label, count, currentColor, hasNote, bookmarked } = props;
  return (
    <div
      role="region"
      aria-label={`Actions for ${label}`}
      className="no-print fixed inset-x-0 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] z-40 px-2 pb-2 md:bottom-4"
    >
      <div className="glass glass-strong mx-auto max-w-2xl rounded-[28px] p-3 !shadow-[0_30px_60px_-20px_rgb(61_42_28/0.45)]">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="font-display text-lg font-semibold text-ink">
            {label}
            {count > 1 && <span className="ml-2 font-sans text-base font-normal text-muted">{count} verses</span>}
          </p>
          <button type="button" className={btn.icon} onClick={props.onClear} aria-label="Close and clear selection">
            <Icon name="close" />
          </button>
        </div>

        <fieldset className="mb-3">
          <legend className="sr-only">Highlight colour</legend>
          <div className="flex flex-wrap items-center gap-1.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => props.onHighlight(c)}
                aria-pressed={currentColor === c}
                aria-label={`Highlight ${c}`}
                className="flex min-h-12 min-w-12 flex-col items-center justify-center rounded-xl px-1 hover:bg-accent-soft"
              >
                <span
                  className={`hl-${c} flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentColor === c ? 'border-ink' : 'border-line'
                  }`}
                >
                  {currentColor === c && <Icon name="check" className="h-4 w-4 text-ink" />}
                </span>
                <span className="mt-0.5 text-[0.75rem] text-muted" aria-hidden="true">
                  {colorName(c)}
                </span>
              </button>
            ))}
            {currentColor && (
              <button type="button" onClick={() => props.onHighlight(null)} className={`${btn.quiet} text-base`}>
                Remove
              </button>
            )}
          </div>
        </fieldset>

        <div className="grid grid-cols-4 gap-1.5">
          <ActionButton icon="note" label={hasNote ? 'Edit note' : 'Note'} onClick={props.onNote} disabled={count !== 1} />
          <ActionButton icon="bookmark" label={bookmarked ? 'Saved' : 'Bookmark'} onClick={props.onBookmark} active={bookmarked} />
          <ActionButton icon="copy" label="Copy" onClick={props.onCopy} />
          <ActionButton icon="share" label="Share" onClick={props.onShare} />
        </div>
        {count > 1 && <p className="mt-2 px-1 text-sm text-muted">Select a single verse to add a note.</p>}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: 'note' | 'bookmark' | 'copy' | 'share';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.9375rem] font-bold transition-colors disabled:opacity-40 ${
        active ? 'bg-cocoa text-paper' : 'bg-surface/70 text-ink ring-1 ring-line hover:bg-accent-soft'
      }`}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}
