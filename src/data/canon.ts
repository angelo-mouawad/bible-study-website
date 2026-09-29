import canonJson from './bible/canon.json';
import type { BookId, CanonBook } from '../types/bible';

export const CANON: CanonBook[] = canonJson as CanonBook[];

const byId = new Map(CANON.map((b) => [b.id, b]));

export function getCanonBook(id: BookId): CanonBook | undefined {
  return byId.get(id);
}

export function bookIndex(id: BookId): number {
  return CANON.findIndex((b) => b.id === id);
}

export const TOTAL_CHAPTERS = CANON.reduce((sum, b) => sum + b.chapters, 0);
