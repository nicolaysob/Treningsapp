import { cache } from "react";
import { prisma } from "@/lib/db";
import { estimateHrMaxFromPeak } from "./estimate-hr-max";

export type ThresholdMethod = "power" | "pace" | "hr" | "mixed";

export interface ThresholdSetup {
  ftpWatts: number | null;
  thresholdPaceSecPerKm: number | null;
  hrThresholdBpm: number | null;
  hrMaxBpm: number | null;
  suggestedHrMax: number | null;
  totalActivities: number;
  activitiesWithHr: number;
  activitiesWithTss: number;
  tssCoverage: number;
  method: ThresholdMethod | null;
  needsHrMaxSetup: boolean;
  isActive: boolean;
}

type ActivityStats = {
  total: number;
  with_hr: number;
  with_tss: number;
};

async function getActivityStats(userId: string): Promise<ActivityStats> {
  const [row] = await prisma.$queryRaw<ActivityStats[]>`
    SELECT
      COUNT(*)::int AS total,
      COUNT("avgHr")::int AS with_hr,
      COUNT(tss)::int AS with_tss
    FROM "Activity"
    WHERE "userId" = ${userId}
  `;
  return row ?? { total: 0, with_hr: 0, with_tss: 0 };
}

function buildMethod(ftp: number | null, pace: number | null, hr: number | null): ThresholdMethod | null {
  const hasPower = ftp !== null;
  const hasPace = pace !== null;
  const hasHr = hr !== null;
  if (hasPower && hasPace) return "mixed";
  if (hasPower) return "power";
  if (hasPace) return "pace";
  if (hasHr) return "hr";
  return null;
}

export const getThresholdSetup = cache(async (userId: string): Promise<ThresholdSetup> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ftpWatts: true, thresholdPaceSecPerKm: true, hrThresholdBpm: true, hrMaxBpm: true },
  });

  const ftpWatts = user?.ftpWatts ?? null;
  const thresholdPaceSecPerKm = user?.thresholdPaceSecPerKm ?? null;
  const hrThresholdBpm = user?.hrThresholdBpm ?? null;
  const hrMaxBpm = user?.hrMaxBpm ?? null;
  const method = buildMethod(ftpWatts, thresholdPaceSecPerKm, hrThresholdBpm);

  if (hrMaxBpm) {
    const { total: totalActivities, with_tss: activitiesWithTss } = await getActivityStats(userId);
    const tssCoverage = totalActivities > 0 ? activitiesWithTss / totalActivities : 0;

    return {
      ftpWatts,
      thresholdPaceSecPerKm,
      hrThresholdBpm,
      hrMaxBpm,
      suggestedHrMax: null,
      totalActivities,
      activitiesWithHr: 0,
      activitiesWithTss,
      tssCoverage,
      method,
      needsHrMaxSetup: false,
      isActive: tssCoverage >= 0.5 && method !== null,
    };
  }

  const [stats, peakHr] = await Promise.all([
    getActivityStats(userId),
    prisma.activity.findFirst({
      where: { userId, avgHr: { not: null }, durationSec: { gte: 600 } },
      orderBy: { avgHr: "desc" },
      select: { avgHr: true },
    }),
  ]);

  const { total: totalActivities, with_hr: activitiesWithHr, with_tss: activitiesWithTss } = stats;

  const tssCoverage = totalActivities > 0 ? activitiesWithTss / totalActivities : 0;

  return {
    ftpWatts,
    thresholdPaceSecPerKm,
    hrThresholdBpm,
    hrMaxBpm,
    suggestedHrMax: peakHr?.avgHr ? estimateHrMaxFromPeak(peakHr.avgHr) : null,
    totalActivities,
    activitiesWithHr,
    activitiesWithTss,
    tssCoverage,
    method,
    needsHrMaxSetup: activitiesWithHr > 0,
    isActive: tssCoverage >= 0.5 && method !== null,
  };
});
