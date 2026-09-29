import { DEFAULT_TRANSLATION } from '../data/translations';
import type {
  AppData,
  Bookmark,
  ChapterProgress,
  Highlight,
  HighlightColor,
  Note,
  PlanProgress,
  Preferences,
} from '../types/storage';

export const STORAGE_KEY = 'bibleApp.v1';
const LEGACY_KEYS: string[] = [];

export const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'purple', 'red'];

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  fontSize: 20,
  width: 'medium',
  translation: DEFAULT_TRANSLATION,
  showVerseNumbers: true,
};

export function createEmptyData(): AppData {
  return {
    version: 1,
    preferences: { ...DEFAULT_PREFERENCES },
    lastLocation: null,
    chapters: {},
    highlights: {},
    notes: {},
    bookmarks: [],
    plans: {},
  };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const posInt = (v: unknown): v is number => isNum(v) && Number.isInteger(v) && v > 0;

function cleanRecord<T>(value: unknown, clean: (v: unknown) => T | null): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isObj(value)) return out;
  for (const [key, item] of Object.entries(value)) {
    const c = clean(item);
    if (c !== null) out[key] = c;
  }
  return out;
}

function cleanPreferences(v: unknown): Preferences {
  const p = isObj(v) ? v : {};
  return {
    theme: p.theme === 'dark' || p.theme === 'contrast' || p.theme === 'light' ? p.theme : DEFAULT_PREFERENCES.theme,
    fontSize: isNum(p.fontSize) ? Math.min(34, Math.max(14, Math.round(p.fontSize))) : DEFAULT_PREFERENCES.fontSize,
    width: p.width === 'narrow' || p.width === 'wide' || p.width === 'medium' ? p.width : DEFAULT_PREFERENCES.width,
    translation: isStr(p.translation) ? p.translation : DEFAULT_PREFERENCES.translation,
    showVerseNumbers: typeof p.showVerseNumbers === 'boolean' ? p.showVerseNumbers : true,
  };
}

function cleanHighlight(v: unknown): Highlight | null {
  if (!isObj(v) || !isStr(v.translation) || !isStr(v.book) || !posInt(v.chapter) || !posInt(v.verse)) return null;
  if (!HIGHLIGHT_COLORS.includes(v.color as HighlightColor)) return null;
  const createdAt = isNum(v.createdAt) ? v.createdAt : Date.now();
  return {
    translation: v.translation,
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    color: v.color as HighlightColor,
    createdAt,
    updatedAt: isNum(v.updatedAt) ? v.updatedAt : createdAt,
  };
}

function cleanNote(v: unknown): Note | null {
  if (!isObj(v) || !isStr(v.translation) || !isStr(v.book) || !posInt(v.chapter) || !posInt(v.verse)) return null;
  if (!isStr(v.text) || !v.text.trim()) return null;
  const createdAt = isNum(v.createdAt) ? v.createdAt : Date.now();
  return {
    translation: v.translation,
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
    createdAt,
    updatedAt: isNum(v.updatedAt) ? v.updatedAt : createdAt,
  };
}

function cleanBookmark(v: unknown): Bookmark | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.translation) || !isStr(v.book) || !posInt(v.chapter)) return null;
  const kind = v.kind === 'verse' || v.kind === 'chapter' || v.kind === 'location' ? v.kind : 'chapter';
  return {
    id: v.id,
    kind,
    translation: v.translation,
    book: v.book,
    chapter: v.chapter,
    verse: posInt(v.verse) ? v.verse : undefined,
    label: isStr(v.label) ? v.label : undefined,
    createdAt: isNum(v.createdAt) ? v.createdAt : Date.now(),
  };
}

function cleanChapter(v: unknown): ChapterProgress | null {
  if (!isObj(v) || (v.status !== 'completed' && v.status !== 'in-progress')) return null;
  return { status: v.status, updatedAt: isNum(v.updatedAt) ? v.updatedAt : Date.now() };
}

function cleanPlan(v: unknown): PlanProgress | null {
  if (!isObj(v) || !isStr(v.planId)) return null;
  const completedDays: Record<string, number> = {};
  if (isObj(v.completedDays)) {
    for (const [day, at] of Object.entries(v.completedDays)) {
      if (posInt(Number(day)) && isNum(at)) completedDays[day] = at;
    }
  }
  return { planId: v.planId, startedAt: isNum(v.startedAt) ? v.startedAt : Date.now(), completedDays };
}

function cleanLocation(v: unknown): AppData['lastLocation'] {
  if (!isObj(v) || !isStr(v.book) || !posInt(v.chapter)) return null;
  return {
    book: v.book,
    chapter: v.chapter,
    verse: posInt(v.verse) ? v.verse : undefined,
    translation: isStr(v.translation) ? v.translation : DEFAULT_TRANSLATION,
    at: isNum(v.at) ? v.at : Date.now(),
  };
}

export function sanitize(raw: unknown): AppData {
  const base = createEmptyData();
  if (!isObj(raw)) return base;
  return {
    version: 1,
    preferences: cleanPreferences(raw.preferences),
    lastLocation: cleanLocation(raw.lastLocation),
    chapters: cleanRecord(raw.chapters, cleanChapter),
    highlights: cleanRecord(raw.highlights, cleanHighlight),
    notes: cleanRecord(raw.notes, cleanNote),
    bookmarks: Array.isArray(raw.bookmarks)
      ? raw.bookmarks.map(cleanBookmark).filter((b): b is Bookmark => b !== null)
      : [],
    plans: cleanRecord(raw.plans, cleanPlan),
  };
}

function migrate(raw: unknown): unknown {
  return raw;
}

export interface LoadResult {
  data: AppData;
  recovered: boolean;
}

export function loadData(): LoadResult {
  let text: string | null = null;
  try {
    text = localStorage.getItem(STORAGE_KEY);
    if (text === null) {
      for (const key of LEGACY_KEYS) {
        text = localStorage.getItem(key);
        if (text !== null) break;
      }
    }
  } catch {
    return { data: createEmptyData(), recovered: false };
  }
  if (text === null) return { data: createEmptyData(), recovered: false };
  try {
    return { data: sanitize(migrate(JSON.parse(text))), recovered: false };
  } catch {
    try {
      localStorage.setItem(`${STORAGE_KEY}.corrupt.${Date.now()}`, text);
    } catch {
    }
    return { data: createEmptyData(), recovered: true };
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function parseBackup(text: string): AppData {
  const raw: unknown = JSON.parse(text);
  if (!isObj(raw) || raw.version !== 1) throw new Error('This file is not a Bible Companion backup.');
  return sanitize(raw);
}
