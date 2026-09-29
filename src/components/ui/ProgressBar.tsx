interface Props {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className = '' }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={`h-2 w-full overflow-hidden rounded-full bg-line ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-sand via-flame to-accent-strong transition-[width] duration-700"
        style={{ width: `${pct > 0 ? Math.max(pct, 1.5) : 0}%` }}
      />
    </div>
  );
}
