import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { LoadingText, StatusMessage } from '../ui/StatusMessage';
import { useToast } from '../ui/Toast';
import { BookChapterPicker } from './BookChapterPicker';
import { ChapterStatusControl } from './ChapterStatusControl';
import { NoteEditor } from './NoteEditor';
import { PlanDayPanel } from './PlanDayPanel';
import { VerseActions } from './VerseActions';
import { VerseItem } from './VerseItem';
import { getCanonBook } from '../../data/canon';
import { getTranslationInfo } from '../../data/translations';
import { useAsync } from '../../hooks/useAsync';
import type { Route } from '../../hooks/useRoute';
import { loadBook } from '../../services/bibleService';
import { chapterStatus } from '../../services/progress';
import { useStore } from '../../store/AppStore';
import type { BookData, ChapterRef } from '../../types/bible';
import type { Nav } from '../../types/nav';
import type { ReadingWidth } from '../../types/storage';
import { copyText, shareText } from '../../utils/misc';
import { passageText } from '../../utils/passage';
import { formatRef, nextChapter, previousChapter, verseKey } from '../../utils/references';

const WIDTH_CLASS: Record<ReadingWidth, string> = {
  narrow: 'max-w-[38rem]',
  medium: 'max-w-[48rem]',
  wide: 'max-w-[62rem]',
};

interface Props {
  route: Extract<Route, { view: 'bible' }>;
  nav: Nav;
  onOpenSettings: () => void;
}

export function ReaderView({ route, nav, onOpenSettings }: Props) {
  const { data } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  // With no book in the address, reopen where the reader stopped last time.
  const fallback = data.lastLocation ?? { book: 'GEN', chapter: 1 };
  const bookId = route.book ?? fallback.book;
  const chapter = route.chapter ?? (route.book ? 1 : fallback.chapter);
  const canon = getCanonBook(bookId);
  const translationId = data.preferences.translation;

  const book = useAsync(canon ? `${translationId}:${bookId}` : null, () => loadBook(translationId, bookId));

  const goTo = (ref: ChapterRef) => {
    setPickerOpen(false);
    nav.go({ view: 'bible', book: ref.book, chapter: ref.chapter });
  };

  const picker = (
    <BookChapterPicker
      open={pickerOpen}
      current={{ book: bookId, chapter }}
      onClose={() => setPickerOpen(false)}
      onSelect={goTo}
    />
  );

  if (!canon) {
    return (
      <>
        <StatusMessage title={`There is no book called "${route.book}"`} action={{ label: 'Choose a book', onClick: () => setPickerOpen(true) }}>
          Check the spelling, or pick a book from the list.
        </StatusMessage>
        {picker}
      </>
    );
  }

  if (chapter > canon.chapters) {
    return (
      <StatusMessage
        title={`${canon.name} has ${canon.chapters} ${canon.chapters === 1 ? 'chapter' : 'chapters'}`}
        action={{ label: `Open ${canon.name} ${canon.chapters}`, onClick: () => goTo({ book: canon.id, chapter: canon.chapters }) }}
      >
        There is no chapter {chapter}.
      </StatusMessage>
    );
  }

  return (
    <div>
      <ReaderToolbar
        title={formatRef({ book: bookId, chapter })}
        current={{ book: bookId, chapter }}
        onPick={() => setPickerOpen(true)}
        onGo={goTo}
        onSettings={onOpenSettings}
      />
      {book.status === 'loading' && <LoadingText>Opening {canon.name}…</LoadingText>}
      {book.status === 'error' && (
        <StatusMessage tone="error" title={`${canon.name} could not be loaded`} action={{ label: 'Try again', onClick: book.retry }}>
          Check your internet connection. {book.error}
        </StatusMessage>
      )}
      {book.status === 'ready' && (
        <Chapter
          key={`${bookId}.${chapter}`}
          book={book.value}
          chapter={chapter}
          route={route}
          nav={nav}
          translationId={translationId}
        />
      )}
      {picker}
    </div>
  );
}

