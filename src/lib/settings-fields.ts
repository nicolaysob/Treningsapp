export function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value) return null;
  const parsed = parseInt(value.toString(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePaceToSeconds(value: FormDataEntryValue | string | null): number | null {
  if (!value) return null;
  const match = value.toString().trim().match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return minutes * 60 + seconds;
}

export function formatSecondsToPace(secPerKm: number): string {
  const minutes = Math.floor(secPerKm / 60);
  const seconds = secPerKm % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
