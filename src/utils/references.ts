import { CANON, getCanonBook } from '../data/canon';
import type { BookId, ChapterRef, Location } from '../types/bible';

export const chapterKey = (book: BookId, chapter: number) => `${book}.${chapter}`;
export const verseKey = (translation: string, book: BookId, chapter: number, verse: number) =>
  `${translation}:${book}.${chapter}.${verse}`;

export function bookName(id: BookId): string {
  return getCanonBook(id)?.name ?? id;
}

export function formatRef(loc: Location & { endVerse?: number }): string {
  const name = loc.book === 'PSA' ? 'Psalm' : bookName(loc.book);
  const base = `${name} ${loc.chapter}`;
  if (!loc.verse) return base;
  return loc.endVerse && loc.endVerse > loc.verse ? `${base}:${loc.verse}-${loc.endVerse}` : `${base}:${loc.verse}`;
}

export function formatReadings(readings: ChapterRef[]): string {
  const groups: { book: BookId; chapters: number[] }[] = [];
  for (const r of readings) {
    const last = groups[groups.length - 1];
    if (last && last.book === r.book) last.chapters.push(r.chapter);
    else groups.push({ book: r.book, chapters: [r.chapter] });
  }
  return groups
    .map((g) => {
      const sorted = g.chapters;
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const contiguous = sorted.every((c, i) => c === first + i);
      const chapters = sorted.length > 1 && contiguous ? `${first}-${last}` : sorted.join(', ');
      return `${bookName(g.book)} ${chapters}`;
    })
    .join('; ');
}

const normalize = (s: string) => s.toLowerCase().replace(/[.\s]/g, '');

const lookup = new Map<string, BookId>();
for (const book of CANON) {
  lookup.set(normalize(book.name), book.id);
  for (const alias of book.aliases) lookup.set(normalize(alias), book.id);
}

export function findBook(input: string): BookId | undefined {
  const key = normalize(input);
  if (!key) return undefined;
  const exact = lookup.get(key);
  if (exact) return exact;
  if (key.length < 3) return undefined;
  const prefixed = CANON.filter((b) => normalize(b.name).startsWith(key));
  return prefixed.length === 1 ? prefixed[0].id : undefined;
}

export interface ParsedReference extends Location {
  endVerse?: number;
}

export function parseReference(input: string): ParsedReference | undefined {
  const text = input.trim().replace(/\s+/g, ' ');
  const match = text.match(/^(.+?)\s*(?:(\d+)(?:\s*[:.\s]\s*(\d+)(?:\s*-\s*(\d+))?)?)?$/);
  if (!match) return undefined;
  const [, bookPart, ch, v, end] = match;
  const book = findBook(bookPart);
  if (!book) return undefined;
  return {
    book,
    chapter: ch ? Number(ch) : 1,
    verse: v ? Number(v) : undefined,
    endVerse: end ? Number(end) : undefined,
  };
}

export function nextChapter(ref: ChapterRef): ChapterRef | undefined {
  const book = getCanonBook(ref.book);
  if (!book) return undefined;
  if (ref.chapter < book.chapters) return { book: ref.book, chapter: ref.chapter + 1 };
  const i = CANON.indexOf(book);
  return i < CANON.length - 1 ? { book: CANON[i + 1].id, chapter: 1 } : undefined;
}

export function previousChapter(ref: ChapterRef): ChapterRef | undefined {
  const book = getCanonBook(ref.book);
  if (!book) return undefined;
  if (ref.chapter > 1) return { book: ref.book, chapter: ref.chapter - 1 };
  const i = CANON.indexOf(book);
  if (i <= 0) return undefined;
  const prev = CANON[i - 1];
  return { book: prev.id, chapter: prev.chapters };
}

export function planMeta(plan: { days: unknown[]; dailyTime?: string; difficulty: string }): string {
  return [`${plan.days.length} days`, plan.dailyTime, `${plan.difficulty} level`].filter(Boolean).join('. ') + '.';
}
