import type { Sport } from "@prisma/client";
import { distanceTargets } from "./best-times";
import { activityMatchesTarget, normalizedTimeSec } from "./best-times";
import type { StravaBestEffort } from "@/lib/strava/activity-detail";

export type BestTimeMetric = "time";

export interface BestTimeCandidate {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
  achievedAt: Date;
}

/** Known Strava standard best-effort distances (meters). */
const STRAVA_KNOWN_DISTANCES: Partial<Record<Sport, Record<number, number>>> = {
  RUN: {
    1000: 1000,
    5000: 5000,
    10000: 10000,
    21097: 21097,
    21098: 21097,
    42195: 42195,
  },
  RIDE: {
    10000: 10000,
    20000: 20000,
    30000: 30000,
    40000: 40000,
    50000: 50000,
    80000: 80000,
    80467: 80000,
    100000: 100000,
  },
};

export function mapStravaEffortDistance(distanceM: number, sport: Sport): number | null {
  if (distanceM <= 0) return null;

  const rounded = Math.round(distanceM);
  const known = STRAVA_KNOWN_DISTANCES[sport]?.[rounded];
  if (known) return known;

  for (const targetM of distanceTargets(sport)) {
    if (Math.abs(distanceM - targetM) / targetM <= 0.015) {
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
    const timeSec = effort.elapsed_time || effort.moving_time;
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

export function activitySummaryToCandidates(
  sport: Sport,
  distanceM: number | null,
  durationSec: number,
  date: Date,
): BestTimeCandidate[] {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return [];

  const candidates: BestTimeCandidate[] = [];

  for (const targetM of distanceTargets(sport)) {
    if (!activityMatchesTarget(distanceM, targetM)) continue;
    candidates.push({
      distanceM: targetM,
      metric: "time",
      value: normalizedTimeSec(durationSec, distanceM, targetM),
      achievedAt: date,
    });
  }

  return candidates;
}
