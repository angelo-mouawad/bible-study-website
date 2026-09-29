import { getTranslationInfo } from '../data/translations';
import type { BibleTranslation, BookData, BookId } from '../types/bible';

// Requests are cached as promises, so a book is only downloaded once per visit
// even if several components ask for it at the same time.
const indexCache = new Map<string, Promise<BibleTranslation>>();
const bookCache = new Map<string, Promise<BookData>>();

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (status ${res.status}).`);
  return (await res.json()) as T;
}

function remember<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing;
  // Failed requests are removed so the user can retry.
  const promise = load().catch((err: unknown) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}

export function loadTranslation(translationId: string): Promise<BibleTranslation> {
  const info = getTranslationInfo(translationId);
  return remember(indexCache, info.id, async () => {
    const data = await fetchJson<BibleTranslation>(assetUrl(`${info.path}/index.json`));
    if (!Array.isArray(data.books) || data.books.length === 0) {
      throw new Error(`The ${info.name} index is empty or damaged.`);
    }
    return data;
  });
}

export function loadBook(translationId: string, bookId: BookId): Promise<BookData> {
  const info = getTranslationInfo(translationId);
  return remember(bookCache, `${info.id}:${bookId}`, async () => {
    const data = await fetchJson<BookData>(assetUrl(`${info.path}/${bookId}.json`));
    if (!Array.isArray(data.chapters)) throw new Error(`The data for ${bookId} is damaged.`);
    return data;
  });
}

/** Loads every book of a translation (about 4 MB for the KJV). Used by word search. */
export async function loadAllBooks(
  translationId: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<BookData[]> {
  const translation = await loadTranslation(translationId);
  let loaded = 0;
  const total = translation.books.length;
  return Promise.all(
    translation.books.map((b) =>
      loadBook(translationId, b.id).then((book) => {
        loaded += 1;
        onProgress?.(loaded, total);
        return book;
      }),
    ),
  );
}

export function getVerseText(book: BookData, chapter: number, verse: number): string | undefined {
  return book.chapters[chapter - 1]?.[verse - 1];
}
