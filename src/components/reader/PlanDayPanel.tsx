import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { getPlan } from '../../data/plans';
import { useStore } from '../../store/AppStore';
import { isDayDone, isRead } from '../../services/progress';
import { formatRef } from '../../utils/references';
import type { ChapterRef } from '../../types/bible';
import type { Nav } from '../../types/nav';

interface Props {
  planId: string;
  day: number;
  current: ChapterRef;
  nav: Nav;
}

/** Shown under a chapter opened from a plan: the rest of that day's reading and a way to finish the day. */
export function PlanDayPanel({ planId, day, current, nav }: Props) {
  const { data, actions } = useStore();
  const plan = getPlan(planId);
  const planDay = plan?.days.find((d) => d.day === day);
  if (!plan || !planDay) return null;

  const done = isDayDone(data.plans[planId], day);
  const index = planDay.readings.findIndex((r) => r.book === current.book && r.chapter === current.chapter);
  const nextReading = index >= 0 ? planDay.readings[index + 1] : undefined;

  return (
    <aside aria-label={`${plan.name}, day ${day}`} className="mt-10 rounded-2xl border-2 border-accent-soft bg-surface p-5">
      <p className="text-base font-bold text-accent">
        {plan.name}, day {day} of {plan.days.length}
      </p>
      <ul className="mt-3 space-y-1">
        {planDay.readings.map((r) => {
          const read = isRead(data, r);
          const here = r.book === current.book && r.chapter === current.chapter;
          return (
            <li key={`${r.book}${r.chapter}`} className="flex items-center gap-2 text-lg">
              <Icon name={read ? 'check' : 'circle'} className={`h-5 w-5 ${read ? 'text-accent' : 'text-muted'}`} />
              <span className={here ? 'font-bold' : ''}>{formatRef(r)}</span>
              <span className="sr-only">{read ? '(read)' : '(not read yet)'}</span>
              {here && <span className="text-base text-muted">(you are here)</span>}
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        {nextReading && (
          <button
            type="button"
            className={btn.primary}
            onClick={() => nav.go({ view: 'bible', ...nextReading, planId, planDay: day })}
          >
            Next: {formatRef(nextReading)} <Icon name="right" />
          </button>
        )}
        {done ? (
          <p className="flex min-h-12 items-center gap-2 font-bold text-accent">
            <Icon name="check" /> Day {day} complete
          </p>
        ) : (
          <button
            type="button"
            className={nextReading ? btn.secondary : btn.primary}
            onClick={() => actions.setPlanDay(planId, day, true, planDay.readings)}
          >
            <Icon name="check" /> Mark day {day} complete
          </button>
        )}
        <button type="button" className={btn.quiet} onClick={() => nav.go({ view: 'plans', planId, day })}>
          Back to plan
        </button>
      </div>
    </aside>
  );
}
