# Lamp

A free Bible reading and study companion that runs entirely as a static site on GitHub Pages. No backend, no accounts, no database. Highlights, notes, bookmarks and progress are saved in the reader's own browser.

The Bible text is the King James Version, which is in the public domain.

## Features

- The full Bible, Genesis to Revelation, loaded one book at a time
- Tap verses to highlight them in five colours, add notes, bookmark, copy or share
- Search by word, phrase (in quotes), book, chapter or verse reference
- Six reading plans that run side by side, each with its own progress
- Overall Bible progress by book, chapter and verse
- Adjustable text size and reading width, light, dark and high contrast themes
- Backup and restore of all reading data
- Keyboard and screen reader friendly, with large tap targets

## Getting started

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install        # install dependencies
npm run dev        # run locally at http://localhost:5173
npm run build      # type-check and build into dist/
npm run preview    # serve the built site locally
```

## Deploying to GitHub Pages

1. Create a new repository on GitHub (public, or private on a plan that includes Pages).
2. Push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "First version of Lamp"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub, open **Settings > Pages** and set **Source** to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. You can follow it in the **Actions** tab.
5. The site appears at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

No path configuration is needed. `vite.config.ts` uses a relative base, and all navigation lives in the URL hash (`#/bible/JHN/3/16`), so refreshing any page or sharing a link works without server routes.

## Project structure

```
.github/workflows/deploy.yml   Build and publish to GitHub Pages
public/
  bible/kjv/                   One JSON file per book, plus index.json
  favicon.svg
scripts/
  build-bible.mjs              Converts a source Bible into the app's format
  generate-plans.mjs           Generates the two long reading plans
  source-kjv.json              Public domain KJV source data
src/
  components/
    home/                      Welcome screen and returning-reader dashboard
    reader/                    Chapter reader, verse actions, notes, book picker
    search/                    Search dialog
    plans/                     Plan list, plan detail, plan days
    study/                     Highlights, notes and bookmarks
    progress/                  Progress by book, backup and restore
    layout/                    Header, bottom navigation, settings
    ui/                        Icons, modal, toast, progress bar, error boundary
  data/
    bible/canon.json           The 66 books: ids, names, chapter counts, aliases
    readingPlans/*.json        One file per reading plan
    translations.ts            List of available translations
  hooks/                       Hash routing, async loading, verse lookup
  services/                    Bible loading, search, storage, progress logic
  store/                       App state (React context) and translation loader
  types/                       Shared TypeScript types
  utils/                       Reference parsing and formatting, clipboard
```

## How the Bible data works

Each translation has its own folder in `public/bible/`:

```
public/bible/kjv/index.json    { id, name, abbreviation, language, license, books: [{ id, name, testament, verseCounts }] }
public/bible/kjv/JHN.json      { id: "JHN", chapters: [["verse 1", "verse 2", ...], ...] }
```

`chapters[2][15]` is John 3:16. Books use standard USFM codes (GEN, EXO, ... REV), so every translation shares the same ids and highlights, plans and progress all line up.

The reader only downloads the book you open. Search downloads the whole Bible (about 4 MB) the first time you search for a word, then keeps it in memory.

### Updating the Bible data

The files in `public/bible/kjv/` are generated. To rebuild them:

```bash
npm run bible:build
```

The script expects a JSON array of 66 books in Protestant canonical order, each shaped like `{ "chapters": [["verse", ...], ...] }`. This is the format used by [thiagobodruk/bible](https://github.com/thiagobodruk/bible). If your source is shaped differently, change the `readSource()` function in `scripts/build-bible.mjs`; the output format stays the same.

## Adding another translation

Only use a translation you are allowed to redistribute: public domain, or with written permission. Modern translations such as the NIV, ESV and NLT are copyrighted and cannot be included.

1. Get the translation as JSON and convert it:
   ```bash
   node scripts/build-bible.mjs path/to/source.json web "World English Bible" WEB en
   ```
   This writes `public/bible/web/`.
2. Register it in `src/data/translations.ts`:
   ```ts
   { id: 'web', name: 'World English Bible', abbreviation: 'WEB', language: 'en', path: 'bible/web' },
   ```

The translation now appears in Reading settings. Nothing else needs to change. Highlights and notes are saved per translation, while chapter progress and plans are shared across all of them.

## Adding a reading plan

Add a JSON file to `src/data/readingPlans/`. It is picked up automatically on the next build.

```json
{
  "id": "sermon-on-the-mount",
  "name": "The Sermon on the Mount",
  "description": "Three days in Jesus' best known teaching.",
  "difficulty": "Beginner",
  "dailyTime": "About 5 minutes a day",
  "order": 7,
  "days": [
    {
      "day": 1,
      "title": "The Beatitudes",
      "readings": [{ "book": "MAT", "chapter": 5 }],
      "explanation": "Who is truly blessed in God's kingdom."
    },
    { "day": 2, "readings": [{ "book": "MAT", "chapter": 6 }] },
    { "day": 3, "readings": [{ "book": "MAT", "chapter": 7 }] }
  ]
}
```

- `id` must be unique and should never change once people have started the plan, because progress is saved under it.
- `difficulty` is `Beginner`, `Intermediate` or `Committed`.
- `title` and `explanation` are optional for each day.
- A day can list several readings.
- `order` controls where the plan appears in the list.

Invalid days or readings (an unknown book, a chapter that does not exist) are skipped with a warning in the browser console, so a typo never breaks the site.

To change the two generated plans (Bible in a Year, Read the Bible in Order), edit `scripts/generate-plans.mjs` and run `npm run plans:build`.

## How saved data works

Everything is stored in `localStorage` under the key `bibleApp.v1`:

| Field | Contents |
| --- | --- |
| `preferences` | Theme, text size, reading width, translation, verse numbers |
| `lastLocation` | Where the reader last stopped |
| `chapters` | Chapter status, keyed like `JHN.3` (shared across translations) |
| `highlights` | Keyed like `kjv:JHN.3.16`, with colour and timestamps |
| `notes` | Keyed like `kjv:JHN.3.16`, with text and timestamps |
| `bookmarks` | Verse and chapter bookmarks |
| `plans` | For each started plan, the completed days and when each was done |

Every record is checked when the page loads. Invalid entries are dropped one by one, so a single damaged record does not erase the rest. If the saved data cannot be read at all, the app starts fresh, keeps a copy of the old data under `bibleApp.v1.corrupt.<timestamp>`, and tells the reader.

If the format ever needs to change, add a conversion step to `migrate()` in `src/services/storage.ts` and move to a new key such as `bibleApp.v2`.

Because data lives in one browser, the Progress page offers **Save a backup** and **Restore a backup** so readers can move between devices.

## Credits

- Bible text: King James Version (public domain), from [thiagobodruk/bible](https://github.com/thiagobodruk/bible)
- Fonts: [Literata](https://fonts.google.com/specimen/Literata) for Scripture and [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible), designed for readers with low vision, for everything else
