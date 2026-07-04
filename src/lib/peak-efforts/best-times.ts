import type { Sport } from "@prisma/client";
import { RUN_DISTANCES_M, RIDE_DISTANCES_M, DISTANCE_LABELS } from "./format";

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

export function activityMatchTolerance(targetM: number): number {
  if (targetM <= 10000) return 0.03;
  return 0.025;
}

export function activityMatchesTarget(actualM: number, targetM: number): boolean {
  return Math.abs(actualM - targetM) / targetM <= activityMatchTolerance(targetM);
}

export function normalizedTimeSec(
  durationSec: number,
  actualM: number,
  targetM: number,
): number {
  return durationSec * (targetM / actualM);
}

export interface ActivityForBestTime {
  durationSec: number;
  distanceM: number | null;
  date: Date;
}

export function pickBestTimesFromActivities(
  sport: Sport,
  activities: ActivityForBestTime[],
): BestTimeRecord[] {
  return distanceTargets(sport).map((targetM) => {
    let best: { timeSec: number; date: Date; actualDistanceM: number } | null = null;

    for (const activity of activities) {
      if (!activity.distanceM || activity.distanceM <= 0 || activity.durationSec <= 0) continue;
      if (!activityMatchesTarget(activity.distanceM, targetM)) continue;

      const timeSec = normalizedTimeSec(activity.durationSec, activity.distanceM, targetM);
      if (best === null || timeSec < best.timeSec) {
        best = { timeSec, date: activity.date, actualDistanceM: activity.distanceM };
      }
    }

    return {
      distanceM: targetM,
      label: DISTANCE_LABELS[targetM],
      timeSec: best?.timeSec ?? null,
      achievedAt: best?.date ?? null,
      actualDistanceM: best?.actualDistanceM ?? null,
    };
  });
}

export function mergeBestTimeRecords(
  targets: readonly number[],
  ...sources: BestTimeRecord[][]
): BestTimeRecord[] {
  return targets.map((distanceM) => {
    const rows = sources
      .map((source) => source.find((r) => r.distanceM === distanceM))
      .filter((r): r is BestTimeRecord => !!r?.timeSec);

    if (rows.length === 0) {
      return {
        distanceM,
        label: DISTANCE_LABELS[distanceM],
        timeSec: null,
        achievedAt: null,
        actualDistanceM: null,
      };
    }

    const best = rows.reduce((a, b) => (a.timeSec! < b.timeSec! ? a : b));
    return best;
  });
}
