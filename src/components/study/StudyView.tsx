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

  const booksWithItems = useMemo(() => {
    const ids = new Set<string>();
    Object.values(data.highlights).forEach((h) => ids.add(h.book));
    Object.values(data.notes).forEach((n) => ids.add(n.book));
    data.bookmarks.forEach((b) => ids.add(b.book));
    return CANON.filter((b) => ids.has(b.id));
  }, [data.highlights, data.notes, data.bookmarks]);

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
    <div className="mx-auto max-w-4xl">
      <h1 className={heading.page}>Study</h1>
      <p className="mt-3 text-lg text-muted">Everything you have highlighted, written and saved, in one place.</p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Study sections" className="glass flex gap-1 rounded-full p-1.5" onKeyDown={onTabKey}>
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
                className={`flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.95rem] font-bold transition-all sm:px-4 ${
                  active ? 'bg-cocoa text-paper shadow-[0_6px_16px_-6px_rgb(61_42_28/0.6)]' : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
                <span className={`tabular rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-accent-soft'}`}>{counts[t.id]}</span>
              </button>
            );
          })}
        </div>
        {booksWithItems.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="study-book" className="text-base text-muted">
              Book
            </label>
            <select
              id="study-book"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              className="glass min-h-12 rounded-full px-4 text-base text-ink"
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

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="glass mt-5 rounded-[28px] p-4 sm:p-6">
        {tab === 'highlights' && <HighlightsList book={book} nav={nav} />}
        {tab === 'notes' && <NotesList book={book} nav={nav} />}
        {tab === 'bookmarks' && <BookmarksList book={book} nav={nav} />}
      </div>
    </div>
  );
}
