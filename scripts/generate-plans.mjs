import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const canon = JSON.parse(readFileSync(join(root, 'src/data/bible/canon.json'), 'utf8'));
const outDir = join(root, 'src/data/readingPlans');

const chaptersOf = (books) =>
  books.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ book: b.id, chapter: i + 1 })));

function spread(chapters, days) {
  return Array.from({ length: days }, (_, d) => {
    const start = Math.floor((d * chapters.length) / days);
    const end = Math.floor(((d + 1) * chapters.length) / days);
    return chapters.slice(start, end);
  });
}

{
  const days = 365;
  const wisdom = new Set(['PSA', 'PRO']);
  const ot = spread(chaptersOf(canon.filter((b) => b.testament === 'OT' && !wisdom.has(b.id))), days);
  const nt = spread(chaptersOf(canon.filter((b) => b.testament === 'NT')), days);
  const ps = spread(chaptersOf(canon.filter((b) => wisdom.has(b.id))), days);
  const plan = {
    id: 'bible-in-a-year',
    name: 'Bible in a Year',
    description:
      'Read the whole Bible in 365 days. Each day mixes a passage from the Old Testament, the New Testament, and Psalms or Proverbs, so you never spend months in one section.',
    durationDays: days,
    difficulty: 'Committed',
    dailyTime: 'About 15 to 20 minutes a day',
    order: 5,
    days: Array.from({ length: days }, (_, d) => ({
      day: d + 1,
      readings: [...ot[d], ...nt[d], ...ps[d]],
    })),
  };
  writeFileSync(join(outDir, 'bible-in-a-year.json'), JSON.stringify(plan, null, 1) + '\n');
}

{
  const all = chaptersOf(canon);
  const perDay = 4;
  const days = Math.ceil(all.length / perDay);
  const plan = {
    id: 'bible-in-order',
    name: 'Read the Bible in Order',
    description:
      'Start at Genesis and finish at Revelation, four chapters a day. A good fit if you want to read every book in the order it appears.',
    durationDays: days,
    difficulty: 'Committed',
    dailyTime: 'About 15 minutes a day',
    order: 6,
    days: Array.from({ length: days }, (_, d) => ({
      day: d + 1,
      readings: all.slice(d * perDay, (d + 1) * perDay),
    })),
  };
  writeFileSync(join(outDir, 'bible-in-order.json'), JSON.stringify(plan, null, 1) + '\n');
}

console.log('Generated bible-in-a-year.json and bible-in-order.json');
