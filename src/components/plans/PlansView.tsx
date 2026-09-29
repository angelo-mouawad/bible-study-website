import { btn, heading } from '../ui/styles';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusMessage } from '../ui/StatusMessage';
import { PlanDetail } from './PlanDetail';
import { PLANS, getPlan } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { planStatus } from '../../services/progress';
import { formatReadings, planMeta } from '../../utils/references';
import type { Nav } from '../../types/nav';

export function PlansView({ planId, day, nav }: { planId?: string; day?: number; nav: Nav }) {
  const { data, actions } = useStore();

  if (planId) {
    const plan = getPlan(planId);
    if (!plan) {
      return (
        <StatusMessage title="This reading plan could not be found" action={{ label: 'See all plans', onClick: () => nav.go({ view: 'plans' }) }}>
          It may have been renamed or removed.
        </StatusMessage>
      );
    }
    return <PlanDetail plan={plan} focusDay={day} nav={nav} />;
  }

  if (PLANS.length === 0) {
    return <StatusMessage title="No reading plans are available">Plan files are missing from this copy of the site.</StatusMessage>;
  }

  const active = PLANS.filter((p) => data.plans[p.id]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className={heading.page}>Reading plans</h1>
      <p className="mt-3 text-lg text-muted">
        A plan gives you a little to read each day. You can follow several at once. Each keeps its own place, and anything you
        have already read is recognised.
      </p>

      {active.length > 0 && (
        <section aria-labelledby="your-plans" className="mt-10">
          <h2 id="your-plans" className={heading.section}>
            Your plans
          </h2>
          <ul className="mt-4 space-y-4">
            {active.map((plan) => {
              const s = planStatus(plan, data.plans[plan.id]);
              return (
                <li key={plan.id} className="rounded-2xl border-2 border-accent-soft bg-surface p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
                    <span className="text-base text-muted">
                      {s.finished ? 'Finished' : `Day ${s.nextDay?.day} of ${s.total}`}
                    </span>
                  </div>
                  <ProgressBar className="mt-3" value={s.completedCount} max={s.total} label={`${plan.name} progress`} />
                  {s.nextDay && (
                    <p className="mt-3 text-lg">
                      Next: {s.nextDay.title ? `${s.nextDay.title}, ` : ''}
                      {formatReadings(s.nextDay.readings)}
                    </p>
                  )}
                  <button type="button" className={`${btn.primary} mt-4`} onClick={() => nav.go({ view: 'plans', planId: plan.id })}>
                    {s.finished ? 'Look back' : 'Continue'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="all-plans" className="mt-12">
        <h2 id="all-plans" className={heading.section}>
          {active.length ? 'More plans' : 'Choose a plan'}
        </h2>
        <ul className="mt-2 divide-y divide-line">
          {PLANS.filter((p) => !data.plans[p.id]).map((plan) => (
            <li key={plan.id} className="py-6">
              <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-base text-muted">
                {planMeta(plan)}
              </p>
              <p className="mt-2 text-lg leading-relaxed text-ink">{plan.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn.primary}
                  onClick={() => {
                    actions.startPlan(plan.id);
                    nav.go({ view: 'plans', planId: plan.id });
                  }}
                >
                  Start plan
                </button>
                <button type="button" className={btn.secondary} onClick={() => nav.go({ view: 'plans', planId: plan.id })}>
                  See the days
                </button>
              </div>
            </li>
          ))}
          {PLANS.every((p) => data.plans[p.id]) && <li className="py-6 text-lg text-muted">You have started every plan.</li>}
        </ul>
      </section>
    </div>
  );
}
