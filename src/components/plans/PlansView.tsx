import { Icon } from '../ui/Icon';
import { btn, chip, heading } from '../ui/styles';
import { Ring } from '../ui/Ring';
import { StatusMessage } from '../ui/StatusMessage';
import { PlanDetail } from './PlanDetail';
import { PLANS, getPlan } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { planStatus } from '../../services/progress';
import { formatReadings } from '../../utils/references';
import type { ReadingPlan } from '../../types/plans';
import type { Nav } from '../../types/nav';

export function PlansView({ planId, day, nav }: { planId?: string; day?: number; nav: Nav }) {
  const { data } = useStore();

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
  const others = PLANS.filter((p) => !data.plans[p.id]);

  return (
    <div className="space-y-10">
      <header className="max-w-2xl pt-2">
        <h1 className={heading.page}>Reading plans</h1>
        <p className="mt-3 text-lg text-muted">
          A little to read each day. Follow several at once: each keeps its own place, and chapters you have already read are
          recognised everywhere.
        </p>
      </header>

      {active.length > 0 && (
        <section aria-labelledby="your-plans">
          <h2 id="your-plans" className={`${heading.section} mb-4`}>
            Your plans
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {active.map((plan) => {
              const s = planStatus(plan, data.plans[plan.id]);
              return (
                <li key={plan.id} className="glass flex flex-col rounded-[28px] p-5 sm:p-6">
                  <div className="flex items-center gap-5">
                    <Ring value={s.completedCount} max={s.total} size={96} label={`${plan.name} progress`} />
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">{plan.name}</h3>
                      <p className="tabular mt-1 text-sm font-semibold text-muted">
                        {s.finished ? 'Finished' : `Day ${s.nextDay?.day} of ${s.total}`} · {s.completedCount} done
                      </p>
                    </div>
                  </div>
                  {s.nextDay && (
                    <div className="mb-5 mt-5 rounded-2xl bg-accent-soft/70 p-4">
                      <p className="text-xs font-bold text-muted">Up next</p>
                      <p className="mt-0.5 font-display text-lg font-semibold text-ink">
                        {s.nextDay.title ?? formatReadings(s.nextDay.readings)}
                      </p>
                      {s.nextDay.title && <p className="text-sm text-muted">{formatReadings(s.nextDay.readings)}</p>}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`${btn.primary} mt-auto self-start`}
                    onClick={() => nav.go({ view: 'plans', planId: plan.id })}
                  >
                    {s.finished ? 'Look back' : 'Continue'} <Icon name="right" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="all-plans">
          <h2 id="all-plans" className={`${heading.section} mb-4`}>
            {active.length ? 'More plans' : 'Choose a plan'}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {others.map((plan) => (
              <PlanCard key={plan.id} plan={plan} nav={nav} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PlanCard({ plan, nav }: { plan: ReadingPlan; nav: Nav }) {
  const { actions } = useStore();
  const featured = plan.id === 'beginner';
  return (
    <li
      className={`flex flex-col rounded-[28px] p-5 sm:p-6 ${
        featured
          ? 'bg-gradient-to-br from-cocoa via-[#5a3d27] to-accent text-[#fff9f1] shadow-[0_24px_50px_-24px_rgb(61_42_28/0.7)]'
          : 'glass'
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <span className={featured ? 'rounded-full bg-white/15 px-3 py-1 text-sm font-semibold' : chip}>{plan.days.length} days</span>
        <span className={featured ? 'rounded-full bg-white/15 px-3 py-1 text-sm font-semibold' : chip}>{plan.difficulty}</span>
        {featured && <span className="rounded-full bg-[#f2d3a4] px-3 py-1 text-sm font-bold text-[#3d2a1c]">Best place to start</span>}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.01em]">{plan.name}</h3>
      {plan.dailyTime && <p className={`mt-1 text-sm font-semibold ${featured ? 'opacity-75' : 'text-muted'}`}>{plan.dailyTime}</p>}
      <p className={`mt-3 flex-1 text-base leading-relaxed ${featured ? 'opacity-90' : 'text-muted'}`}>{plan.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className={
            featured
              ? 'inline-flex min-h-12 items-center gap-2 rounded-full bg-[#fff9f1] px-5 font-bold text-[#2a1d13] hover:bg-white'
              : btn.primary
          }
          onClick={() => {
            actions.startPlan(plan.id);
            nav.go({ view: 'plans', planId: plan.id });
          }}
        >
          Start plan
        </button>
        <button
          type="button"
          className={
            featured
              ? 'inline-flex min-h-12 items-center rounded-full border border-white/30 px-5 font-bold hover:bg-white/10'
              : btn.secondary
          }
          onClick={() => nav.go({ view: 'plans', planId: plan.id })}
        >
          See the days
        </button>
      </div>
    </li>
  );
}
