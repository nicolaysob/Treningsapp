export function startOfIsoWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const APP_TIMEZONE = "Europe/Oslo";

/** Calendar day key (YYYY-MM-DD) in the app's local timezone (Oslo). */
export function osloDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** UTC noon for a calendar key — safe for DB date comparisons. */
export function osloDayStart(date: Date = new Date()): Date {
  return parseCalendarDateKey(osloDateKey(date));
}

export function osloMonthStart(date: Date = new Date()): Date {
  const key = osloDateKey(date);
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Parse YYYY-MM-DD from calendar grid as UTC noon (avoids timezone day-shift). */
export function parseCalendarDateKey(key: string): Date {
  return new Date(`${key}T12:00:00.000Z`);
}

/** Safe for cached/JSON data where dates may arrive as strings. */
export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDateNb(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string {
  const date = toDate(value);
  try {
    return date.toLocaleDateString("nb-NO", options);
  } catch {
    return date.toLocaleDateString(undefined, options);
  }
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** Full calendar weeks (multiples of 7 days) covering the given month, padded with adjacent-month days. */
export function getMonthGridDays(monthStart: Date): Date[] {
  const gridStart = startOfIsoWeek(monthStart);

  const nextMonthStart = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );
  const lastDayOfMonth = new Date(nextMonthStart);
  lastDayOfMonth.setUTCDate(lastDayOfMonth.getUTCDate() - 1);

  const gridEnd = startOfIsoWeek(lastDayOfMonth);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 6);

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor.getTime() <= gridEnd.getTime()) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
