export type Testament = 'OT' | 'NT';

/** Book identifiers follow USFM codes (GEN, EXO, ... REV) so every translation shares them. */
export type BookId = string;

/** Language independent facts about a book, from src/data/bible/canon.json. */
export interface CanonBook {
  id: BookId;
  name: string;
  testament: Testament;
  chapters: number;
  aliases: string[];
}

/** A translation registered in src/data/translations.ts. */
export interface TranslationInfo {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  /** Folder under public/ that holds index.json and one JSON file per book. */
  path: string;
}

export interface TranslationBookIndex {
  id: BookId;
  /** Book name in the translation's language. */
  name: string;
  testament: Testament;
  /** verseCounts[chapter - 1] = number of verses in that chapter. */
  verseCounts: number[];
}

/** Loaded from public/bible/<id>/index.json. Small, so it is loaded once at startup. */
export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  license: string;
  books: TranslationBookIndex[];
}

/** Loaded on demand from public/bible/<id>/<BOOK>.json. chapters[c - 1][v - 1] is the verse text. */
export interface BookData {
  id: BookId;
  chapters: string[][];
}

export interface ChapterRef {
  book: BookId;
  chapter: number;
}

export interface VerseRef extends ChapterRef {
  verse: number;
}

/** A place in the Bible that may or may not point at a single verse. */
export interface Location extends ChapterRef {
  verse?: number;
}
