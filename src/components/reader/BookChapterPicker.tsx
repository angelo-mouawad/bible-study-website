import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { CANON, getCanonBook } from '../../data/canon';
import { useStore } from '../../store/AppStore';
import { chapterStatus } from '../../services/progress';
import type { BookId, ChapterRef } from '../../types/bible';

interface Props {
  open: boolean;
  current: ChapterRef;
  onClose: () => void;
  onSelect: (ref: ChapterRef) => void;
}

/** Two simple steps: choose a book, then a chapter. Big targets, no tiny dropdowns. */
export function BookChapterPicker({ open, current, onClose, onSelect }: Props) {
  const { data } = useStore();
  const [book, setBook] = useState<BookId | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (open) {
      setBook(null);
      setFilter('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? CANON.filter((b) => b.name.toLowerCase().includes(f) || b.aliases.some((a) => a.startsWith(f))) : CANON;
  }, [filter]);

  const chosen = book ? getCanonBook(book) : undefined;

  return (
    <Modal open={open} onClose={onClose} title={chosen ? chosen.name : 'Choose a book'} size="large">
      {chosen ? (
        <div>
          <button type="button" className={`${btn.quiet} -ml-3 mb-3`} onClick={() => setBook(null)}>
            <Icon name="left" /> All books
          </button>
          <p className="mb-3 text-lg text-muted">Choose a chapter</p>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
            {Array.from({ length: chosen.chapters }, (_, i) => i + 1).map((c) => {
              const status = chapterStatus(data, chosen.id, c);
              const isCurrent = chosen.id === current.book && c === current.chapter;
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => onSelect({ book: chosen.id, chapter: c })}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`Chapter ${c}${status === 'completed' ? ', read' : status === 'in-progress' ? ', in progress' : ''}`}
                    className={`relative flex h-14 w-full items-center justify-center rounded-xl border-2 text-lg font-bold transition-colors ${
                      isCurrent
                        ? 'border-accent bg-accent text-accent-ink'
                        : status === 'completed'
                          ? 'border-accent-soft bg-accent-soft text-accent hover:border-accent'
                          : 'border-line text-ink hover:border-accent'
                    }`}
                  >
                    {c}
                    {status === 'completed' && !isCurrent && (
                      <Icon name="check" className="absolute right-1 top-1 h-3.5 w-3.5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>
          <label htmlFor="book-filter" className="sr-only">
            Find a book
          </label>
          <input
            id="book-filter"
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type a book name"
            autoComplete="off"
            className="mb-5 min-h-12 w-full rounded-xl border-2 border-line bg-paper px-4 text-lg text-ink placeholder:text-muted"
          />
          {(['OT', 'NT'] as const).map((t) => {
            const books = filtered.filter((b) => b.testament === t);
            if (!books.length) return null;
            return (
              <section key={t} className="mb-6">
                <h3 className="mb-2 font-serif text-lg font-semibold text-muted">
                  {t === 'OT' ? 'Old Testament' : 'New Testament'}
                </h3>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {books.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => (b.chapters === 1 ? onSelect({ book: b.id, chapter: 1 }) : setBook(b.id))}
                        className={`flex min-h-12 w-full items-center rounded-xl px-3 text-left text-lg transition-colors ${
                          b.id === current.book ? 'bg-accent-soft font-bold text-accent' : 'text-ink hover:bg-accent-soft'
                        }`}
                      >
                        {b.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-center text-lg text-muted">No book matches "{filter}".</p>}
        </div>
      )}
    </Modal>
  );
}
