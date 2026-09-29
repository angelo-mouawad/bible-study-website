import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { Panel } from '../ui/Panel';
import { Ring } from '../ui/Ring';
import { PLANS } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { dayAlreadyRead, planStatus } from '../../services/progress';
import { formatReadings } from '../../utils/references';
import type { Nav } from '../../types/nav';

export function TodayPanel({ nav, className = '' }: { nav: Nav; className?: string }) {
  const { data } = useStore();
  const plans = PLANS.filter((p) => data.plans[p.id]).map((plan) => ({ plan, status: planStatus(plan, data.plans[plan.id]) }));

  return (
    <Panel
      title="Today's reading"
      id="today"
      className={className}
      action={
        <button type="button" className="min-h-11 rounded-full px-3 text-sm font-bold text-accent hover:bg-accent-soft" onClick={() => nav.go({ view: 'plans' })}>
          {plans.length ? 'All plans' : 'Browse plans'}
        </button>
      }
    >
      {plans.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-sand p-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-base text-muted">A plan gives you one short reading a day and keeps track for you.</p>
          <button type="button" className={btn.primary} onClick={() => nav.go({ view: 'plans' })}>
            Choose a plan
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {plans.map(({ plan, status }) => (
            <li key={plan.id}>
              <button
                type="button"
                onClick={() => nav.go({ view: 'plans', planId: plan.id, day: status.nextDay?.day })}
                className="flex w-full items-center gap-4 rounded-2xl bg-surface/70 p-3 text-left ring-1 ring-line transition-all hover:-translate-y-px hover:ring-sand"
              >
                <Ring value={status.completedCount} max={status.total} size={56} label={`${plan.name} progress`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-muted">
                    {plan.name} · {status.finished ? 'Finished' : `Day ${status.nextDay?.day} of ${status.total}`}
                  </span>
                  {status.nextDay && (
                    <>
                      <span className="block truncate font-display text-lg font-semibold text-ink">
                        {status.nextDay.title ?? formatReadings(status.nextDay.readings)}
                      </span>
                      {status.nextDay.title && <span className="block text-sm text-muted">{formatReadings(status.nextDay.readings)}</span>}
                    </>
                  )}
                </span>
                {status.nextDay && dayAlreadyRead(data, status.nextDay) ? (
                  <span className="hidden items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent sm:flex">
                    <Icon name="check" className="h-3.5 w-3.5" /> Already read
                  </span>
                ) : (
                  <Icon name="right" className="h-5 w-5 text-muted" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
