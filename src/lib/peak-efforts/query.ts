import { prisma } from "@/lib/db";
import { DISTANCE_LABELS } from "./format";
import {
  pickBestTimesFromActivities,
  type BestTimeRecord,
} from "./best-times";
import type { Sport } from "@prisma/client";

function mergeBestTimeRecords(
  targets: readonly number[],
  fromActivities: BestTimeRecord[],
  fromPeaks: BestTimeRecord[],
): BestTimeRecord[] {
  return targets.map((distanceM) => {
    const activity = fromActivities.find((r) => r.distanceM === distanceM);
    const peak = fromPeaks.find((r) => r.distanceM === distanceM);

    if (!activity?.timeSec) return peak ?? activity ?? emptyRecord(distanceM);
    if (!peak?.timeSec) return activity;

    return activity.timeSec <= peak.timeSec ? activity : peak;
  });
}

function emptyRecord(distanceM: number): BestTimeRecord {
  return {
    distanceM,
    label: DISTANCE_LABELS[distanceM],
    timeSec: null,
    achievedAt: null,
    actualDistanceM: null,
  };
}

export async function getBestTimesForUser(
  userId: string,
  sport: Sport,
): Promise<BestTimeRecord[]> {
  const [activities, peaks] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, sport, distanceM: { not: null } },
      select: { durationSec: true, distanceM: true, date: true },
    }),
    prisma.peakEffort.findMany({
      where: { userId, sport, metric: "time" },
      select: { durationSec: true, value: true, achievedAt: true },
    }),
  ]);

  const fromActivities = pickBestTimesFromActivities(sport, activities);
  const fromPeaks: BestTimeRecord[] = peaks.map((row) => ({
    distanceM: row.durationSec,
    label: DISTANCE_LABELS[row.durationSec] ?? `${row.durationSec / 1000} km`,
    timeSec: row.value,
    achievedAt: row.achievedAt,
    actualDistanceM: row.durationSec,
  }));

  const targets = fromActivities.map((r) => r.distanceM);
  return mergeBestTimeRecords(targets, fromActivities, fromPeaks);
}
