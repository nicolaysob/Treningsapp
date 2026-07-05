export const APP_TIMEZONE = "Europe/Oslo";

/** YYYY-MM-DD in Norwegian local time (Oslo). */
export function osloDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dayNumberFromKey(key: string): number {
  return parseInt(key.slice(8, 10), 10);
}

export function formatKeyNb(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export function formatKeyNbWeekday(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
}

export function formatKeyNbShort(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return date.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" });
}

export function addDaysToKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
