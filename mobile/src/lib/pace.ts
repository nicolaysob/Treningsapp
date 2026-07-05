export function formatSecondsToPace(secPerKm: number): string {
  const minutes = Math.floor(secPerKm / 60);
  const seconds = secPerKm % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parsePaceToSeconds(value: string): number | null {
  const match = value.trim().match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return minutes * 60 + seconds;
}

export function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}
