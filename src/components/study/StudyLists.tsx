import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { StatusMessage } from '../ui/StatusMessage';
import { NoteEditor } from '../reader/NoteEditor';
import { useToast } from '../ui/Toast';
import { useStore } from '../../store/AppStore';
import { useVerseLookup } from '../../hooks/useVerseLookup';
import { bookIndex } from '../../data/canon';
import { HIGHLIGHT_COLORS } from '../../services/storage';
import { formatDate } from '../../utils/misc';
import { formatRef } from '../../utils/references';
import type { HighlightColor, Note } from '../../types/storage';
import type { Nav } from '../../types/nav';

interface ListProps {
  book: string;
  nav: Nav;
}

const inBook = (book: string) => (item: { book: string }) => book === 'all' || item.book === book;

type SortMode = 'recent' | 'bible';
const byBibleOrder = (a: { book: string; chapter: number; verse?: number }, b: { book: string; chapter: number; verse?: number }) =>
  bookIndex(a.book) - bookIndex(b.book) || a.chapter - b.chapter || (a.verse ?? 0) - (b.verse ?? 0);

function SortToggle({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-base">
      <span className="text-muted">Order:</span>
      {(['recent', 'bible'] as const).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={value === m}
          onClick={() => onChange(m)}
          className={`min-h-10 rounded-full px-3 font-bold ${value === m ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'}`}
        >
          {m === 'recent' ? 'Most recent' : 'Bible order'}
        </button>
      ))}
    </div>
  );
}

