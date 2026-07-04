import type { Sport } from "@prisma/client";
import { distanceTargets } from "./best-times";
import type { StravaBestEffort } from "@/lib/strava/activity-detail";

export type BestTimeMetric = "time";

export interface BestTimeCandidate {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
  achievedAt: Date;
}

/** Map Strava's standard best-effort distance to our bucket. */
export function mapStravaEffortDistance(distanceM: number, sport: Sport): number | null {
  if (distanceM <= 0) return null;

  for (const targetM of distanceTargets(sport)) {
    if (Math.abs(distanceM - targetM) / targetM <= 0.005) {
      return targetM;
    }
  }

  return null;
}

export function bestEffortsToCandidates(
  sport: Sport,
  efforts: StravaBestEffort[],
): BestTimeCandidate[] {
  const candidates: BestTimeCandidate[] = [];

  for (const effort of efforts) {
    const bucketM = mapStravaEffortDistance(effort.distance, sport);
    const timeSec = effort.moving_time || effort.elapsed_time;
    if (!bucketM || timeSec <= 0) continue;

    candidates.push({
      distanceM: bucketM,
      metric: "time",
      value: timeSec,
      achievedAt: new Date(effort.start_date),
    });
  }

  return candidates;
}
