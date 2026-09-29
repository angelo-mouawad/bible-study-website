import { Panel } from '../ui/Panel';
import { useStore } from '../../store/AppStore';
import { readingActivity } from '../../services/activity';

export function ActivityPanel({ className = '' }: { className?: string }) {
  const { data } = useStore();
  const { streak, week, todayCount } = readingActivity(data);
  const max = Math.max(3, ...week.map((d) => d.count));

  return (
    <Panel title="This week" id="activity" className={className}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex gap-6 sm:flex-col sm:gap-4">
          <div>
            <p className="tabular font-display text-[2.6rem] font-semibold leading-none tracking-[-0.03em] text-ink">
              {streak}
              <span className="ml-1.5 text-base font-semibold tracking-normal text-muted">{streak === 1 ? 'day' : 'days'}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-muted">Reading streak</p>
          </div>
          <div>
            <p className="tabular font-display text-2xl font-semibold leading-none text-ink">{todayCount}</p>
            <p className="mt-1 text-sm font-semibold text-muted">Chapters today</p>
          </div>
        </div>
        <figure className="flex-1" aria-label={`Chapters read each day this week: ${week.map((d) => d.count).join(', ')}`}>
          <div className="flex h-32 items-end gap-2 sm:gap-3" aria-hidden="true">
            {week.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="tabular text-xs font-bold text-muted">{d.count || ''}</span>
                <div
                  className={`w-full rounded-xl transition-[height] duration-700 ${
                    d.count
                      ? 'bg-gradient-to-t from-accent-strong to-flame'
                      : 'bg-[repeating-linear-gradient(135deg,var(--line)_0_4px,transparent_4px_8px)]'
                  } ${d.isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''}`}
                  style={{ height: `${d.count ? Math.max(14, (d.count / max) * 100) : 10}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 sm:gap-3" aria-hidden="true">
            {week.map((d, i) => (
              <span key={i} className={`flex-1 text-center text-xs font-bold ${d.isToday ? 'text-accent' : 'text-muted'}`}>
                {d.label}
              </span>
            ))}
          </div>
        </figure>
      </div>
    </Panel>
  );
}
