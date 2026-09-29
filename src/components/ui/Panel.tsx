import type { ReactNode } from 'react';

interface Props {
  title?: string;
  /** Small control shown opposite the title, such as "See all". */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
  id?: string;
}

/** Frosted tile used for every block of the dashboard and the other pages. */
export function Panel({ title, action, className = '', children, id }: Props) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section aria-labelledby={title ? headingId : undefined} className={`glass rounded-[28px] p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={headingId} className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
