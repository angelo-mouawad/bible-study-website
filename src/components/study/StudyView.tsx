import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { heading } from '../ui/styles';
import { HighlightsList, NotesList, BookmarksList } from './StudyLists';
import { CANON } from '../../data/canon';
import { useStore } from '../../store/AppStore';
import type { StudyTab } from '../../hooks/useRoute';
import type { Nav } from '../../types/nav';

const TABS: { id: StudyTab; label: string }[] = [
  { id: 'highlights', label: 'Highlights' },
  { id: 'notes', label: 'Notes' },
  { id: 'bookmarks', label: 'Bookmarks' },
];

export function StudyView({ tab, nav }: { tab: StudyTab; nav: Nav }) {
  const { data } = useStore();
  const [book, setBook] = useState('all');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const counts = {
    highlights: Object.keys(data.highlights).length,
    notes: Object.keys(data.notes).length,
    bookmarks: data.bookmarks.length,
  };

  // Only offer books that actually have saved items, so the filter is never a long empty list.
  const booksWithItems = useMemo(() => {
    const ids = new Set<string>();
    Object.values(data.highlights).forEach((h) => ids.add(h.book));
    Object.values(data.notes).forEach((n) => ids.add(n.book));
    data.bookmarks.forEach((b) => ids.add(b.book));
    return CANON.filter((b) => ids.has(b.id));
  }, [data.highlights, data.notes, data.bookmarks]);

  // Arrow keys move between tabs, as screen reader users expect.
  const onTabKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = TABS[(i + dir + TABS.length) % TABS.length];
    nav.go({ view: 'study', tab: next.id });
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className={heading.page}>Study</h1>
      <p className="mt-3 text-lg text-muted">Everything you have highlighted, written and saved, in one place.</p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-line">
        <div role="tablist" aria-label="Study sections" className="flex gap-1" onKeyDown={onTabKey}>
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => nav.go({ view: 'study', tab: t.id })}
                className={`-mb-px min-h-12 border-b-[3px] px-3 text-lg font-bold sm:px-4 ${
                  active ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t.label} <span className="font-normal">({counts[t.id]})</span>
              </button>
            );
          })}
        </div>
        {booksWithItems.length > 1 && (
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="study-book" className="text-base text-muted">
              Book
            </label>
            <select
              id="study-book"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="min-h-11 rounded-xl border-2 border-line bg-surface px-3 text-base text-ink"
            >
              <option value="all">All books</option>
              {booksWithItems.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-4">
        {tab === 'highlights' && <HighlightsList book={book} nav={nav} />}
        {tab === 'notes' && <NotesList book={book} nav={nav} />}
        {tab === 'bookmarks' && <BookmarksList book={book} nav={nav} />}
      </div>
    </div>
  );
}
