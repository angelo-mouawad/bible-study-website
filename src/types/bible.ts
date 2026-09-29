export type Testament = 'OT' | 'NT';

export type BookId = string;

export interface CanonBook {
  id: BookId;
  name: string;
  testament: Testament;
  chapters: number;
  aliases: string[];
}

export interface TranslationInfo {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  path: string;
}

export interface TranslationBookIndex {
  id: BookId;
  name: string;
  testament: Testament;
  verseCounts: number[];
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  license: string;
  books: TranslationBookIndex[];
}

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

export interface Location extends ChapterRef {
  verse?: number;
}
