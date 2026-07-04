import { prisma } from "@/lib/db";
import { ensureProductionSchema } from "@/lib/db/ensure-schema";
import { estimateHrMaxFromActivities } from "./estimate-hr-max";

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

export async function getThresholdSetup(userId: string): Promise<ThresholdSetup> {
  await ensureProductionSchema();

  const [user, activityStats, hrActivities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { ftpWatts: true, thresholdPaceSecPerKm: true, hrThresholdBpm: true, hrMaxBpm: true },
    }),
    prisma.activity.aggregate({
      where: { userId },
      _count: { _all: true },
    }),
    prisma.activity.findMany({
      where: { userId },
      select: { avgHr: true, durationSec: true, tss: true },
    }),
  ]);

  const totalActivities = activityStats._count._all;
  const activitiesWithHr = hrActivities.filter((a) => a.avgHr !== null).length;
  const activitiesWithTss = hrActivities.filter((a) => a.tss !== null).length;
  const tssCoverage = totalActivities > 0 ? activitiesWithTss / totalActivities : 0;

  const ftpWatts = user?.ftpWatts ?? null;
  const thresholdPaceSecPerKm = user?.thresholdPaceSecPerKm ?? null;
  const hrThresholdBpm = user?.hrThresholdBpm ?? null;
  const hrMaxBpm = user?.hrMaxBpm ?? null;
  const suggestedHrMax = estimateHrMaxFromActivities(hrActivities);

  const hasPower = ftpWatts !== null;
  const hasPace = thresholdPaceSecPerKm !== null;
  const hasHr = hrThresholdBpm !== null;

  let method: ThresholdMethod | null = null;
  if (hasPower && hasPace) method = "mixed";
  else if (hasPower) method = "power";
  else if (hasPace) method = "pace";
  else if (hasHr) method = "hr";

  const isActive = tssCoverage >= 0.5 && (hasPower || hasPace || hasHr);
  const needsHrMaxSetup = !hrMaxBpm && activitiesWithHr > 0;

  return {
    ftpWatts,
    thresholdPaceSecPerKm,
    hrThresholdBpm,
    hrMaxBpm,
    suggestedHrMax,
    totalActivities,
    activitiesWithHr,
    activitiesWithTss,
    tssCoverage,
    method,
    needsHrMaxSetup,
    isActive,
  };
}
