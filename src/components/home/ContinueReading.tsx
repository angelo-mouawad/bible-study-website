import { Icon } from '../ui/Icon';
import { useAsync } from '../../hooks/useAsync';
import { loadBook } from '../../services/bibleService';
import { isRead, nextUnreadChapter } from '../../services/progress';
import { useStore } from '../../store/AppStore';
import { formatRef, nextChapter } from '../../utils/references';
import type { Nav } from '../../types/nav';

/** The hero tile: the actual words where the reader stopped, on a warm dark card. */
export function ContinueReading({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const loc = data.lastLocation ?? { book: 'GEN', chapter: 1, verse: undefined, translation: data.preferences.translation };
  const book = useAsync(`${loc.translation}:${loc.book}`, () => loadBook(loc.translation, loc.book));
  const verse = loc.verse ?? 1;
  const text = book.status === 'ready' ? book.value.chapters[loc.chapter - 1]?.[verse - 1] : undefined;
  const chapterLength = book.status === 'ready' ? book.value.chapters[loc.chapter - 1]?.length ?? 0 : 0;
  const finished = isRead(data, loc);
  const next = finished ? nextUnreadChapter(data, loc) ?? nextChapter(loc) : undefined;
  const position = chapterLength ? Math.min(1, verse / chapterLength) : 0;

  return (
    <section
      aria-labelledby="continue"
      className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-cocoa via-[#5a3d27] to-accent p-6 text-[#fff9f1] shadow-[0_24px_50px_-24px_rgb(61_42_28/0.7)] sm:p-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(242_211_164/0.4),transparent_65%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <h2 id="continue" className="flex items-center gap-2 text-sm font-bold opacity-80">
          <span className="h-2 w-2 rounded-full bg-[#f2d3a4] shadow-[0_0_10px_#f2d3a4]" aria-hidden="true" />
          {data.lastLocation ? 'Continue reading' : 'Start reading'}
        </h2>
        {finished && (
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
            <Icon name="check" className="h-4 w-4" /> Chapter read
          </span>
        )}
      </div>
      <p className="relative mt-3 font-display text-[2rem] font-semibold leading-none tracking-[-0.02em]">{formatRef(loc)}</p>
      <p className="scripture relative mt-4 line-clamp-4 max-w-2xl flex-1 text-[1.2rem] leading-relaxed opacity-95 sm:text-[1.35rem]">
        {text ?? '\u00a0'}
      </p>
      {chapterLength > 0 && (
        <div className="relative mt-5">
          <div className="mb-1.5 flex justify-between text-xs font-bold opacity-75">
            <span>Verse {verse}</span>
            <span>{chapterLength} verses</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
            <div className="h-full rounded-full bg-[#f2d3a4]" style={{ width: `${position * 100}%` }} />
          </div>
        </div>
      )}
      <div className="relative mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => nav.openPassage(loc)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#fff9f1] px-6 font-bold text-[#2a1d13] transition-transform hover:-translate-y-px"
        >
          {data.lastLocation ? 'Continue' : 'Open Genesis 1'} <Icon name="right" />
        </button>
        {next && (
          <button
            type="button"
            onClick={() => nav.openPassage(next)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-5 font-bold hover:bg-white/10"
          >
            Next unread: {formatRef(next)}
          </button>
        )}
      </div>
    </section>
  );
}
