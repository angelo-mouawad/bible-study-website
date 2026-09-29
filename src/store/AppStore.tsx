import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createEmptyData, loadData, saveData, STORAGE_KEY, sanitize } from '../services/storage';
import type { AppData, Bookmark, ChapterStatus, HighlightColor, Preferences } from '../types/storage';
import type { BookId, ChapterRef, Location, VerseRef } from '../types/bible';
import { chapterKey, verseKey } from '../utils/references';
import { createId } from '../utils/misc';
import { getCanonBook } from '../data/canon';

export interface AppActions {
  setPreferences: (patch: Partial<Preferences>) => void;
  setLastLocation: (loc: Location) => void;
  setChapterStatus: (ref: ChapterRef, status: ChapterStatus) => void;
  setBookStatus: (book: BookId, status: ChapterStatus) => void;
  setHighlight: (ref: VerseRef, color: HighlightColor | null) => void;
  saveNote: (ref: VerseRef, text: string) => void;
  deleteNote: (ref: VerseRef) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'translation'>) => void;
  removeBookmark: (id: string) => void;
  startPlan: (planId: string) => void;
  stopPlan: (planId: string) => void;
  setPlanDay: (planId: string, day: number, done: boolean, chapters: ChapterRef[]) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
}

interface StoreValue {
  data: AppData;
  actions: AppActions;
  recovered: boolean;
  canSave: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadData());
  const [data, setData] = useState<AppData>(initial.current.data);
  const [canSave, setCanSave] = useState(true);
  const skipNextSave = useRef(true);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setCanSave(saveData(data));
  }, [data]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        skipNextSave.current = true;
        setData(sanitize(JSON.parse(e.newValue)));
      } catch {
        skipNextSave.current = false;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const actions = useMemo<AppActions>(() => {
    const withChapter = (chapters: AppData['chapters'], ref: ChapterRef, status: ChapterStatus) => {
      const next = { ...chapters };
      const key = chapterKey(ref.book, ref.chapter);
      if (status === 'unread') delete next[key];
      else next[key] = { status, updatedAt: Date.now() };
      return next;
    };

    return {
      setPreferences: (patch) => update((d) => ({ ...d, preferences: { ...d.preferences, ...patch } })),

      setLastLocation: (loc) =>
        update((d) => {
          const prev = d.lastLocation;
          if (prev && prev.book === loc.book && prev.chapter === loc.chapter && prev.verse === loc.verse) return d;
          return { ...d, lastLocation: { ...loc, translation: d.preferences.translation, at: Date.now() } };
        }),

      setChapterStatus: (ref, status) => update((d) => ({ ...d, chapters: withChapter(d.chapters, ref, status) })),

      setBookStatus: (book, status) =>
        update((d) => {
          const count = getCanonBook(book)?.chapters ?? 0;
          let chapters = d.chapters;
          for (let c = 1; c <= count; c++) chapters = withChapter(chapters, { book, chapter: c }, status);
          return { ...d, chapters };
        }),

      setHighlight: (ref, color) =>
        update((d) => {
          const t = d.preferences.translation;
          const key = verseKey(t, ref.book, ref.chapter, ref.verse);
          const highlights = { ...d.highlights };
          if (!color) delete highlights[key];
          else {
            const now = Date.now();
            highlights[key] = { translation: t, ...ref, color, createdAt: highlights[key]?.createdAt ?? now, updatedAt: now };
          }
          return { ...d, highlights };
        }),

      saveNote: (ref, text) =>
        update((d) => {
          const t = d.preferences.translation;
          const key = verseKey(t, ref.book, ref.chapter, ref.verse);
          const notes = { ...d.notes };
          if (!text.trim()) delete notes[key];
          else {
            const now = Date.now();
            notes[key] = { translation: t, ...ref, text: text.trim(), createdAt: notes[key]?.createdAt ?? now, updatedAt: now };
          }
          return { ...d, notes };
        }),

      deleteNote: (ref) =>
        update((d) => {
          const notes = { ...d.notes };
          delete notes[verseKey(d.preferences.translation, ref.book, ref.chapter, ref.verse)];
          return { ...d, notes };
        }),

      addBookmark: (b) =>
        update((d) => {
          const exists = d.bookmarks.some(
            (x) => x.kind === b.kind && x.book === b.book && x.chapter === b.chapter && x.verse === b.verse,
          );
          if (exists) return d;
          const bookmark: Bookmark = { ...b, id: createId(), createdAt: Date.now(), translation: d.preferences.translation };
          return { ...d, bookmarks: [bookmark, ...d.bookmarks] };
        }),

      removeBookmark: (id) => update((d) => ({ ...d, bookmarks: d.bookmarks.filter((b) => b.id !== id) })),

      startPlan: (planId) =>
        update((d) =>
          d.plans[planId]
            ? d
            : { ...d, plans: { ...d.plans, [planId]: { planId, startedAt: Date.now(), completedDays: {} } } },
        ),

      stopPlan: (planId) =>
        update((d) => {
          const plans = { ...d.plans };
          delete plans[planId];
          return { ...d, plans };
        }),

      setPlanDay: (planId, day, done, chapters) =>
        update((d) => {
          const progress = d.plans[planId] ?? { planId, startedAt: Date.now(), completedDays: {} };
          const completedDays = { ...progress.completedDays };
          if (done) completedDays[day] = Date.now();
          else delete completedDays[day];
          let chapterMap = d.chapters;
          if (done) {
            for (const ref of chapters) {
              if (chapterMap[chapterKey(ref.book, ref.chapter)]?.status !== 'completed') {
                chapterMap = withChapter(chapterMap, ref, 'completed');
              }
            }
          }
          return { ...d, chapters: chapterMap, plans: { ...d.plans, [planId]: { ...progress, completedDays } } };
        }),

      replaceAll: (next) => update(() => next),
      resetAll: () => update((d) => ({ ...createEmptyData(), preferences: d.preferences })),
    };
  }, [update]);

  const value = useMemo(
    () => ({ data, actions, recovered: initial.current.recovered, canSave }),
    [data, actions, canSave],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
