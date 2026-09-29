import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { ProgressBar } from '../ui/ProgressBar';
import { useStore } from '../../store/AppStore';
import { bookProgress, chapterStatus } from '../../services/progress';
import type { CanonBook } from '../../types/bible';
import type { ChapterStatus } from '../../types/storage';
import type { Nav } from '../../types/nav';

const NEXT: Record<ChapterStatus, ChapterStatus> = { unread: 'in-progress', 'in-progress': 'completed', completed: 'unread' };
const LABEL: Record<ChapterStatus, string> = { unread: 'unread', 'in-progress': 'in progress', completed: 'completed' };

export function BookProgressRow({ book, nav }: { book: CanonBook; nav: Nav }) {
  const { data, actions } = useStore();
  const [open, setOpen] = useState(false);
  const p = bookProgress(data, book.id, book.chapters);
  const done = p.completed === p.total;
  const panelId = `chapters-${book.id}`;

  return (
    <li className="py-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl px-2 py-2 text-left hover:bg-accent-soft"
      >
        <span className="flex items-center gap-2 text-lg font-bold">
          {done && <Icon name="check" className="h-5 w-5 text-accent" />}
          {book.name}
        </span>
        <span className="flex items-center gap-2 text-base text-muted">
          {p.completed} of {p.total}
          <Icon name="down" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
        <ProgressBar className="col-span-2 h-1.5" value={p.completed} max={p.total} label={`${book.name}: ${p.completed} of ${p.total} chapters read`} />
      </button>

      {open && (
        <div id={panelId} className="px-2 pb-4 pt-3">
          <p className="mb-3 text-base text-muted">Tap a chapter to change it: unread, in progress, completed.</p>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2">
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
              const s = chapterStatus(data, book.id, c);
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => actions.setChapterStatus({ book: book.id, chapter: c }, NEXT[s])}
                    aria-label={`${book.name} ${c}, ${LABEL[s]}. Change status`}
                    className={`relative flex h-12 w-full items-center justify-center rounded-xl border-2 text-base font-bold ${
                      s === 'completed'
                        ? 'border-accent bg-accent text-accent-ink'
                        : s === 'in-progress'
                          ? 'border-accent border-dashed bg-accent-soft text-accent'
                          : 'border-line text-muted'
                    }`}
                  >
                    {c}
                    {s === 'in-progress' && <Icon name="half" className="absolute right-0.5 top-0.5 h-3 w-3" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btn.secondary} onClick={() => nav.go({ view: 'bible', book: book.id, chapter: 1 })}>
              Open {book.name}
            </button>
            {!done && (
              <button type="button" className={btn.quiet} onClick={() => actions.setBookStatus(book.id, 'completed')}>
                Mark whole book read
              </button>
            )}
            {(p.completed > 0 || p.inProgress > 0) && (
              <button
                type="button"
                className={btn.quiet}
                onClick={() => window.confirm(`Clear your progress in ${book.name}?`) && actions.setBookStatus(book.id, 'unread')}
              >
                Clear book
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
