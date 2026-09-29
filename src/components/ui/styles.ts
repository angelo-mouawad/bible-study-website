// Shared class names so buttons look and behave the same everywhere.
// Every interactive control is at least 48px tall, which is comfortable for any finger.
const base =
  'inline-flex items-center justify-center gap-2 min-h-12 rounded-full px-5 font-sans text-[1.0625rem] font-bold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  primary: `${base} bg-accent text-accent-ink hover:bg-accent-strong`,
  secondary: `${base} border-2 border-line bg-surface text-ink hover:border-accent hover:text-accent`,
  ghost: `${base} text-ink hover:bg-accent-soft`,
  quiet: `${base} px-3 text-muted hover:bg-accent-soft hover:text-ink`,
  icon: 'inline-flex h-12 w-12 items-center justify-center rounded-full text-ink hover:bg-accent-soft transition-colors',
};

export const heading = {
  page: 'font-serif text-[2rem] leading-tight font-semibold text-ink sm:text-[2.5rem]',
  section: 'font-serif text-2xl font-semibold text-ink',
};
