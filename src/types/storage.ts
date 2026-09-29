import type { BookId, Location } from './bible';

export type Theme = 'light' | 'dark' | 'contrast';
export type ReadingWidth = 'narrow' | 'medium' | 'wide';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'red';
export type ChapterStatus = 'unread' | 'in-progress' | 'completed';

export interface Preferences {
  theme: Theme;
  /** Reader font size in pixels. */
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
  /** Day number to the time it was marked complete. Independent from every other plan. */
  completedDays: Record<string, number>;
}

export interface ChapterProgress {
  status: Exclude<ChapterStatus, 'unread'>;
  updatedAt: number;
}

/**
 * Everything the app saves. Stored under the key "bibleApp.v1".
 * Chapter progress is keyed without a translation ("JHN.3") because reading John 3
 * counts as reading it whichever translation you used.
 * Highlights and notes are keyed with one ("kjv:JHN.3.16") because they belong to specific wording.
 */
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
