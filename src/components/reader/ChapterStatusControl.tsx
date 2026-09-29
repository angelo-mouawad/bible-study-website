import { Icon, type IconName } from '../ui/Icon';
import type { ChapterStatus } from '../../types/storage';

const OPTIONS: { id: ChapterStatus; label: string; icon: IconName }[] = [
  { id: 'unread', label: 'Unread', icon: 'circle' },
  { id: 'in-progress', label: 'In progress', icon: 'half' },
  { id: 'completed', label: 'Completed', icon: 'check' },
];

export function ChapterStatusControl({ value, onChange }: { value: ChapterStatus; onChange: (s: ChapterStatus) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Chapter status</legend>
      <div className="inline-flex rounded-full bg-accent-soft/80 p-1">
        {OPTIONS.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.id)}
              className={`flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[0.9375rem] font-bold transition-colors ${
                active ? 'bg-cocoa text-paper shadow-[0_4px_12px_-4px_rgb(61_42_28/0.5)]' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon name={o.icon} className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
