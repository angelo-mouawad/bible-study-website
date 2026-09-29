import { Icon } from '../ui/Icon';
import { btn, heading } from '../ui/styles';
import { ProgressBar } from '../ui/ProgressBar';
import { ContinueReading } from './ContinueReading';
import { RecentItems } from './RecentItems';
import { PLANS, getPlan } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { useTranslationOrNull } from '../../store/BibleProvider';
import { dayAlreadyRead, overallProgress, planStatus } from '../../services/progress';
import { percent } from '../../utils/misc';
import { formatReadings } from '../../utils/references';
import type { Nav } from '../../types/nav';

export function HomeView({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const isNew =
    !data.lastLocation &&
    Object.keys(data.plans).length === 0 &&
    Object.keys(data.chapters).length === 0 &&
    data.bookmarks.length === 0;

  return isNew ? <Welcome nav={nav} /> : <Dashboard nav={nav} />;
}

function Welcome({ nav }: { nav: Nav }) {
  const beginner = getPlan('beginner');
  return (
    <div className="mx-auto max-w-3xl">
      <section className="pb-10 pt-6 sm:pt-12">
        <p className="scripture text-[1.9rem] leading-snug text-ink sm:text-[2.6rem]">
          Thy word is a lamp unto my feet, and a light unto my path.
        </p>
        <p className="mt-3 text-lg text-muted">Psalm 119:105</p>
        <p className="mt-8 max-w-xl text-xl leading-relaxed text-ink">
          Lamp is a quiet place to read the Bible, follow a reading plan, and keep your own notes. It is free, and there is
          nothing to sign up for.
        </p>
      </section>

      <ul className="divide-y divide-line border-y border-line">
        <WelcomeChoice
          title="New to the Bible?"
          text={`Start with the Beginner Journey: ${beginner?.days.length ?? 30} short readings, beginning with the life of Jesus, each with a note on why it matters.`}
          action="Start the Beginner Journey"
          onClick={() => nav.go({ view: 'plans', planId: 'beginner' })}
          primary
        />
        <WelcomeChoice
          title="Already reading?"
          text="Open any book and chapter. Your place is remembered automatically."
          action="Open the Bible"
          onClick={() => nav.go({ view: 'bible', book: 'GEN', chapter: 1 })}
        />
        <WelcomeChoice
          title="Want a daily rhythm?"
          text={`Choose from ${PLANS.length} reading plans, from a few weeks to the whole Bible in a year. You can follow more than one.`}
          action="See reading plans"
          onClick={() => nav.go({ view: 'plans' })}
        />
      </ul>

      <p className="mt-8 text-base text-muted">
        Looking for a verse? <button type="button" className="font-bold text-accent underline underline-offset-4" onClick={() => nav.openSearch()}>Search the Bible</button>.
      </p>
    </div>
  );
}

function WelcomeChoice({
  title,
  text,
  action,
  onClick,
  primary,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <li className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-lg text-muted">{text}</p>
      </div>
      <button type="button" className={`${primary ? btn.primary : btn.secondary} shrink-0`} onClick={onClick}>
        {action} <Icon name="right" />
      </button>
    </li>
  );
}

function Dashboard({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const translation = useTranslationOrNull();
  const progress = overallProgress(data, translation);
  const plans = PLANS.filter((p) => data.plans[p.id]).map((plan) => ({ plan, status: planStatus(plan, data.plans[plan.id]) }));

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className={`${heading.page} mb-6`}>Welcome back</h1>

      <ContinueReading nav={nav} />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="todays-reading">
          <h2 id="todays-reading" className={heading.section}>
            Today's reading
          </h2>
          {plans.length === 0 ? (
            <div className="mt-3">
              <p className="text-lg text-muted">A plan gives you a short reading for each day.</p>
              <button type="button" className={`${btn.secondary} mt-4`} onClick={() => nav.go({ view: 'plans' })}>
                Choose a reading plan
              </button>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {plans.map(({ plan, status }) => (
                <li key={plan.id} className="py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <button
                      type="button"
                      className="text-left font-bold text-ink hover:text-accent"
                      onClick={() => nav.go({ view: 'plans', planId: plan.id })}
                    >
                      {plan.name}
                    </button>
                    <span className="text-base text-muted">
                      {status.finished ? 'Finished' : `Day ${status.nextDay?.day} of ${status.total}`}
                    </span>
                  </div>
                  <ProgressBar className="mt-2 h-1.5" value={status.completedCount} max={status.total} label={`${plan.name} progress`} />
                  {status.nextDay && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="font-serif text-xl text-ink">
                        {status.nextDay.title ?? formatReadings(status.nextDay.readings)}
                        {status.nextDay.title && (
                          <span className="block font-sans text-base text-muted">{formatReadings(status.nextDay.readings)}</span>
                        )}
                        {dayAlreadyRead(data, status.nextDay) && (
                          <span className="mt-1 flex items-center gap-1 font-sans text-base text-accent">
                            <Icon name="check" className="h-4 w-4" /> Already read
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        className={btn.secondary}
                        onClick={() => nav.go({ view: 'plans', planId: plan.id, day: status.nextDay?.day })}
                      >
                        Open day {status.nextDay.day}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="bible-progress">
          <h2 id="bible-progress" className={heading.section}>
            Bible progress
          </h2>
          <p className="mt-3 font-serif text-4xl font-semibold text-ink">
            {percent(progress.fraction, 1)}%<span className="ml-2 font-sans text-lg font-normal text-muted">completed</span>
          </p>
          <ProgressBar className="mt-3" value={Math.round(progress.fraction * 1000)} max={1000} label="Whole Bible progress" />
          <p className="mt-3 text-base text-muted">
            {progress.chaptersCompleted} of {progress.totalChapters} chapters, {progress.booksCompleted} books finished
          </p>
          <button type="button" className={`${btn.quiet} -ml-3 mt-2`} onClick={() => nav.go({ view: 'progress' })}>
            See progress by book <Icon name="right" />
          </button>
        </section>
      </div>

      <RecentItems nav={nav} />
    </div>
  );
}
