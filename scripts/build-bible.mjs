// Converts a source Bible JSON into the per-book format the app loads.
//
// Usage:
//   node scripts/build-bible.mjs [source.json] [translationId] [name] [abbreviation] [language]
//
// Defaults build the public-domain King James Version from scripts/source-kjv.json.
// The source must be an array of 66 books in Protestant canonical order, each with
// { "chapters": [[ "verse 1", "verse 2", ... ], ...] } (the thiagobodruk/bible format).
// If your source uses a different shape, adapt readSource() below; the output stays the same.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [
  sourcePath = join(root, 'scripts/source-kjv.json'),
  id = 'kjv',
  name = 'King James Version',
  abbreviation = 'KJV',
  language = 'en',
] = process.argv.slice(2);

const canon = JSON.parse(readFileSync(join(root, 'src/data/bible/canon.json'), 'utf8'));

function readSource(path) {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw).map((book) => book.chapters);
}

function clean(text) {
  // Remove editorial markers some datasets use for italic words, and tidy spacing.
  return text
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:?!])/g, '$1')
    .trim();
}

const books = readSource(sourcePath);
if (books.length !== canon.length) {
  throw new Error(`Expected ${canon.length} books, found ${books.length}. Check the source order.`);
}

const outDir = join(root, 'public/bible', id);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let totalVerses = 0;
const indexBooks = canon.map((meta, i) => {
  const chapters = books[i].map((chapter) => chapter.map(clean));
  if (chapters.length !== meta.chapters) {
    console.warn(`Warning: ${meta.name} has ${chapters.length} chapters (expected ${meta.chapters}).`);
  }
  writeFileSync(join(outDir, `${meta.id}.json`), JSON.stringify({ id: meta.id, chapters }));
  const verseCounts = chapters.map((c) => c.length);
  totalVerses += verseCounts.reduce((a, b) => a + b, 0);
  return { id: meta.id, name: meta.name, testament: meta.testament, verseCounts };
});

const index = {
  id,
  name,
  abbreviation,
  language,
  license: 'Public domain',
  books: indexBooks,
};
writeFileSync(join(outDir, 'index.json'), JSON.stringify(index));
console.log(`Built ${name}: ${indexBooks.length} books, ${totalVerses} verses into public/bible/${id}/`);
