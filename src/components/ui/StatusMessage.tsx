import type { ReactNode } from 'react';
import { btn } from './styles';

interface Props {
  title: string;
  children?: ReactNode;
  action?: { label: string; onClick: () => void };
  tone?: 'info' | 'error';
}

/** Used for empty lists, loading problems and invalid references. Always offers a way forward. */
export function StatusMessage({ title, children, action, tone = 'info' }: Props) {
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className="mx-auto max-w-lg py-10 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {children && <div className="mt-2 text-lg text-muted">{children}</div>}
      {action && (
        <button type="button" className={`${btn.secondary} mt-5`} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function LoadingText({ children = 'Loading…' }: { children?: ReactNode }) {
  return (
    <p role="status" className="py-12 text-center text-lg text-muted">
      {children}
    </p>
  );
}
