import { Icon } from '../ui/Icon';
import { Panel } from '../ui/Panel';
import { CANON } from '../../data/canon';
import { useStore } from '../../store/AppStore';
import { bookProgress, nextUnreadChapter } from '../../services/progress';
import { formatRef } from '../../utils/references';
import type { Nav } from '../../types/nav';

export function TestamentsPanel({ nav, className = '' }: { nav: Nav; className?: string }) {
  const { data } = useStore();
  const parts = (['OT', 'NT'] as const).map((t) => {
    const books = CANON.filter((b) => b.testament === t);
    let done = 0;
    let total = 0;
    for (const b of books) {
      const p = bookProgress(data, b.id, b.chapters);
      done += p.completed;
      total += p.total;
    }
    return { t, name: t === 'OT' ? 'Old Testament' : 'New Testament', done, total };
  });
  const next = nextUnreadChapter(data);

  return (
    <Panel title="Testaments" id="testaments" className={className}>
      <ul className="space-y-5">
        {parts.map((p) => {
          const pct = p.total ? p.done / p.total : 0;
          return (
            <li key={p.t}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-bold text-ink">{p.name}</span>
                <span className="tabular text-sm font-semibold text-muted">
                  {p.done} / {p.total}
                </span>
              </div>
              {/* Segmented bar: one segment per 5% for a more instrument-like look. */}
              <div
                className="flex gap-[3px]"
                role="progressbar"
                aria-label={`${p.name} progress`}
                aria-valuemin={0}
                aria-valuemax={p.total}
                aria-valuenow={p.done}
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3 flex-1 rounded-[4px] ${i < Math.ceil(pct * 20) ? 'bg-gradient-to-t from-accent-strong to-flame' : 'bg-line'}`}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      {next && (
        <button
          type="button"
          onClick={() => nav.openPassage(next)}
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-2xl bg-accent-soft/80 p-4 text-left hover:bg-accent-soft"
        >
          <span>
            <span className="block text-sm font-bold text-muted">First unread chapter</span>
            <span className="font-display text-lg font-semibold text-ink">{formatRef(next)}</span>
          </span>
          <Icon name="right" className="h-5 w-5 text-accent" />
        </button>
      )}
    </Panel>
  );
}
