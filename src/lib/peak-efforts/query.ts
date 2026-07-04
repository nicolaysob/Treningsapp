import { prisma } from "@/lib/db";
import { DISTANCE_LABELS } from "./format";
import { distanceTargets } from "./best-times";
import { isOutdoorCycling, isOutdoorRun } from "@/lib/strava/sport-type";
import type { BestTimeRecord } from "./best-times";
import type { Sport } from "@prisma/client";

export async function getBestTimesForUser(
  userId: string,
  sport: Sport,
): Promise<BestTimeRecord[]> {
  const targets = distanceTargets(sport);

  const peaks = await prisma.peakEffort.findMany({
    where: { userId, sport, metric: "time" },
    select: {
      durationSec: true,
      value: true,
      achievedAt: true,
      activity: { select: { raw: true } },
    },
  });

  const eligible =
    sport === "RIDE"
      ? peaks.filter((p) => !p.activity || isOutdoorCycling(p.activity.raw))
      : sport === "RUN"
        ? peaks.filter((p) => !p.activity || isOutdoorRun(p.activity.raw))
        : peaks;

  return targets.map((distanceM) => {
    const matches = eligible.filter((p) => p.durationSec === distanceM);
    if (matches.length === 0) {
      return {
        distanceM,
        label: DISTANCE_LABELS[distanceM],
        timeSec: null,
        achievedAt: null,
        actualDistanceM: null,
      };
    }

    const best = matches.reduce((a, b) => (a.value < b.value ? a : b));

    return {
      distanceM,
      label: DISTANCE_LABELS[distanceM],
      timeSec: best.value,
      achievedAt: best.achievedAt,
      actualDistanceM: distanceM,
    };
  });
}
