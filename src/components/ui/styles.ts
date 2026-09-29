const base =
  'inline-flex items-center justify-center gap-2 min-h-12 rounded-full px-5 font-sans text-[1rem] font-bold leading-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  primary: `${base} bg-gradient-to-b from-accent to-accent-strong text-accent-ink shadow-[0_8px_20px_-8px_rgb(107_68_35/0.6),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110 active:translate-y-px`,
  secondary: `${base} border border-line bg-surface text-ink shadow-[0_1px_2px_rgb(61_42_28/0.06)] hover:border-sand hover:bg-accent-soft`,
  ghost: `${base} text-ink hover:bg-accent-soft`,
  quiet: `${base} px-3 text-muted hover:bg-accent-soft hover:text-ink`,
  icon: 'inline-flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft disabled:opacity-40',
};

export const heading = {
  page: 'font-display text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em] text-ink sm:text-[2.6rem]',
  section: 'font-display text-xl font-semibold tracking-[-0.01em] text-ink',
};

export const chip =
  'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1 text-sm font-semibold text-muted';

export const panel = 'glass rounded-[28px]';
