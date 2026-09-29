import type { TranslationInfo } from '../types/bible';

export const TRANSLATIONS: TranslationInfo[] = [
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'en',
    path: 'bible/kjv',
  },
];

export const DEFAULT_TRANSLATION = TRANSLATIONS[0].id;

export function getTranslationInfo(id: string): TranslationInfo {
  return TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS[0];
}
