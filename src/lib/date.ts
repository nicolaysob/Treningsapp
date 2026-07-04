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
