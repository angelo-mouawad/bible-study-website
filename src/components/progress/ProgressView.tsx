import { heading } from '../ui/styles';
import { ProgressBar } from '../ui/ProgressBar';
import { BookProgressRow } from './BookProgressRow';
import { BackupPanel } from './BackupPanel';
import { CANON } from '../../data/canon';
import { PLANS } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { useTranslationOrNull } from '../../store/BibleProvider';
import { overallProgress, planStatus } from '../../services/progress';
import { percent } from '../../utils/misc';
import type { Nav } from '../../types/nav';

export function ProgressView({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const translation = useTranslationOrNull();
  const p = overallProgress(data, translation);
  const activePlans = PLANS.filter((plan) => data.plans[plan.id]);

  const stats = [
    { value: `${p.booksCompleted}`, label: `of 66 books` },
    { value: p.chaptersCompleted.toLocaleString(), label: `of ${p.totalChapters.toLocaleString()} chapters` },
    ...(p.totalVerses ? [{ value: p.versesRead.toLocaleString(), label: `of ${p.totalVerses.toLocaleString()} verses` }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className={heading.page}>Progress</h1>
      <p className="mt-3 text-lg text-muted">
        Your journey through the whole Bible. Every chapter you mark as read counts here, whether you read it on your own or
        in a plan.
      </p>

      <section aria-label="Whole Bible" className="mt-8">
        <p className="font-serif text-[3.5rem] font-semibold leading-none text-ink">
          {percent(p.fraction, 1)}%
          <span className="ml-3 font-sans text-xl font-normal text-muted">of the Bible read</span>
        </p>
        <ProgressBar className="mt-4 h-3" value={Math.round(p.fraction * 1000)} max={1000} label="Whole Bible progress" />
        <dl className="mt-6 grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-serif text-2xl font-semibold text-ink">{s.value}</dd>
              <dd className="text-base text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {activePlans.length > 0 && (
        <section aria-labelledby="plan-progress" className="mt-12">
          <h2 id="plan-progress" className={heading.section}>
            Plans
          </h2>
          <ul className="mt-3 space-y-4">
            {activePlans.map((plan) => {
              const s = planStatus(plan, data.plans[plan.id]);
              return (
                <li key={plan.id}>
                  <button type="button" onClick={() => nav.go({ view: 'plans', planId: plan.id })} className="w-full rounded-xl p-2 text-left hover:bg-accent-soft">
                    <span className="mb-2 flex justify-between gap-2 text-lg">
                      <span className="font-bold">{plan.name}</span>
                      <span className="text-muted">
                        {s.completedCount} of {s.total} days
                      </span>
                    </span>
                    <ProgressBar value={s.completedCount} max={s.total} label={`${plan.name} progress`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {(['OT', 'NT'] as const).map((t) => (
        <section key={t} aria-labelledby={`books-${t}`} className="mt-12">
          <h2 id={`books-${t}`} className={heading.section}>
            {t === 'OT' ? 'Old Testament' : 'New Testament'}
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {CANON.filter((b) => b.testament === t).map((b) => (
              <BookProgressRow key={b.id} book={b} nav={nav} />
            ))}
          </ul>
        </section>
      ))}

      <BackupPanel />
    </div>
  );
}
