import { prisma } from "@/lib/db";
import { DISTANCE_LABELS } from "./format";
import {
  distanceTargets,
  pickBestTimesFromActivities,
  mergeBestTimeRecords,
} from "./best-times";
import { isOutdoorCycling, isOutdoorRun } from "@/lib/strava/sport-type";
import type { BestTimeRecord } from "./best-times";
import type { Sport } from "@prisma/client";

function peaksToRecords(
  peaks: {
    durationSec: number;
    value: number;
    achievedAt: Date;
  }[],
): BestTimeRecord[] {
  return peaks.map((row) => ({
    distanceM: row.durationSec,
    label: DISTANCE_LABELS[row.durationSec] ?? `${row.durationSec / 1000} km`,
    timeSec: row.value,
    achievedAt: row.achievedAt,
    actualDistanceM: row.durationSec,
  }));
}

export async function getBestTimesForUser(
  userId: string,
  sport: Sport,
): Promise<BestTimeRecord[]> {
  const targets = distanceTargets(sport);

  const [activities, peaks] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, sport, distanceM: { not: null } },
      select: { durationSec: true, distanceM: true, date: true, raw: true },
    }),
    prisma.peakEffort.findMany({
      where: { userId, sport, metric: "time" },
      select: {
        durationSec: true,
        value: true,
        achievedAt: true,
        activity: { select: { raw: true } },
      },
    }),
  ]);

  const outdoorActivities =
    sport === "RIDE"
      ? activities.filter((a) => isOutdoorCycling(a.raw))
      : sport === "RUN"
        ? activities.filter((a) => isOutdoorRun(a.raw))
        : activities;

  const eligiblePeaks =
    sport === "RIDE"
      ? peaks.filter((p) => !p.activity || isOutdoorCycling(p.activity.raw))
      : sport === "RUN"
        ? peaks.filter((p) => !p.activity || isOutdoorRun(p.activity.raw))
        : peaks;

  return mergeBestTimeRecords(
    targets,
    pickBestTimesFromActivities(sport, outdoorActivities),
    peaksToRecords(eligiblePeaks),
  );
}