export function HighlightsList({ book, nav }: ListProps) {
  const { data, actions } = useStore();
  const [color, setColor] = useState<HighlightColor | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('recent');
  const items = useMemo(
    () =>
      Object.values(data.highlights)
        .filter(inBook(book))
        .filter((h) => color === 'all' || h.color === color)
        .sort(sort === 'recent' ? (a, b) => b.updatedAt - a.updatedAt : byBibleOrder),
    [data.highlights, book, color, sort],
  );
  const text = useVerseLookup(items);

  if (Object.keys(data.highlights).length === 0) {
    return (
      <StatusMessage title="No highlights yet" action={{ label: 'Open the Bible', onClick: () => nav.go({ view: 'bible' }) }}>
        While reading, tap any verse and choose a colour to highlight it.
      </StatusMessage>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-base">
        <span className="text-muted">Colour:</span>
        <button
          type="button"
          aria-pressed={color === 'all'}
          onClick={() => setColor('all')}
          className={`min-h-10 rounded-full px-3 font-bold ${color === 'all' ? 'bg-accent-soft text-accent' : 'text-muted'}`}
        >
          All
        </button>
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={color === c}
            onClick={() => setColor(c)}
            className={`flex min-h-10 items-center gap-1.5 rounded-full px-3 font-bold capitalize ${
              color === c ? 'bg-accent-soft text-accent' : 'text-muted'
            }`}
          >
            <span className={`hl-${c} h-4 w-4 rounded-full border border-line`} aria-hidden="true" />
            {c}
          </button>
        ))}
      </div>
      <SortToggle value={sort} onChange={setSort} />
      {items.length === 0 && <p className="py-8 text-center text-lg text-muted">No highlights match these filters.</p>}
      <ul className="divide-y divide-line">
        {items.map((h) => (
          <li key={`${h.translation}:${h.book}.${h.chapter}.${h.verse}`} className="flex items-start gap-3 py-4">
            <button type="button" onClick={() => nav.openPassage(h)} className="min-w-0 flex-1 rounded-xl p-1 text-left hover:bg-accent-soft">
              <span className="flex items-center gap-2 font-bold text-accent">
                {formatRef(h)}
                <span className="font-normal capitalize text-muted">, {h.color}</span>
              </span>
              <span className="scripture mt-1 block text-lg text-ink">
                <span className={`hl-${h.color} box-decoration-clone rounded px-1`}>{text(h.translation, h.book, h.chapter, h.verse) ?? '…'}</span>
              </span>
            </button>
            <button
              type="button"
              className={btn.icon}
              aria-label={`Remove highlight on ${formatRef(h)}`}
              onClick={() => actions.setHighlight(h, null)}
            >
              <Icon name="trash" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotesList({ book, nav }: ListProps) {
  const { data, actions } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Note | null>(null);
  const [sort, setSort] = useState<SortMode>('recent');
  const items = useMemo(
    () =>
      Object.values(data.notes)
        .filter(inBook(book))
        .sort(sort === 'recent' ? (a, b) => b.updatedAt - a.updatedAt : byBibleOrder),
    [data.notes, book, sort],
  );
  const text = useVerseLookup(items);

  if (Object.keys(data.notes).length === 0) {
    return (
      <StatusMessage title="No notes yet" action={{ label: 'Open the Bible', onClick: () => nav.go({ view: 'bible' }) }}>
        While reading, tap a verse and choose Note to write down a thought or a prayer.
      </StatusMessage>
    );
  }

  return (
    <div>
      <SortToggle value={sort} onChange={setSort} />
      <ul className="divide-y divide-line">
        {items.map((n) => (
          <li key={`${n.translation}:${n.book}.${n.chapter}.${n.verse}`} className="py-5">
            <button type="button" onClick={() => nav.openPassage(n)} className="w-full rounded-xl p-1 text-left hover:bg-accent-soft">
              <span className="font-bold text-accent">{formatRef(n)}</span>
              <span className="scripture mt-1 block text-base text-muted">{text(n.translation, n.book, n.chapter, n.verse) ?? '…'}</span>
            </button>
            <p className="mt-2 whitespace-pre-wrap border-l-4 border-accent pl-4 text-lg leading-relaxed text-ink">{n.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="mr-2 text-sm text-muted">Edited {formatDate(n.updatedAt)}</span>
              <button type="button" className={btn.quiet} onClick={() => setEditing(n)}>
                <Icon name="edit" /> Edit
              </button>
              <button
                type="button"
                className={btn.quiet}
                onClick={() => {
                  if (window.confirm(`Delete your note on ${formatRef(n)}?`)) {
                    actions.deleteNote(n);
                    toast('Note deleted');
                  }
                }}
              >
                <Icon name="trash" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="py-8 text-center text-lg text-muted">No notes in this book.</p>}
      <NoteEditor
        open={!!editing}
        reference={editing ? formatRef(editing) : ''}
        verseText={editing ? text(editing.translation, editing.book, editing.chapter, editing.verse) ?? '' : ''}
        initialText={editing?.text ?? ''}
        onClose={() => setEditing(null)}
        onSave={(t) => {
          if (editing) actions.saveNote(editing, t);
          setEditing(null);
          toast('Note saved');
        }}
        onDelete={() => {
          if (editing) actions.deleteNote(editing);
          setEditing(null);
          toast('Note deleted');
        }}
      />
    </div>
  );
}

export function BookmarksList({ book, nav }: ListProps) {
  const { data, actions } = useStore();
  const [sort, setSort] = useState<SortMode>('recent');
  const items = useMemo(
    () =>
      data.bookmarks
        .filter(inBook(book))
        .sort(sort === 'recent' ? (a, b) => b.createdAt - a.createdAt : byBibleOrder),
    [data.bookmarks, book, sort],
  );
  const text = useVerseLookup(items);
  const last = data.lastLocation;

  return (
    <div>
      {last && (
        <div className="mb-6 rounded-2xl bg-accent-soft p-4">
          <p className="text-base text-muted">Where you stopped reading</p>
          <button type="button" className="mt-1 flex min-h-12 items-center gap-2 font-serif text-xl font-semibold text-accent" onClick={() => nav.openPassage(last)}>
            {formatRef(last)} <Icon name="right" />
          </button>
        </div>
      )}
      {data.bookmarks.length === 0 ? (
        <StatusMessage title="No bookmarks yet">
          Tap a verse and choose Bookmark, or use Bookmark chapter at the top of any chapter.
        </StatusMessage>
      ) : (
        <>
          <SortToggle value={sort} onChange={setSort} />
          <ul className="divide-y divide-line">
            {items.map((b) => (
              <li key={b.id} className="flex items-start gap-3 py-4">
                <button type="button" onClick={() => nav.openPassage(b)} className="min-w-0 flex-1 rounded-xl p-1 text-left hover:bg-accent-soft">
                  <span className="flex items-center gap-2 font-bold text-accent">
                    <Icon name="bookmark" className="h-4 w-4" />
                    {formatRef(b)}
                    <span className="font-normal text-muted">{b.kind === 'chapter' ? ', whole chapter' : ''}</span>
                  </span>
                  <span className="scripture mt-1 line-clamp-3 block text-lg text-ink">
                    {text(b.translation, b.book, b.chapter, b.verse) ?? '…'}
                  </span>
                </button>
                <button type="button" className={btn.icon} aria-label={`Remove bookmark ${formatRef(b)}`} onClick={() => actions.removeBookmark(b.id)}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p className="py-8 text-center text-lg text-muted">No bookmarks in this book.</p>}
        </>
      )}
    </div>
  );
}
