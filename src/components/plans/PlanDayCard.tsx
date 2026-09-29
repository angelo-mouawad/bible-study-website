import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { useStore } from '../../store/AppStore';
import { dayAlreadyRead, isDayDone, isRead } from '../../services/progress';
import { formatReadings, formatRef } from '../../utils/references';
import type { PlanDay, ReadingPlan } from '../../types/plans';
import type { Nav } from '../../types/nav';

interface Props {
  plan: ReadingPlan;
  day: PlanDay;
  nav: Nav;
  /** The featured card shows everything; list rows are compact until opened. */
  featured?: boolean;
}

export function PlanDayCard({ plan, day, nav, featured = false }: Props) {
  const { data, actions } = useStore();
  const progress = data.plans[plan.id];
  const done = isDayDone(progress, day.day);
  const alreadyRead = !done && dayAlreadyRead(data, day);
  const firstUnread = day.readings.find((r) => !isRead(data, r)) ?? day.readings[0];

  const markDone = () => actions.setPlanDay(plan.id, day.day, true, day.readings);

  return (
    <div className={featured ? 'rounded-2xl border-2 border-accent-soft bg-surface p-5 sm:p-6' : 'py-1'}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold ${
            done ? 'bg-accent text-accent-ink' : 'border-2 border-line text-muted'
          }`}
        >
          {done ? <Icon name="check" className="h-5 w-5" /> : day.day}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base text-muted">
            Day {day.day}
            <span className="sr-only">{done ? ', completed' : ', not completed'}</span>
          </p>
          <h3 className={`font-serif font-semibold text-ink ${featured ? 'text-2xl' : 'text-xl'}`}>
            {day.title ?? formatReadings(day.readings)}
          </h3>
          {day.title && <p className="mt-0.5 text-lg text-ink">{formatReadings(day.readings)}</p>}
          {day.explanation && <p className="mt-2 text-lg leading-relaxed text-muted">{day.explanation}</p>}

          {featured && day.readings.length > 1 && (
            <ul className="mt-3 space-y-1">
              {day.readings.map((r) => {
                const read = isRead(data, r);
                return (
                  <li key={`${r.book}${r.chapter}`}>
                    <button
                      type="button"
                      className="flex min-h-11 items-center gap-2 rounded-lg px-1 text-lg text-ink hover:text-accent"
                      onClick={() => nav.go({ view: 'bible', ...r, planId: plan.id, planDay: day.day })}
                    >
                      <Icon name={read ? 'check' : 'circle'} className={`h-5 w-5 ${read ? 'text-accent' : 'text-muted'}`} />
                      {formatRef(r)}
                      <span className="sr-only">{read ? '(read)' : '(not read yet)'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {alreadyRead && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent-soft px-4 py-3 text-base text-ink">
              <Icon name="check" className="mt-0.5 h-5 w-5 text-accent" />
              You've already read {day.readings.length > 1 ? 'these chapters' : 'this chapter'}. You can mark the day complete
              without reading it again.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!done && (
              <button
                type="button"
                className={alreadyRead ? btn.secondary : btn.primary}
                onClick={() => nav.go({ view: 'bible', ...firstUnread, planId: plan.id, planDay: day.day })}
              >
                {alreadyRead ? 'Read again' : `Read ${formatRef(firstUnread)}`}
              </button>
            )}
            {done ? (
              <button type="button" className={btn.quiet} onClick={() => actions.setPlanDay(plan.id, day.day, false, day.readings)}>
                Mark as not done
              </button>
            ) : (
              <button type="button" className={alreadyRead ? btn.primary : btn.secondary} onClick={markDone}>
                <Icon name="check" /> Mark day complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
