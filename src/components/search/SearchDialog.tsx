import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { CANON, getCanonBook } from '../../data/canon';
import { loadAllBooks } from '../../services/bibleService';
import { parseWordQuery, searchBooks, termPattern, type SearchHit, type SearchOptions } from '../../services/search';
import { useStore } from '../../store/AppStore';
import type { BookData } from '../../types/bible';
import type { Nav } from '../../types/nav';
import { formatRef, parseReference } from '../../utils/references';

const PAGE = 50;
const EXAMPLES = ['John 3:16', 'Psalm 23', 'love', '"the Lord is my shepherd"', 'faith hope'];

interface Props {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  nav: Nav;
}

export function SearchDialog({ open, initialQuery, onClose, nav }: Props) {
  const translationId = useStore().data.preferences.translation;
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [scope, setScope] = useState<SearchOptions['scope']>('all');
  const [limit, setLimit] = useState(PAGE);
  const [books, setBooks] = useState<BookData[] | null>(null);
  const [loading, setLoading] = useState<{ loaded: number; total: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadingFor = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setDebounced(initialQuery);
    }
  }, [open, initialQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => setLimit(PAGE), [debounced, scope]);

  const reference = useMemo(() => parseReference(debounced), [debounced]);
  const wordQuery = useMemo(() => parseWordQuery(debounced), [debounced]);

  useEffect(() => {
    if (!open || !wordQuery || loadingFor.current === translationId) return;
    loadingFor.current = translationId;
    setBooks(null);
    setLoadError(null);
    setLoading({ loaded: 0, total: CANON.length });
    loadAllBooks(translationId, (loaded, total) => setLoading({ loaded, total }))
      .then((all) => {
        setBooks(all);
        setLoading(null);
      })
      .catch((err: unknown) => {
        loadingFor.current = null;
        setLoading(null);
        setLoadError(err instanceof Error ? err.message : 'Unknown error');
      });
  }, [open, wordQuery, translationId]);

  const results = useMemo(
    () => (books && wordQuery ? searchBooks(books, wordQuery, { scope, limit }) : null),
    [books, wordQuery, scope, limit],
  );

  const openHit = (loc: { book: string; chapter: number; verse?: number }) => {
    onClose();
    nav.openPassage(loc);
  };

  const refBook = reference ? getCanonBook(reference.book) : undefined;

  return (
    <Modal open={open} onClose={onClose} title="Search the Bible" size="large">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input" className="sr-only">
          Search words, phrases or references
        </label>
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Try John 3:16, Genesis 1 or a word like love"
            className="min-h-14 w-full rounded-full border border-line bg-paper pl-12 pr-5 text-lg text-ink placeholder:text-muted"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label htmlFor="search-scope" className="text-base text-muted">
            Search in
          </label>
          <select
            id="search-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="min-h-11 rounded-full border border-line bg-surface px-4 text-base text-ink"
          >
            <option value="all">The whole Bible</option>
            <option value="OT">Old Testament</option>
            <option value="NT">New Testament</option>
            {CANON.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {!debounced.trim() && (
          <div>
            <p className="mb-3 text-lg text-muted">Search for a word, a phrase in quotes, a book, a chapter or a verse.</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className={`${btn.secondary} min-h-11 text-base`} onClick={() => setQuery(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {reference && refBook && (
          <button
            type="button"
            onClick={() => openHit(reference)}
            className="mb-5 flex w-full items-center justify-between gap-4 rounded-[22px] bg-gradient-to-br from-cocoa to-accent px-5 py-4 text-left text-[#fff9f1] hover:brightness-110"
          >
            <span>
              <span className="block text-base opacity-90">Go to</span>
              <span className="font-display text-xl font-semibold">{formatRef(reference)}</span>
            </span>
            <Icon name="right" />
          </button>
        )}

        {wordQuery && loading && (
          <p role="status" className="text-lg text-muted">
            Preparing search ({loading.loaded} of {loading.total} books)…
          </p>
        )}
        {wordQuery && loadError && (
          <p role="alert" className="text-lg text-ink">
            Search could not load the Bible text. Check your connection and try again.
          </p>
        )}

        {results && (
          <SearchResults
            hits={results.hits}
            total={results.total}
            terms={wordQuery?.terms ?? []}
            onOpen={openHit}
            onMore={() => setLimit((l) => l + PAGE)}
            hasReference={!!reference}
            query={debounced}
          />
        )}
      </div>
    </Modal>
  );
}

function SearchResults({
  hits,
  total,
  terms,
  onOpen,
  onMore,
  hasReference,
  query,
}: {
  hits: SearchHit[];
  total: number;
  terms: string[];
  onOpen: (hit: SearchHit) => void;
  onMore: () => void;
  hasReference: boolean;
  query: string;
}) {
  if (total === 0) {
    if (hasReference) return null;
    return (
      <div className="py-6 text-center">
        <p className="font-display text-xl font-semibold">No verses contain "{query.replace(/"/g, '')}"</p>
        <p className="mt-2 text-lg text-muted">
          The King James Version uses older English, so try other forms of the word (for example "believeth" instead of
          "believes"), fewer words, or search the whole Bible.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 text-base text-muted">
        {total.toLocaleString()} {total === 1 ? 'verse' : 'verses'} found
      </p>
      <ul className="divide-y divide-line">
        {hits.map((h) => (
          <li key={`${h.book}.${h.chapter}.${h.verse}`}>
            <button type="button" onClick={() => onOpen(h)} className="w-full rounded-2xl px-3 py-3 text-left hover:bg-accent-soft">
              <span className="block font-bold text-accent">{formatRef(h)}</span>
              <span className="scripture mt-1 block text-lg text-ink">
                <Marked text={h.text} terms={terms} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hits.length < total && (
        <div className="mt-4 text-center">
          <button type="button" className={btn.secondary} onClick={onMore}>
            Show more results
          </button>
        </div>
      )}
    </div>
  );
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const parts = text.split(termPattern(terms));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-accent-soft font-semibold text-ink">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
