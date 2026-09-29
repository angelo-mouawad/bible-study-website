import type { ChapterRef } from './bible';

export type PlanDifficulty = 'Beginner' | 'Intermediate' | 'Committed';

export interface PlanDay {
  day: number;
  title?: string;
  readings: ChapterRef[];
  explanation?: string;
}

/** Shape of every file in src/data/readingPlans/. */
export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  difficulty: PlanDifficulty;
  dailyTime?: string;
  /** Sort position in the plan list. */
  order?: number;
  days: PlanDay[];
}
