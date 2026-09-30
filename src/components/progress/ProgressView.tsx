import { Gauge } from '../ui/Gauge';
import { Panel } from '../ui/Panel';
import { Ring } from '../ui/Ring';
import { heading } from '../ui/styles';
import { BookTile } from './BookProgressRow';
import { BackupPanel } from './BackupPanel';
import { CANON } from '../../data/canon';
import { PLANS } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { useTranslationOrNull } from '../../store/BibleProvider';
import { readingActivity } from '../../services/activity';
import { overallProgress, planStatus } from '../../services/progress';
import { percent } from '../../utils/misc';
import type { Nav } from '../../types/nav';

export function ProgressView({ nav }: { nav: Nav }) {
  const { data } = useStore();
  const translation = useTranslationOrNull();
  const p = overallProgress(data, translation);
  const { streak } = readingActivity(data);
  const activePlans = PLANS.filter((plan) => data.plans[plan.id]);
  const pct = percent(p.fraction, 1);

  const stats = [
    { label: 'Books finished', value: p.booksCompleted, of: 66 },
    { label: 'Chapters read', value: p.chaptersCompleted, of: p.totalChapters },
    { label: 'Verses read', value: p.versesRead, of: p.totalVerses || undefined },
    { label: 'Reading streak', value: streak, unit: streak === 1 ? 'day' : 'days' },
  ];

  return (
    <div className="space-y-5">
      <header className="max-w-2xl pt-2">
        <h1 className={heading.page}>Progress</h1>
        <p className="mt-3 text-lg text-muted">
          Every chapter you mark as read counts here, whether you read it on your own or in a plan.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-5 lg:grid-cols-12">
        <Panel title="Whole Bible" id="whole" className="lg:col-span-5">
          <Gauge value={p.fraction} display={`${pct}%`} label="of the Bible read" description={`${pct} percent of the Bible read`} />
        </Panel>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-7">
          {stats.map((s) => (
            <div key={s.label} className="glass flex flex-col justify-between rounded-[28px] p-5 sm:p-6">
              <p className="text-sm font-bold text-muted">{s.label}</p>
              <p className="tabular mt-4 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                {s.value.toLocaleString()}
                {s.unit && <span className="ml-1.5 text-base font-semibold tracking-normal text-muted">{s.unit}</span>}
              </p>
              {s.of !== undefined && <p className="tabular mt-1 text-sm text-muted">of {s.of.toLocaleString()}</p>}
            </div>
          ))}
        </div>
      </div>

      {activePlans.length > 0 && (
        <Panel title="Plans" id="plan-progress">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activePlans.map((plan) => {
              const s = planStatus(plan, data.plans[plan.id]);
              return (
                <li key={plan.id}>
                  <button
                    type="button"
                    onClick={() => nav.go({ view: 'plans', planId: plan.id })}
                    className="flex w-full items-center gap-4 rounded-2xl bg-surface/70 p-3 text-left ring-1 ring-line hover:ring-sand"
                  >
                    <Ring value={s.completedCount} max={s.total} size={56} label={`${plan.name} progress`} />
                    <span>
                      <span className="block font-bold text-ink">{plan.name}</span>
                      <span className="tabular text-sm text-muted">
                        {s.completedCount} of {s.total} days
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {(['OT', 'NT'] as const).map((t) => (
        <Panel key={t} title={t === 'OT' ? 'Old Testament' : 'New Testament'} id={`books-${t}`}>
          <p className="-mt-2 mb-4 text-sm text-muted">Tap a book to see and change each chapter.</p>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {CANON.filter((b) => b.testament === t).map((b) => (
              <BookTile key={b.id} book={b} nav={nav} />
            ))}
          </ul>
        </Panel>
      ))}

      <BackupPanel />
    </div>
  );
}
