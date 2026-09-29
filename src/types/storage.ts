import type { BookId, Location } from './bible';

export type Theme = 'light' | 'dark' | 'contrast';
export type ReadingWidth = 'narrow' | 'medium' | 'wide';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'red';
export type ChapterStatus = 'unread' | 'in-progress' | 'completed';

export interface Preferences {
  theme: Theme;
  fontSize: number;
  width: ReadingWidth;
  translation: string;
  showVerseNumbers: boolean;
}

export interface Highlight {
  translation: string;
  book: BookId;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  translation: string;
  book: BookId;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export type BookmarkKind = 'verse' | 'chapter' | 'location';

export interface Bookmark {
  id: string;
  kind: BookmarkKind;
  translation: string;
  book: BookId;
  chapter: number;
  verse?: number;
  label?: string;
  createdAt: number;
}

export interface PlanProgress {
  planId: string;
  startedAt: number;
  completedDays: Record<string, number>;
}

export interface ChapterProgress {
  status: Exclude<ChapterStatus, 'unread'>;
  updatedAt: number;
}

export interface AppData {
  version: 1;
  preferences: Preferences;
  lastLocation: (Location & { translation: string; at: number }) | null;
  chapters: Record<string, ChapterProgress>;
  highlights: Record<string, Highlight>;
  notes: Record<string, Note>;
  bookmarks: Bookmark[];
  plans: Record<string, PlanProgress>;
}
