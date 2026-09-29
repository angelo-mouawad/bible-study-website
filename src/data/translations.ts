import type { TranslationInfo } from '../types/bible';

/**
 * Every translation the app can load. To add one, run scripts/build-bible.mjs for it
 * (which writes public/bible/<id>/) and add an entry here. Nothing else needs to change.
 */
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
