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
