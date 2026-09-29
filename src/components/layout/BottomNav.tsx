import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './navItems';
import type { View } from '../../hooks/useRoute';

export function BottomNav({ current, onNavigate }: { current: View; onNavigate: (view: View) => void }) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:hidden">
      <ul className="glass glass-strong mx-auto grid max-w-md grid-cols-5 rounded-[26px] p-1.5">
        {NAV_ITEMS.map((item) => {
          const active = item.view === current;
          return (
            <li key={item.view}>
              <button
                type="button"
                onClick={() => onNavigate(item.view)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-[20px] text-[0.75rem] font-bold transition-all ${
                  active ? 'bg-cocoa text-paper shadow-[0_8px_18px_-8px_rgb(61_42_28/0.7)]' : 'text-muted'
                }`}
              >
                <Icon name={item.icon} className="h-[21px] w-[21px]" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
