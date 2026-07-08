// Pregnancy due-date calculation helpers.
// Standard obstetric math: a full term is 280 days (40 weeks) from the
// first day of the last menstrual period (LMP).

export type DueMethod = 'due' | 'lmp' | 'conception' | 'term';

export const DUE_METHODS: { key: DueMethod; title: string; sub: string; icon: string }[] = [
  { key: 'due', title: 'I know my due date', sub: 'Enter it directly', icon: 'calendar-outline' },
  { key: 'lmp', title: 'First day of last period', sub: "We'll calculate your due date", icon: 'water-outline' },
  { key: 'conception', title: 'Conception date', sub: 'Enter the date of conception', icon: 'heart-outline' },
  { key: 'term', title: 'I know how far along I am', sub: 'Enter weeks and days', icon: 'time-outline' },
];

export const FULL_TERM_DAYS = 280; // 40 weeks from LMP
const CONCEPTION_TO_DUE_DAYS = 266; // 38 weeks from conception

/** Due date for the date-based methods (due / lmp / conception). */
export function dueDateFromDate(method: Exclude<DueMethod, 'term'>, date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (method === 'lmp') d.setDate(d.getDate() + FULL_TERM_DAYS);
  else if (method === 'conception') d.setDate(d.getDate() + CONCEPTION_TO_DUE_DAYS);
  return d;
}

/** Due date when the user knows how far along they currently are. */
export function dueDateFromTerm(weeks: number, days: number): Date {
  const daysAlong = weeks * 7 + days;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (FULL_TERM_DAYS - daysAlong));
  return d;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export type Progress = {
  /** Never negative — 0 once the due date passes. */
  daysToGo: number;
  /** Keeps counting past 280 when overdue, so week 41+ still shows. */
  daysAlong: number;
  week: number;
  day: number;
  trimester: 1 | 2 | 3;
};

/**
 * Pregnancy progress on a given day. Pregnancy is measured in whole days, so
 * BOTH ends are snapped to local midnight. Measuring from `Date.now()` instead
 * makes the result flip a day forward every afternoon (the partial day rounds
 * up), which previously left the Home ring and the tab headers disagreeing.
 * Rounding (not truncating) the day count absorbs the 23h/25h DST days.
 */
export function progressFor(dueDate: Date, on: Date = new Date()): Progress {
  const remaining = Math.round((startOfDay(dueDate).getTime() - startOfDay(on).getTime()) / 86_400_000);
  const daysAlong = FULL_TERM_DAYS - remaining;
  const week = Math.max(0, Math.floor(daysAlong / 7));
  const day = Math.max(0, ((daysAlong % 7) + 7) % 7);
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;
  return { daysToGo: Math.max(0, remaining), daysAlong, week, day, trimester };
}
