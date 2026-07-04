const INDOOR_CYCLING_TYPES = new Set(["VirtualRide"]);
const INDOOR_RUN_TYPES = new Set(["VirtualRun"]);

export function getStravaSportType(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const sportType = (raw as { sport_type?: string }).sport_type;
  return typeof sportType === "string" ? sportType : null;
}

export function isOutdoorCycling(raw: unknown): boolean {
  const sportType = getStravaSportType(raw);
  if (!sportType) return true;
  return !INDOOR_CYCLING_TYPES.has(sportType);
}

export function isOutdoorRun(raw: unknown): boolean {
  const sportType = getStravaSportType(raw);
  if (!sportType) return true;
  return !INDOOR_RUN_TYPES.has(sportType);
}

export function countsForBestTimes(
  sport: "RUN" | "RIDE",
  detail: { sport_type: string; trainer: boolean },
): boolean {
  if (detail.trainer) return false;
  if (sport === "RIDE") return !INDOOR_CYCLING_TYPES.has(detail.sport_type);
  if (sport === "RUN") return !INDOOR_RUN_TYPES.has(detail.sport_type);
  return false;
}