function ReaderToolbar({
  title,
  current,
  onPick,
  onGo,
  onSettings,
}: {
  title: string;
  current: ChapterRef;
  onPick: () => void;
  onGo: (ref: ChapterRef) => void;
  onSettings: () => void;
}) {
  const prev = previousChapter(current);
  const next = nextChapter(current);
  return (
    <div className="no-print glass glass-strong sticky top-[5.25rem] z-20 mx-auto mb-5 flex max-w-3xl items-center gap-1 rounded-full p-1.5">
      <button
        type="button"
        className={btn.icon}
        disabled={!prev}
        onClick={() => prev && onGo(prev)}
        aria-label={prev ? `Previous chapter, ${formatRef(prev)}` : 'No previous chapter'}
      >
        <Icon name="left" />
      </button>
      <button
        type="button"
        onClick={onPick}
        className="flex min-h-12 min-w-0 items-center gap-2 rounded-full bg-accent-soft/80 px-5 font-display text-lg font-semibold text-ink hover:bg-accent-soft"
        aria-label={`${title}. Choose book and chapter`}
      >
        <span className="truncate">{title}</span>
        <Icon name="down" className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn.icon}
        disabled={!next}
        onClick={() => next && onGo(next)}
        aria-label={next ? `Next chapter, ${formatRef(next)}` : 'No next chapter'}
      >
        <Icon name="right" />
      </button>
      <div className="ml-auto flex items-center">
        <button type="button" className={`${btn.ghost} px-3`} onClick={onSettings} aria-label="Text size and reading settings">
          <span aria-hidden="true" className="font-display text-lg">
            Aa
          </span>
        </button>
      </div>
    </div>
  );
}

interface ChapterProps {
  book: BookData;
  chapter: number;
  route: Extract<Route, { view: 'bible' }>;
  nav: Nav;
  translationId: string;
}

