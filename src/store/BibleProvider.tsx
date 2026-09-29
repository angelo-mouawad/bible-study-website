import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from './AppStore';
import { useAsync, type AsyncState } from '../hooks/useAsync';
import { loadTranslation } from '../services/bibleService';
import type { BibleTranslation } from '../types/bible';

const BibleContext = createContext<(AsyncState<BibleTranslation> & { retry: () => void }) | null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const translationId = useStore().data.preferences.translation;
  const state = useAsync(translationId, () => loadTranslation(translationId));
  return <BibleContext.Provider value={state}>{children}</BibleContext.Provider>;
}

export function useTranslationIndex() {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error('useTranslationIndex must be used inside BibleProvider');
  return ctx;
}

export function useTranslationOrNull(): BibleTranslation | null {
  const ctx = useTranslationIndex();
  return ctx.status === 'ready' ? ctx.value : null;
}
