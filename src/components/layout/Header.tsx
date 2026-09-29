import { Icon } from '../ui/Icon';
import { btn } from '../ui/styles';
import { NAV_ITEMS } from './navItems';
import type { View } from '../../hooks/useRoute';

interface Props {
  current: View;
  onNavigate: (view: View) => void;
  onSearch: () => void;
  onSettings: () => void;
  notice?: string;
}

export function Header({ current, onNavigate, onSearch, onSettings, notice }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-5">
        <a href="#/" className="mr-2 flex items-center gap-2 rounded-lg px-2 py-1" aria-label="Lamp, go to home">
          <LampMark />
          <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Lamp</span>
        </a>

        <nav aria-label="Main" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.view === current;
              return (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    aria-current={active ? 'page' : undefined}
                    className={`min-h-12 rounded-full px-4 font-bold transition-colors ${
                      active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-accent-soft hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={onSearch} className={`${btn.ghost} px-3 sm:px-4`} aria-label="Search the Bible">
            <Icon name="search" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button type="button" onClick={onSettings} className={btn.icon} aria-label="Reading settings">
            <Icon name="settings" />
          </button>
        </div>
      </div>
      {notice && (
        <p role="alert" className="border-t border-line bg-accent-soft px-4 py-3 text-center text-base text-ink">
          {notice}
        </p>
      )}
    </header>
  );
}

function LampMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path d="M16 5c3.2 3.6 4.8 6.3 4.8 8.8a4.8 4.8 0 0 1-9.6 0C11.2 11.3 12.8 8.6 16 5z" fill="var(--flame)" />
      <path d="M5 19h22c0 4.4-4.9 7.5-11 7.5S5 23.4 5 19z" fill="var(--accent)" />
    </svg>
  );
}
