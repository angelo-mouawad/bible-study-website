import type { BookData, BookId } from '../types/bible';
import { bookName } from './references';

export function verseList(verses: number[]): string {
  const sorted = [...verses].sort((a, b) => a - b);
  const contiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
  if (sorted.length > 1 && contiguous) return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  return sorted.join(', ');
}

export function passageText(book: BookData, bookId: BookId, chapter: number, verses: number[], abbreviation: string): {
  reference: string;
  text: string;
} {
  const sorted = [...verses].sort((a, b) => a - b);
  const reference = `${bookName(bookId)} ${chapter}:${verseList(sorted)}`;
  const lines = sorted.map((v) => {
    const t = book.chapters[chapter - 1]?.[v - 1] ?? '';
    return sorted.length > 1 ? `${v} ${t}` : t;
  });
  return { reference, text: `${lines.join(' ')}\n${reference} (${abbreviation})` };
}
