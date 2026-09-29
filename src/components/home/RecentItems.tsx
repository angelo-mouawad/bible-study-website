import { heading } from '../ui/styles';
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

  if (!highlights.length && !notes.length && !bookmarks.length) return null;

  const columns: { tab: StudyTab; title: string; items: { key: string; loc: Location; body: string; mark?: string }[] }[] = [
    {
      tab: 'highlights',
      title: 'Recent highlights',
      items: highlights.map((h) => ({
        key: `${h.book}${h.chapter}.${h.verse}`,
        loc: h,
        body: text(h.translation, h.book, h.chapter, h.verse) ?? '',
        mark: `hl-${h.color}`,
      })),
    },
    {
      tab: 'notes',
      title: 'Recent notes',
      items: notes.map((n) => ({ key: `${n.book}${n.chapter}.${n.verse}`, loc: n, body: n.text })),
    },
    {
      tab: 'bookmarks',
      title: 'Bookmarks',
      items: bookmarks.map((b) => ({ key: b.id, loc: b, body: text(b.translation, b.book, b.chapter, b.verse) ?? '' })),
    },
  ];

  return (
    <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
      {columns
        .filter((c) => c.items.length)
        .map((c) => (
          <section key={c.tab} aria-labelledby={`recent-${c.tab}`}>
            <div className="flex items-baseline justify-between">
              <h2 id={`recent-${c.tab}`} className={heading.section}>
                {c.title}
              </h2>
              <button type="button" className="min-h-11 px-2 font-bold text-accent hover:underline" onClick={() => nav.go({ view: 'study', tab: c.tab })}>
                See all<span className="sr-only"> {c.title.toLowerCase()}</span>
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {c.items.map((item) => (
                <li key={item.key}>
                  <button type="button" onClick={() => nav.openPassage(item.loc)} className="w-full rounded-xl p-2 text-left hover:bg-accent-soft">
                    <span className="block font-bold text-ink">{formatRef(item.loc)}</span>
                    <span className={`mt-0.5 line-clamp-2 text-base text-muted ${c.tab === 'notes' ? '' : 'scripture'}`}>
                      {item.mark ? <span className={`${item.mark} box-decoration-clone rounded px-1 text-ink`}>{item.body}</span> : item.body}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
