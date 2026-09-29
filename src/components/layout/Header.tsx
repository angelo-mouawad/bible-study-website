import { Icon } from '../ui/Icon';
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
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5">
      <div className="glass glass-strong mx-auto flex h-16 max-w-6xl items-center gap-2 rounded-full pl-3 pr-2">
        <a href="#/" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3" aria-label="Lamp, go to home">
          <LampMark />
          <span className="font-display text-xl font-bold tracking-[-0.03em] text-ink">Lamp</span>
        </a>

        <nav aria-label="Main" className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1 rounded-full bg-accent-soft/70 p-1">
            {NAV_ITEMS.map((item) => {
              const active = item.view === current;
              return (
                <li key={item.view}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.view)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.95rem] font-bold transition-all ${
                      active
                        ? 'bg-cocoa text-paper shadow-[0_6px_16px_-6px_rgb(61_42_28/0.6)]'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <Icon name={item.icon} className="h-[18px] w-[18px]" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={onSearch}
            className="flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface/80 px-3 text-muted transition-colors hover:text-ink lg:min-w-52 lg:px-4"
            aria-label="Search the Bible"
          >
            <Icon name="search" />
            <span className="hidden text-[0.95rem] font-semibold lg:inline">Search</span>
            <kbd className="ml-auto hidden rounded-md border border-line px-1.5 text-xs font-bold lg:inline">/</kbd>
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink hover:bg-accent-soft"
            aria-label="Reading settings"
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
      {notice && (
        <p role="alert" className="glass mx-auto mt-2 max-w-6xl rounded-2xl px-4 py-3 text-center text-base text-ink">
          {notice}
        </p>
      )}
    </header>
  );
}

export function LampMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cocoa shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-[70%] w-[70%]">
        <path d="M16 4c3.4 3.8 5 6.6 5 9.2a5 5 0 0 1-10 0C11 10.6 12.6 7.8 16 4z" fill="#f2d3a4" />
        <path d="M5 19h22c0 4.4-4.9 7.5-11 7.5S5 23.4 5 19z" fill="#fff9f1" />
      </svg>
    </span>
  );
}
