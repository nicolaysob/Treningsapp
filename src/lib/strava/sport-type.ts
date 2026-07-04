const INDOOR_CYCLING_TYPES = new Set(["VirtualRide"]);

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
