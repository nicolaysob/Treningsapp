import type { Sport } from "@prisma/client";
import { RUN_DISTANCES_M, RIDE_DISTANCES_M } from "./format";

export interface BestTimeRecord {
  distanceM: number;
  label: string;
  timeSec: number | null;
  achievedAt: Date | null;
  actualDistanceM: number | null;
}

export function distanceTargets(sport: Sport): readonly number[] {
  return sport === "RUN" ? RUN_DISTANCES_M : RIDE_DISTANCES_M;
}
