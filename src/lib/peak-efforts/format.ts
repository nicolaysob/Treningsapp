export const PEAK_DURATIONS_SEC = [5, 60, 300, 1200, 3600];

export const DURATION_LABELS: Record<number, string> = {
  5: "5s",
  60: "1min",
  300: "5min",
  1200: "20min",
  3600: "60min",
};

export function formatPace(secPerKm: number): string {
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.round(secPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}
