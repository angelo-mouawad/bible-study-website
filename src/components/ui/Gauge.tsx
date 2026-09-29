import { useEffect, useId, useState } from 'react';

interface Props {
  /** 0 to 1 */
  value: number;
  /** Big text in the middle, for example "18%". */
  display: string;
  label: string;
  /** Text for screen readers, for example "18 percent of the Bible read". */
  description: string;
}

const CX = 160;
const CY = 160;
const R = 128;
const START = 150; // degrees, lower left
const SWEEP = 240; // through the top to the lower right

const polar = (angle: number, r: number) => {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

function arc(r: number, from: number, to: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

/** A speedometer style dial. The needle sweeps to its value once when it appears. */
export function Gauge({ value, display, label, description }: Props) {
  const id = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(1, value));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setShown(clamped), 60);
    return () => window.clearTimeout(t);
  }, [clamped]);

  // Keep a tiny sliver visible once anything is read, so progress never looks like zero.
  const visible = shown > 0 ? Math.max(shown, 0.012) : 0;
  const needle = START + SWEEP * visible;
  const ticks = Array.from({ length: 41 }, (_, i) => i);

  return (
    <figure className="mx-auto w-full max-w-[22rem]" role="img" aria-label={description}>
      <svg viewBox="0 0 320 262" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--sand)" />
            <stop offset="0.55" stopColor="var(--flame)" />
            <stop offset="1" stopColor="var(--accent-strong)" />
          </linearGradient>
          <filter id={`s${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* track */}
        <path d={arc(R, START, START + SWEEP)} fill="none" stroke="var(--line)" strokeWidth="16" strokeLinecap="round" />
        {/* soft glow under the value */}
        <path
          d={arc(R, START, START + SWEEP)}
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${visible} 1`}
          opacity="0.35"
          filter={`url(#s${id})`}
          className="transition-[stroke-dasharray] duration-[1400ms] ease-out"
        />
        <path
          d={arc(R, START, START + SWEEP)}
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${visible} 1`}
          className="transition-[stroke-dasharray] duration-[1400ms] ease-out"
        />

        {/* ticks */}
        {ticks.map((i) => {
          const major = i % 10 === 0;
          const angle = START + (SWEEP * i) / 40;
          const a = polar(angle, major ? 96 : 101);
          const b = polar(angle, 108);
          const passed = i / 40 <= visible;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={passed ? 'var(--accent)' : 'var(--sand)'}
              strokeWidth={major ? 2.4 : 1.2}
              strokeLinecap="round"
              opacity={major ? 1 : 0.7}
              className="transition-[stroke] duration-700"
            />
          );
        })}
        {[25, 50, 75].map((n) => {
          const p = polar(START + (SWEEP * n) / 100, 80);
          return (
            <text
              key={n}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted)"
              fontSize="11"
              fontFamily="var(--font-display)"
              fontWeight="600"
            >
              {n}
            </text>
          );
        })}

        {/* needle */}
        <g
          style={{ transform: `rotate(${needle}deg)`, transformOrigin: `${CX}px ${CY}px` }}
          className="transition-transform duration-[1400ms] ease-out"
        >
          <path d={`M ${CX - 10} ${CY - 3} L ${CX + 78} ${CY - 1} L ${CX + 84} ${CY} L ${CX + 78} ${CY + 1} L ${CX - 10} ${CY + 3} Z`} fill="var(--cocoa)" />
        </g>
        <circle cx={CX} cy={CY} r="13" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="5" fill="var(--accent)" />

        <text
          x={CX}
          y={CY + 68}
          textAnchor="middle"
          fill="var(--ink)"
          fontSize="40"
          fontWeight="600"
          fontFamily="var(--font-display)"
          letterSpacing="-1.2"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {display}
        </text>
        <text x={CX} y={CY + 90} textAnchor="middle" fill="var(--muted)" fontSize="13" fontWeight="600" fontFamily="var(--font-sans)">
          {label}
        </text>
      </svg>
    </figure>
  );
}
