interface Props {
  value: number;
  max: number;
  size?: number;
  label: string;
  children?: React.ReactNode;
}

export function Ring({ value, max, size = 64, label, children }: Props) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const stroke = size > 80 ? 9 : 6;
  const r = (size - stroke) / 2;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${pct} 1`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span
        aria-hidden="true"
        className="tabular absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-ink"
        style={size > 80 ? { fontSize: size / 4.5 } : undefined}
      >
        {children ?? `${Math.round(pct * 100)}%`}
      </span>
    </div>
  );
}
