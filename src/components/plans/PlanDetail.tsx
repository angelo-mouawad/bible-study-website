import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { btn, chip } from '../ui/styles';
import { Ring } from '../ui/Ring';
import { PlanDayCard } from './PlanDayCard';
import { useStore } from '../../store/AppStore';
import { planStatus } from '../../services/progress';
import type { ReadingPlan } from '../../types/plans';
import type { Nav } from '../../types/nav';

const PAGE_SIZE = 30;

export function PlanDetail({ plan, focusDay, nav }: { plan: ReadingPlan; focusDay?: number; nav: Nav }) {
  const { data, actions } = useStore();
  const progress = data.plans[plan.id];
  const status = planStatus(plan, progress);
  const featured = plan.days.find((d) => d.day === focusDay) ?? status.nextDay ?? plan.days[plan.days.length - 1];
  const pages = Math.ceil(plan.days.length / PAGE_SIZE);
  const [page, setPage] = useState(() => Math.max(0, Math.floor(plan.days.indexOf(featured) / PAGE_SIZE)));

  useEffect(() => {
    setPage(Math.max(0, Math.floor(plan.days.indexOf(featured) / PAGE_SIZE)));
    // Only when switching plans or days from outside.
  }, [plan.id, focusDay]);

  const visible = useMemo(() => plan.days.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [plan.days, page]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button type="button" className={`${btn.quiet} -ml-3`} onClick={() => nav.go({ view: 'plans' })}>
        <Icon name="left" /> All plans
      </button>

      <header className="glass flex flex-col gap-6 rounded-[32px] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className={chip}>{plan.days.length} days</span>
            <span className={chip}>{plan.difficulty}</span>
            {plan.dailyTime && <span className={chip}>{plan.dailyTime}</span>}
          </div>
          <h1 className="mt-4 font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[2.4rem]">{plan.name}</h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">{plan.description}</p>
          {!progress && (
            <button type="button" className={`${btn.primary} mt-5`} onClick={() => actions.startPlan(plan.id)}>
              Start this plan
            </button>
          )}
        </div>
        {progress && (
          <div className="flex flex-col items-center gap-2 self-center">
            <Ring value={status.completedCount} max={status.total} size={140} label={`${plan.name} progress`} />
            <p className="tabular text-sm font-semibold text-muted">
              {status.completedCount} of {status.total} days
            </p>
          </div>
        )}
      </header>

      {status.finished && progress ? (
        <p className="glass rounded-[28px] p-6 text-lg text-ink">
          You finished {plan.name}. Well done. Look back over any day below, or choose another plan.
        </p>
      ) : (
        <section aria-label={focusDay ? `Day ${featured.day}` : 'Up next'}>
          <PlanDayCard plan={plan} day={featured} nav={nav} featured />
        </section>
      )}

      <section aria-labelledby="all-days" className="glass rounded-[28px] p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="all-days" className="font-display text-lg font-semibold">
            All days
          </h2>
          {pages > 1 && (
            <div className="flex items-center gap-1 rounded-full bg-accent-soft/70 p-1">
              <button type="button" className={btn.icon} disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Earlier days">
                <Icon name="left" />
              </button>
              <span className="tabular min-w-28 text-center text-sm font-bold text-muted">
                Days {page * PAGE_SIZE + 1}-{Math.min(plan.days.length, (page + 1) * PAGE_SIZE)}
              </span>
              <button type="button" className={btn.icon} disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Later days">
                <Icon name="right" />
              </button>
            </div>
          )}
        </div>
        <ol className="divide-y divide-line">
          {visible.map((d) => (
            <li key={d.day} className="py-4">
              <PlanDayCard plan={plan} day={d} nav={nav} />
            </li>
          ))}
        </ol>
      </section>

      {progress && (
        <div className="pt-2">
          <button
            type="button"
            className={btn.quiet}
            onClick={() => {
              if (
                window.confirm(
                  `Stop ${plan.name}? Your days in this plan will be cleared. Chapters you read still count toward your Bible progress.`,
                )
              ) {
                actions.stopPlan(plan.id);
              }
            }}
          >
            Stop this plan
          </button>
        </div>
      )}
    </div>
  );
}
