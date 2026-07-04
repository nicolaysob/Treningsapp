export const RUN_DISTANCES_M = [1000, 5000, 10000, 21097, 42195] as const;
export const RIDE_DISTANCES_M = [10000, 20000, 30000, 40000, 50000, 80000, 100000] as const;

export const DISTANCE_LABELS: Record<number, string> = {
  1000: "1 km",
  5000: "5 km",
  10000: "10 km",
  21097: "Halvmaraton",
  42195: "Maraton",
  20000: "20 km",
  30000: "30 km",
  40000: "40 km",
  50000: "50 km",
  80000: "80 km",
  100000: "100 km",
};

export function formatRaceTime(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.round(sec % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatPace(secPerKm: number): string {
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.round(secPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

export function formatSpeedKmh(distanceM: number, timeSec: number): string {
  if (timeSec <= 0) return "—";
  const kmh = (distanceM / timeSec) * 3.6;
  return `${kmh.toFixed(1)} km/t`;
}
