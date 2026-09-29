import { CANON, TOTAL_CHAPTERS } from '../data/canon';
import type { BibleTranslation, BookId, ChapterRef } from '../types/bible';
import type { PlanDay, ReadingPlan } from '../types/plans';
import type { AppData, ChapterStatus, PlanProgress } from '../types/storage';
import { chapterKey } from '../utils/references';

export function chapterStatus(data: AppData, book: BookId, chapter: number): ChapterStatus {
  return data.chapters[chapterKey(book, chapter)]?.status ?? 'unread';
}

export const isRead = (data: AppData, ref: ChapterRef) => chapterStatus(data, ref.book, ref.chapter) === 'completed';

export interface BookProgress {
  completed: number;
  inProgress: number;
  total: number;
}

export function bookProgress(data: AppData, book: BookId, chapters: number): BookProgress {
  let completed = 0;
  let inProgress = 0;
  for (let c = 1; c <= chapters; c++) {
    const s = chapterStatus(data, book, c);
    if (s === 'completed') completed++;
    else if (s === 'in-progress') inProgress++;
  }
  return { completed, inProgress, total: chapters };
}

export interface OverallProgress {
  chaptersCompleted: number;
  totalChapters: number;
  booksCompleted: number;
  versesRead: number;
  totalVerses: number;
  /** Share of all verses read. Falls back to chapters when verse counts are not loaded yet. */
  fraction: number;
}

export function overallProgress(data: AppData, translation: BibleTranslation | null): OverallProgress {
  let chaptersCompleted = 0;
  let booksCompleted = 0;
  let versesRead = 0;
  let totalVerses = 0;
  for (const book of CANON) {
    const counts = translation?.books.find((b) => b.id === book.id)?.verseCounts;
    let done = 0;
    for (let c = 1; c <= book.chapters; c++) {
      const verses = counts?.[c - 1] ?? 0;
      totalVerses += verses;
      if (chapterStatus(data, book.id, c) === 'completed') {
        done++;
        versesRead += verses;
      }
    }
    chaptersCompleted += done;
    if (done === book.chapters) booksCompleted++;
  }
  const fraction = totalVerses > 0 ? versesRead / totalVerses : chaptersCompleted / TOTAL_CHAPTERS;
  return { chaptersCompleted, totalChapters: TOTAL_CHAPTERS, booksCompleted, versesRead, totalVerses, fraction };
}

/** The next chapter in canonical order that has not been completed, starting after `from`. */
export function nextUnreadChapter(data: AppData, from?: ChapterRef): ChapterRef | undefined {
  const all = CANON.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ book: b.id, chapter: i + 1 })));
  const start = from ? all.findIndex((r) => r.book === from.book && r.chapter === from.chapter) + 1 : 0;
  for (let i = 0; i < all.length; i++) {
    const ref = all[(start + i) % all.length];
    if (!isRead(data, ref)) return ref;
  }
  return undefined;
}

// ---------- reading plans ----------

export interface PlanStatus {
  completedCount: number;
  total: number;
  /** First day not yet completed, or undefined if the plan is finished. */
  nextDay?: PlanDay;
  finished: boolean;
}

export function planStatus(plan: ReadingPlan, progress: PlanProgress | undefined): PlanStatus {
  const done = progress?.completedDays ?? {};
  const completedCount = plan.days.filter((d) => done[d.day] !== undefined).length;
  const nextDay = plan.days.find((d) => done[d.day] === undefined);
  return { completedCount, total: plan.days.length, nextDay, finished: !nextDay };
}

export const isDayDone = (progress: PlanProgress | undefined, day: number) =>
  progress?.completedDays[day] !== undefined;

/** True when every chapter of a plan day was already marked read, in any way. */
export const dayAlreadyRead = (data: AppData, day: PlanDay) => day.readings.every((r) => isRead(data, r));