function Chapter({ book, chapter, route, nav, translationId }: ChapterProps) {
  const { data, actions } = useStore();
  const toast = useToast();
  const canon = getCanonBook(book.id)!;
  const verses = book.chapters[chapter - 1];
  const [selected, setSelected] = useState<number[]>([]);
  const [noteVerse, setNoteVerse] = useState<number | null>(null);
  const prefs = data.preferences;
  const abbreviation = getTranslationInfo(translationId).abbreviation;
  const targetVerse = route.verse && verses && route.verse <= verses.length ? route.verse : undefined;

  useEffect(() => {
    actions.setLastLocation({ book: book.id, chapter, verse: route.verse });
  }, [actions, book.id, chapter, route.verse]);

  useEffect(() => {
    if (targetVerse) {
      document.getElementById(`v${targetVerse}`)?.scrollIntoView({ block: 'center' });
    }
  }, [targetVerse]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected([]);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = useCallback(
    (v: number) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v].sort((a, b) => a - b))),
    [],
  );
  const editNote = useCallback((v: number) => setNoteVerse(v), []);

  const bookmarkedVerses = useMemo(() => {
    const set = new Set<number>();
    for (const b of data.bookmarks) if (b.book === book.id && b.chapter === chapter && b.verse) set.add(b.verse);
    return set;
  }, [data.bookmarks, book.id, chapter]);

  if (!verses) {
    return <StatusMessage title={`${canon.name} ${chapter} is missing from this translation`} />;
  }

  const key = (v: number) => verseKey(translationId, book.id, chapter, v);
  const status = chapterStatus(data, book.id, chapter);
  const next = nextChapter({ book: book.id, chapter });
  const chapterBookmark = data.bookmarks.find((b) => b.kind === 'chapter' && b.book === book.id && b.chapter === chapter);
  const first = selected[0];
  const selectionColors = new Set(selected.map((v) => data.highlights[key(v)]?.color));
  const sharedColor = selectionColors.size === 1 ? [...selectionColors][0] : undefined;
  const allBookmarked = selected.length > 0 && selected.every((v) => bookmarkedVerses.has(v));
  const passage = selected.length ? passageText(book, book.id, chapter, selected, abbreviation) : null;

  return (
    <article
      className={`glass mx-auto rounded-[32px] px-3 pb-8 pt-6 sm:px-10 sm:pt-10 ${WIDTH_CLASS[prefs.width]}`}
      style={{ fontSize: `${prefs.fontSize}px` }}
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line px-2 pb-6">
        <h1 className="font-display leading-none text-ink">
          <span className="block text-[0.8em] font-bold uppercase tracking-[0.14em] text-accent">{canon.name}</span>
          <span className="tabular block text-[3.4em] font-semibold tracking-[-0.04em]">{chapter}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 font-sans text-base">
          <ChapterStatusControl value={status} onChange={(s) => actions.setChapterStatus({ book: book.id, chapter }, s)} />
          <button
            type="button"
            aria-pressed={!!chapterBookmark}
            className={`${btn.quiet} ${chapterBookmark ? 'text-accent' : ''}`}
            onClick={() => {
              if (chapterBookmark) {
                actions.removeBookmark(chapterBookmark.id);
                toast('Chapter bookmark removed');
              } else {
                actions.addBookmark({ kind: 'chapter', book: book.id, chapter });
                toast(`${canon.name} ${chapter} bookmarked`);
              }
            }}
          >
            <Icon name="bookmark" /> {chapterBookmark ? 'Bookmarked' : 'Bookmark chapter'}
          </button>
        </div>
      </header>

      {route.verse && !targetVerse && (
        <p role="status" className="mb-4 rounded-xl bg-accent-soft px-4 py-3 font-sans text-base text-ink">
          {canon.name} {chapter} has {verses.length} verses, so verse {route.verse} does not exist. Showing the whole chapter.
        </p>
      )}

      <p className="sr-only">Select one or more verses to highlight, add a note, bookmark, copy or share them.</p>
      <ol className="scripture text-ink" aria-label={`${canon.name} chapter ${chapter}`}>
        {verses.map((text, i) => {
          const v = i + 1;
          return (
            <VerseItem
              key={v}
              verse={v}
              text={text}
              selected={selected.includes(v)}
              targeted={v === targetVerse}
              highlight={data.highlights[key(v)]}
              note={data.notes[key(v)]}
              bookmarked={bookmarkedVerses.has(v)}
              showNumber={prefs.showVerseNumbers}
              onToggle={toggle}
              onEditNote={editNote}
            />
          );
        })}
      </ol>

      {route.planId && route.planDay ? (
        <PlanDayPanel planId={route.planId} day={route.planDay} current={{ book: book.id, chapter }} nav={nav} />
      ) : (
        <footer className="no-print mt-10 flex flex-wrap items-center justify-center gap-3 rounded-[24px] bg-accent-soft/70 p-5 font-sans text-base">
          {status === 'completed' ? (
            <p className="flex min-h-12 items-center gap-2 font-bold text-accent">
              <Icon name="check" /> You have read this chapter
            </p>
          ) : (
            <button
              type="button"
              className={btn.primary}
              onClick={() => {
                actions.setChapterStatus({ book: book.id, chapter }, 'completed');
                toast(`${canon.name} ${chapter} marked as read`);
              }}
            >
              <Icon name="check" /> Mark chapter as read
            </button>
          )}
          {next && (
            <button type="button" className={btn.secondary} onClick={() => nav.go({ view: 'bible', ...next })}>
              Next: {formatRef(next)} <Icon name="right" />
            </button>
          )}
        </footer>
      )}

      {/* Leaves room so the action bar never covers the last verses. */}
      {selected.length > 0 && <div className="h-72" aria-hidden="true" />}

      {selected.length > 0 && passage && (
        <VerseActions
          label={passage.reference}
          count={selected.length}
          currentColor={sharedColor}
          hasNote={selected.length === 1 && !!data.notes[key(first)]}
          bookmarked={allBookmarked}
          onHighlight={(color) => {
            selected.forEach((v) => actions.setHighlight({ book: book.id, chapter, verse: v }, color));
            toast(color ? `Highlighted ${color}` : 'Highlight removed');
          }}
          onNote={() => setNoteVerse(first)}
          onBookmark={() => {
            if (allBookmarked) {
              data.bookmarks
                .filter((b) => b.kind === 'verse' && b.book === book.id && b.chapter === chapter && b.verse && selected.includes(b.verse))
                .forEach((b) => actions.removeBookmark(b.id));
              toast('Bookmark removed');
            } else {
              selected.forEach((v) => actions.addBookmark({ kind: 'verse', book: book.id, chapter, verse: v }));
              toast('Bookmarked');
            }
          }}
          onCopy={async () => {
            toast((await copyText(passage.text)) ? `Copied ${passage.reference}` : 'Copying is not allowed in this browser');
          }}
          onShare={async () => {
            const result = await shareText(passage.reference, passage.text);
            if (result === 'copied') toast(`Copied ${passage.reference}, ready to paste`);
            if (result === 'failed') toast('Sharing is not available in this browser');
          }}
          onClear={() => setSelected([])}
        />
      )}

      <NoteEditor
        open={noteVerse !== null}
        reference={noteVerse ? `${canon.name} ${chapter}:${noteVerse}` : ''}
        verseText={noteVerse ? verses[noteVerse - 1] ?? '' : ''}
        initialText={noteVerse ? data.notes[key(noteVerse)]?.text ?? '' : ''}
        onClose={() => setNoteVerse(null)}
        onSave={(text) => {
          if (noteVerse) actions.saveNote({ book: book.id, chapter, verse: noteVerse }, text);
          setNoteVerse(null);
          setSelected([]);
          toast('Note saved');
        }}
        onDelete={() => {
          if (noteVerse) actions.deleteNote({ book: book.id, chapter, verse: noteVerse });
          setNoteVerse(null);
          toast('Note deleted');
        }}
      />
    </article>
  );
}
