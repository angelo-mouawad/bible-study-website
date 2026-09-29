import { useEffect, useMemo, useState } from 'react';
import { loadBook } from '../services/bibleService';
import type { BookData } from '../types/bible';

interface Needed {
  translation: string;
  book: string;
}

export function useVerseLookup(items: Needed[]) {
  const [books, setBooks] = useState<Record<string, BookData>>({});
  const keys = useMemo(() => [...new Set(items.map((i) => `${i.translation}:${i.book}`))].sort().join('|'), [items]);

  useEffect(() => {
    let cancelled = false;
    for (const key of keys.split('|').filter(Boolean)) {
      const [translation, book] = key.split(':');
      loadBook(translation, book)
        .then((data) => !cancelled && setBooks((b) => (b[key] ? b : { ...b, [key]: data })))
        .catch(() => {
        });
    }
    return () => {
      cancelled = true;
    };
  }, [keys]);

  return (translation: string, book: string, chapter: number, verse?: number): string | undefined => {
    const data = books[`${translation}:${book}`];
    if (!data) return undefined;
    return verse ? data.chapters[chapter - 1]?.[verse - 1] : data.chapters[chapter - 1]?.[0];
  };
}
