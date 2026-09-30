import { Icon, type IconName } from '../ui/Icon';
import { btn } from '../ui/styles';
import { Gauge } from '../ui/Gauge';
import { Panel } from '../ui/Panel';
import { ContinueReading } from './ContinueReading';
import { ActivityPanel } from './ActivityPanel';
import { TodayPanel } from './TodayPanel';
import { TestamentsPanel } from './TestamentsPanel';
import { RecentItems } from './RecentItems';
import { PLANS } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { useTranslationOrNull } from '../../store/BibleProvider';
import { overallProgress } from '../../services/progress';
import { percent } from '../../utils/misc';
import type { Nav } from '../../types/nav';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Good evening';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const translation = useTranslationOrNull();
  const progress = overallProgress(data, translation);
  const isNew =
    !data.lastLocation &&
    Object.keys(data.plans).length === 0 &&
    Object.keys(data.chapters).length === 0 &&
    data.bookmarks.length === 0;
  const pct = percent(progress.fraction, 1);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold text-muted">{today}</p>
          <h1 className="mt-1 font-display text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[2.8rem]">
            {isNew ? 'Welcome to Lamp' : `${greeting()}.`}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => nav.openSearch()}
          className="glass flex min-h-14 w-full items-center gap-3 rounded-full px-5 text-left text-muted transition-colors hover:text-ink sm:w-80"
        >
          <Icon name="search" />
          <span className="text-[0.95rem] font-semibold">Find a verse, book or word</span>
        </button>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">{isNew ? <StartPanel nav={nav} /> : <ContinueReading nav={nav} />}</div>

        <Panel title="Bible progress" id="gauge" className="lg:col-span-5 lg:row-span-2">
          <Gauge
            value={progress.fraction}
            display={`${pct}%`}
            label="of the Bible read"
            description={`${pct} percent of the Bible read`}
          />
          <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Stat value={progress.booksCompleted} of={66} label="Books" />
            <Stat value={progress.chaptersCompleted} of={progress.totalChapters} label="Chapters" />
            <Stat value={progress.versesRead} of={progress.totalVerses || undefined} label="Verses" />
          </dl>
          <button type="button" className={`${btn.secondary} mt-5 w-full`} onClick={() => nav.go({ view: 'progress' })}>
            Progress by book <Icon name="right" />
          </button>
        </Panel>

        <ActivityPanel className="lg:col-span-7" />
        <TodayPanel nav={nav} className="lg:col-span-7" />
        <TestamentsPanel nav={nav} className="lg:col-span-5" />
        <RecentItems nav={nav} />
      </div>
    </div>
  );
}

function Stat({ value, of, label }: { value: number; of?: number; label: string }) {
  return (
    <div className="rounded-2xl bg-accent-soft/70 px-2 py-3">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-xl font-semibold text-ink">{value.toLocaleString()}</dd>
      {of !== undefined && <dd className="tabular text-xs text-muted">of {of.toLocaleString()}</dd>}
    </div>
  );
}

function StartPanel({ nav }: { nav: Nav }) {
  const choices: { icon: IconName; title: string; text: string; onClick: () => void; primary?: boolean }[] = [
    {
      icon: 'plan',
      title: 'New to the Bible?',
      text: 'Start the Beginner Journey: 30 short readings with a note on why each one matters.',
      onClick: () => nav.go({ view: 'plans', planId: 'beginner' }),
      primary: true,
    },
    {
      icon: 'book',
      title: 'Already reading?',
      text: 'Open any book and chapter. Your place is remembered.',
      onClick: () => nav.go({ view: 'bible', book: 'GEN', chapter: 1 }),
    },
    {
      icon: 'progress',
      title: 'Want a daily rhythm?',
      text: `Pick from ${PLANS.length} reading plans. You can follow more than one.`,
      onClick: () => nav.go({ view: 'plans' }),
    },
  ];
  return (
    <section aria-labelledby="start" className="relative h-full overflow-hidden rounded-[28px] bg-gradient-to-br from-cocoa via-[#5a3d27] to-accent p-6 text-[#fff9f1] shadow-[0_24px_50px_-24px_rgb(61_42_28/0.7)] sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(242_211_164/0.45),transparent_65%)]" />
      <p className="scripture relative max-w-md text-[1.35rem] leading-snug sm:text-[1.6rem]">
        Thy word is a lamp unto my feet, and a light unto my path.
      </p>
      <p className="relative mt-2 text-sm font-semibold opacity-75">Psalm 119:105</p>
      <h2 id="start" className="sr-only">
        Where to start
      </h2>
      <ul className="relative mt-6 space-y-2">
        {choices.map((c) => (
          <li key={c.title}>
            <button
              type="button"
              onClick={c.onClick}
              className={`flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors ${
                c.primary ? 'bg-[#fff9f1] text-[#2a1d13] hover:bg-white' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  c.primary ? 'bg-[#f2e7d7] text-[#6b4423]' : 'bg-white/15'
                }`}
              >
                <Icon name={c.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold">{c.title}</span>
                <span className={`block text-[0.95rem] ${c.primary ? 'text-[#76614d]' : 'opacity-80'}`}>{c.text}</span>
              </span>
              <Icon name="right" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
