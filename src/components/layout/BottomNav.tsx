import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './navItems';
import type { View } from '../../hooks/useRoute';

export function BottomNav({ current, onNavigate }: { current: View; onNavigate: (view: View) => void }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = item.view === current;
          return (
            <li key={item.view}>
              <button
                type="button"
                onClick={() => onNavigate(item.view)}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[0.8125rem] font-bold ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${active ? 'bg-accent-soft' : ''}`}>
                  <Icon name={item.icon} className="h-[22px] w-[22px]" />
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
