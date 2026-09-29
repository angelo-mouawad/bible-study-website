import { Icon, type IconName } from '../ui/Icon';
import { Panel } from '../ui/Panel';
import { useStore } from '../../store/AppStore';
import { useVerseLookup } from '../../hooks/useVerseLookup';
import { formatRef } from '../../utils/references';
import type { StudyTab } from '../../hooks/useRoute';
import type { Location } from '../../types/bible';
import type { Nav } from '../../types/nav';

const LIMIT = 3;

export function RecentItems({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const highlights = Object.values(data.highlights).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, LIMIT);
  const notes = Object.values(data.notes).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, LIMIT);
  const bookmarks = data.bookmarks.slice(0, LIMIT);
  const text = useVerseLookup([...highlights, ...bookmarks]);

  const columns: {
    tab: StudyTab;
    title: string;
    icon: IconName;
    total: number;
    empty: string;
    items: { key: string; loc: Location; body: string; mark?: string }[];
  }[] = [
    {
      tab: 'highlights',
      title: 'Highlights',
      icon: 'highlight',
      total: Object.keys(data.highlights).length,
      empty: 'Tap any verse while reading to highlight it.',
      items: highlights.map((h) => ({
        key: `${h.book}${h.chapter}.${h.verse}`,
        loc: h,
        body: text(h.translation, h.book, h.chapter, h.verse) ?? '',
        mark: `hl-${h.color}`,
      })),
    },
    {
      tab: 'notes',
      title: 'Notes',
      icon: 'note',
      total: Object.keys(data.notes).length,
      empty: 'Tap a verse and choose Note to write down a thought.',
      items: notes.map((n) => ({ key: `${n.book}${n.chapter}.${n.verse}`, loc: n, body: n.text })),
    },
    {
      tab: 'bookmarks',
      title: 'Bookmarks',
      icon: 'bookmark',
      total: data.bookmarks.length,
      empty: 'Bookmark verses or chapters to find them again quickly.',
      items: bookmarks.map((b) => ({ key: b.id, loc: b, body: text(b.translation, b.book, b.chapter, b.verse) ?? '' })),
    },
  ];

  return (
    <>
      {columns.map((c) => (
        <Panel
          key={c.tab}
          id={`recent-${c.tab}`}
          title={c.title}
          className="lg:col-span-4"
          action={
            <button
              type="button"
              className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-accent hover:bg-accent-soft"
              onClick={() => nav.go({ view: 'study', tab: c.tab })}
            >
              <span className="tabular rounded-full bg-accent-soft px-2 py-0.5 text-xs">{c.total}</span>
              See all<span className="sr-only"> {c.title.toLowerCase()}</span>
            </button>
          }
        >
          {c.items.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-sand p-4 text-sm text-muted">
              <Icon name={c.icon} className="h-5 w-5 text-sand" />
              {c.empty}
            </div>
          ) : (
            <ul className="space-y-1">
              {c.items.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => nav.openPassage(item.loc)}
                    className="w-full rounded-2xl p-3 text-left transition-colors hover:bg-accent-soft/70"
                  >
                    <span className="block text-sm font-bold text-ink">{formatRef(item.loc)}</span>
                    <span className={`mt-1 line-clamp-2 text-[0.95rem] text-muted ${c.tab === 'notes' ? '' : 'scripture'}`}>
                      {item.mark ? (
                        <span className={`${item.mark} box-decoration-clone rounded px-1 text-ink`}>{item.body}</span>
                      ) : (
                        item.body
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ))}
    </>
  );
}
