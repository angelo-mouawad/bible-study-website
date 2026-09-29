import type { BookData, BookId, Testament } from '../types/bible';
import { getCanonBook } from '../data/canon';

export interface SearchHit {
  book: BookId;
  chapter: number;
  verse: number;
  text: string;
}

export interface SearchOptions {
  scope: 'all' | Testament | BookId;
  limit: number;
}

export interface WordQuery {
  /** Terms that must all appear. A quoted query becomes a single phrase term. */
  terms: string[];
  isPhrase: boolean;
}

export function parseWordQuery(input: string): WordQuery | null {
  const text = input.trim().toLowerCase();
  if (text.length < 2) return null;
  const quoted = text.match(/^"(.+)"$/);
  if (quoted) return { terms: [quoted[1].trim()], isPhrase: true };
  const terms = text.split(/\s+/).filter((t) => t.length > 0);
  return terms.length ? { terms, isPhrase: false } : null;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Marks whole words that start with a term, so "love" marks "love" and "loved" but not "glove". */
export function termPattern(terms: string[]): RegExp {
  return new RegExp(`\\b((?:${terms.map(escapeRegExp).join('|')})\\w*)`, 'gi');
}

export function searchBooks(books: BookData[], query: WordQuery, options: SearchOptions): {
  hits: SearchHit[];
  total: number;
} {
  const tests = query.terms.map((t) => new RegExp(`\\b${escapeRegExp(t)}`, 'i'));
  const hits: SearchHit[] = [];
  let total = 0;
  for (const book of books) {
    if (options.scope !== 'all') {
      const testament = getCanonBook(book.id)?.testament;
      if (options.scope === 'OT' || options.scope === 'NT') {
        if (testament !== options.scope) continue;
      } else if (book.id !== options.scope) continue;
    }
    book.chapters.forEach((verses, ci) => {
      verses.forEach((text, vi) => {
        if (tests.every((re) => re.test(text))) {
          total += 1;
          if (hits.length < options.limit) hits.push({ book: book.id, chapter: ci + 1, verse: vi + 1, text });
        }
      });
    });
  }
  return { hits, total };
}
