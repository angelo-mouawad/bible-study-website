import type { AppData } from '../types/storage';

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export interface Activity {
  streak: number;
  week: { label: string; count: number; isToday: boolean }[];
  todayCount: number;
}

export function readingActivity(data: AppData, now = Date.now()): Activity {
  const perDay = new Map<string, number>();
  const active = new Set<string>();
  for (const c of Object.values(data.chapters)) {
    if (c.status !== 'completed') continue;
    const k = dayKey(c.updatedAt);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
    active.add(k);
  }
  for (const plan of Object.values(data.plans)) {
    for (const t of Object.values(plan.completedDays)) active.add(dayKey(t));
  }

  const DAY = 86_400_000;
  const week = Array.from({ length: 7 }, (_, i) => {
    const t = now - (6 - i) * DAY;
    return {
      label: new Date(t).toLocaleDateString(undefined, { weekday: 'narrow' }),
      count: perDay.get(dayKey(t)) ?? 0,
      isToday: i === 6,
    };
  });

  let streak = 0;
  let t = active.has(dayKey(now)) ? now : now - DAY;
  while (active.has(dayKey(t))) {
    streak++;
    t -= DAY;
  }
  return { streak, week, todayCount: week[6].count };
}
