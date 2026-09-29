import type { ChapterRef } from '../types/bible';
import type { PlanDay, ReadingPlan } from '../types/plans';
import { getCanonBook } from './canon';

const modules = import.meta.glob<{ default: unknown }>('./readingPlans/*.json', { eager: true });

function isChapterRef(value: unknown): value is ChapterRef {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const book = typeof v.book === 'string' ? getCanonBook(v.book) : undefined;
  return !!book && typeof v.chapter === 'number' && v.chapter >= 1 && v.chapter <= book.chapters;
}

function validatePlan(raw: unknown, file: string): ReadingPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.days)) {
    console.warn(`Reading plan ${file} is missing id, name or days and was skipped.`);
    return null;
  }
  const days: PlanDay[] = [];
  for (const d of p.days as unknown[]) {
    if (!d || typeof d !== 'object') continue;
    const day = d as Record<string, unknown>;
    const readings = Array.isArray(day.readings) ? day.readings.filter(isChapterRef) : [];
    if (typeof day.day !== 'number' || readings.length === 0) {
      console.warn(`Reading plan ${p.id}: skipped an invalid day entry.`);
      continue;
    }
    days.push({
      day: day.day,
      readings,
      title: typeof day.title === 'string' ? day.title : undefined,
      explanation: typeof day.explanation === 'string' ? day.explanation : undefined,
    });
  }
  if (days.length === 0) return null;
  days.sort((a, b) => a.day - b.day);
  const difficulty = p.difficulty === 'Intermediate' || p.difficulty === 'Committed' ? p.difficulty : 'Beginner';
  return {
    id: p.id,
    name: p.name,
    description: typeof p.description === 'string' ? p.description : '',
    durationDays: days.length,
    difficulty,
    dailyTime: typeof p.dailyTime === 'string' ? p.dailyTime : undefined,
    order: typeof p.order === 'number' ? p.order : 99,
    days,
  };
}

export const PLANS: ReadingPlan[] = Object.entries(modules)
  .map(([file, mod]) => validatePlan(mod.default, file))
  .filter((p): p is ReadingPlan => p !== null)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export function getPlan(id: string): ReadingPlan | undefined {
  return PLANS.find((p) => p.id === id);
}
