import type { ChapterRef } from './bible';

export type PlanDifficulty = 'Beginner' | 'Intermediate' | 'Committed';

export interface PlanDay {
  day: number;
  title?: string;
  readings: ChapterRef[];
  explanation?: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  difficulty: PlanDifficulty;
  dailyTime?: string;
  order?: number;
  days: PlanDay[];
}
