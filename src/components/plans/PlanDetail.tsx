import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { btn, heading } from '../ui/styles';
import { ProgressBar } from '../ui/ProgressBar';
import { PlanDayCard } from './PlanDayCard';
import { useStore } from '../../store/AppStore';
import { planStatus } from '../../services/progress';
import type { ReadingPlan } from '../../types/plans';
import { planMeta } from '../../utils/references';
import type { Nav } from '../../types/nav';

const PAGE_SIZE = 30;

export function PlanDetail({ plan, focusDay, nav }: { plan: ReadingPlan; focusDay?: number; nav: Nav }) {
  const { data, actions } = useStore();
  const progress = data.plans[plan.id];
  const status = planStatus(plan, progress);
  const featured = plan.days.find((d) => d.day === focusDay) ?? status.nextDay ?? plan.days[plan.days.length - 1];
  const pages = Math.ceil(plan.days.length / PAGE_SIZE);
  const [page, setPage] = useState(() => Math.floor((plan.days.indexOf(featured) || 0) / PAGE_SIZE));

  useEffect(() => {
    setPage(Math.max(0, Math.floor(plan.days.indexOf(featured) / PAGE_SIZE)));
    // Only when switching plans or days from outside.
  }, [plan.id, focusDay]);

  const visible = useMemo(() => plan.days.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [plan.days, page]);

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" className={`${btn.quiet} -ml-3 mb-2`} onClick={() => nav.go({ view: 'plans' })}>
        <Icon name="left" /> All plans
      </button>
      <h1 className={heading.page}>{plan.name}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">{plan.description}</p>
      <p className="mt-2 text-base text-muted">
        {planMeta(plan)}
      </p>

      {progress ? (
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-base">
            <span className="font-bold">
              {status.finished ? 'Plan complete' : `Day ${status.nextDay?.day} of ${status.total}`}
            </span>
            <span className="text-muted">
              {status.completedCount} of {status.total} days done
            </span>
          </div>
          <ProgressBar value={status.completedCount} max={status.total} label={`${plan.name} progress`} />
        </div>
      ) : (
        <button type="button" className={`${btn.primary} mt-6`} onClick={() => actions.startPlan(plan.id)}>
          Start this plan
        </button>
      )}

      {status.finished && progress ? (
        <p className="mt-8 rounded-2xl bg-accent-soft p-5 text-lg text-ink">
          You finished {plan.name}. Well done. You can look back over any day below, or choose another plan.
        </p>
      ) : (
        <section aria-label="Current day" className="mt-8">
          <PlanDayCard plan={plan} day={featured} nav={nav} featured />
        </section>
      )}

      <section aria-labelledby="all-days" className="mt-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="all-days" className={heading.section}>
            All days
          </h2>
          {pages > 1 && (
            <div className="flex items-center gap-1">
              <button type="button" className={btn.icon} disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Earlier days">
                <Icon name="left" />
              </button>
              <span className="min-w-28 text-center text-base text-muted">
                Days {page * PAGE_SIZE + 1}-{Math.min(plan.days.length, (page + 1) * PAGE_SIZE)}
              </span>
              <button
                type="button"
                className={btn.icon}
                disabled={page >= pages - 1}
                onClick={() => setPage(page + 1)}
                aria-label="Later days"
              >
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
        <div className="mt-10 border-t border-line pt-6">
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
