import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { btn } from '../ui/styles';
import { useStore } from '../../store/AppStore';
import { bookProgress, chapterStatus } from '../../services/progress';
import type { CanonBook } from '../../types/bible';
import type { ChapterStatus } from '../../types/storage';
import type { Nav } from '../../types/nav';

const NEXT: Record<ChapterStatus, ChapterStatus> = { unread: 'in-progress', 'in-progress': 'completed', completed: 'unread' };
const LABEL: Record<ChapterStatus, string> = { unread: 'unread', 'in-progress': 'in progress', completed: 'completed' };

export function BookTile({ book, nav }: { book: CanonBook; nav: Nav }) {
  const { data, actions } = useStore();
  const [open, setOpen] = useState(false);
  const p = bookProgress(data, book.id, book.chapters);
  const done = p.completed === p.total;
  const pct = p.total ? p.completed / p.total : 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${book.name}: ${p.completed} of ${p.total} chapters read${done ? ', finished' : ''}. Show chapters`}
        className={`relative flex h-24 w-full flex-col justify-between overflow-hidden rounded-2xl p-3 text-left ring-1 transition-all hover:-translate-y-px ${
          done ? 'bg-gradient-to-br from-accent to-cocoa text-accent-ink ring-transparent' : 'bg-surface/70 text-ink ring-line hover:ring-sand'
        }`}
      >
        {!done && pct > 0 && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sand/70 to-sand/20"
            style={{ height: `${Math.max(8, pct * 100)}%` }}
          />
        )}
        <span className="relative flex items-start justify-between gap-1">
          <span className="font-bold leading-tight">{book.name}</span>
          {done && <Icon name="check" className="h-5 w-5" />}
        </span>
        <span className={`tabular relative text-sm font-semibold ${done ? 'opacity-85' : 'text-muted'}`}>
          {p.completed}/{p.total}
          {p.inProgress > 0 && <span className="ml-1">· {p.inProgress} in progress</span>}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={book.name} size="large">
        <p className="mb-4 text-base text-muted">Tap a chapter to change it: unread, then in progress, then completed.</p>
        <div className="mb-4 flex flex-wrap gap-4 text-sm font-semibold text-muted" aria-hidden="true">
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border-2 border-line bg-surface" /> Unread</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-md border-2 border-dashed border-accent bg-accent-soft" /> In progress</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-md bg-cocoa" /> Completed</span>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
            const s = chapterStatus(data, book.id, c);
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => actions.setChapterStatus({ book: book.id, chapter: c }, NEXT[s])}
                  aria-label={`${book.name} ${c}, ${LABEL[s]}. Change status`}
                  className={`tabular relative flex h-12 w-full items-center justify-center rounded-xl border-2 font-display font-semibold ${
                    s === 'completed'
                      ? 'border-cocoa bg-cocoa text-paper'
                      : s === 'in-progress'
                        ? 'border-dashed border-accent bg-accent-soft text-accent'
                        : 'border-line bg-surface text-muted'
                  }`}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={btn.primary}
            onClick={() => {
              setOpen(false);
              nav.go({ view: 'bible', book: book.id, chapter: 1 });
            }}
          >
            Open {book.name}
          </button>
          {!done && (
            <button type="button" className={btn.secondary} onClick={() => actions.setBookStatus(book.id, 'completed')}>
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
      </Modal>
    </li>
  );
}
