// Shared date & time helpers used across screens.

/** Local YYYY-MM-DD key for a Date. */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

/** Local YYYY-MM-DD key from an ISO string. */
export function dayKeyOf(iso: string) {
  return dayKey(new Date(iso));
}

/** Today's local YYYY-MM-DD key. */
export function todayStr() {
  return dayKey(new Date());
}

/**
 * Absolute instants bounding a local calendar day, as a half-open range
 * [dayStartIso(key), dayEndIso(key)).
 *
 * `timestamptz` columns must be compared against real instants. Passing a naive
 * "YYYY-MM-DDT00:00:00" string makes Postgres read it in the server's timezone
 * (UTC), so a user at UTC+5 gets a "day" that actually runs 05:00–05:00 local.
 */
export function dayStartIso(key: string) {
  return new Date(key + 'T00:00:00').toISOString();
}

export function dayEndIso(key: string) {
  const d = new Date(key + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

/** Whole calendar days from `from` to `target`, both snapped to local midnight. */
export function calendarDaysUntil(target: Date, from: Date = new Date()) {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(target);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Human label for a YYYY-MM-DD key, e.g. "Tue, Jun 16, 2026". */
export function labelOf(key: string) {
  return new Date(key + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Format an "HH:mm" string as a localized time, e.g. "08:00" -> "8:00 AM". */
export function displayTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format a number of seconds as "m:ss". */
export function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Format a number of milliseconds as "m:ss" (clamped at 0). */
export function formatMs(ms: number) {
  return formatSeconds(Math.max(0, Math.floor(ms / 1000)));
}
