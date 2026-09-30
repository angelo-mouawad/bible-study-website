import { Icon, type IconName } from '../ui/Icon';
import type { ChapterStatus } from '../../types/storage';

const OPTIONS: { id: ChapterStatus; label: string; icon: IconName }[] = [
  { id: 'unread', label: 'Unread', icon: 'circle' },
  { id: 'in-progress', label: 'In progress', icon: 'half' },
  { id: 'completed', label: 'Completed', icon: 'check' },
];

export function ChapterStatusControl({ value, onChange }: { value: ChapterStatus; onChange: (s: ChapterStatus) => void }) {
  return (
    <fieldset className="w-full min-w-0 sm:w-auto">
      <legend className="sr-only">Chapter status</legend>
      <div className="grid w-full grid-cols-3 rounded-full bg-accent-soft/80 p-1 sm:inline-flex sm:w-auto">
        {OPTIONS.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.id)}
              className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-1.5 text-[0.8125rem] font-bold transition-colors sm:min-h-10 sm:px-3 sm:text-[0.9375rem] ${
                active ? 'bg-cocoa text-paper shadow-[0_4px_12px_-4px_rgb(61_42_28/0.5)]' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon name={o.icon} className="hidden h-4 w-4 sm:block" />
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
