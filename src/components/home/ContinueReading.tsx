import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { useAsync } from '../../hooks/useAsync';
import { loadBook } from '../../services/bibleService';
import { isRead, nextUnreadChapter } from '../../services/progress';
import { useStore } from '../../store/AppStore';
import { formatRef, nextChapter } from '../../utils/references';
import type { Nav } from '../../types/nav';

/** Shows the actual words where the reader stopped, so picking up again feels immediate. */
export function ContinueReading({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const loc = data.lastLocation ?? { book: 'GEN', chapter: 1, verse: undefined, translation: data.preferences.translation };
  const book = useAsync(`${loc.translation}:${loc.book}`, () => loadBook(loc.translation, loc.book));
  const verse = loc.verse ?? 1;
  const text = book.status === 'ready' ? book.value.chapters[loc.chapter - 1]?.[verse - 1] : undefined;
  const finished = isRead(data, loc);
  const next = finished ? nextUnreadChapter(data, loc) ?? nextChapter(loc) : undefined;

  return (
    <section aria-labelledby="continue" className="border-y border-line py-8">
      <h2 id="continue" className="text-lg font-bold text-accent">
        {data.lastLocation ? 'Continue reading' : 'Start reading'}
      </h2>
      <p className="mt-2 font-serif text-2xl font-semibold text-ink">{formatRef({ ...loc, verse: loc.verse })}</p>
      <p className="scripture mt-3 max-w-3xl text-[1.35rem] leading-relaxed text-ink sm:text-[1.6rem]">
        {text ?? (book.status === 'error' ? '' : '\u00a0')}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={btn.primary} onClick={() => nav.openPassage(loc)}>
          {data.lastLocation ? 'Continue' : 'Open Genesis 1'} <Icon name="right" />
        </button>
        {next && (
          <button type="button" className={btn.secondary} onClick={() => nav.openPassage(next)}>
            Next unread: {formatRef(next)}
          </button>
        )}
      </div>
    </section>
  );
}
