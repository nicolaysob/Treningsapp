import { formatDateNb, startOfIsoWeek, toDateKey } from "@/lib/date";
import { prisma } from "@/lib/db";
import { ensureProductionSchema } from "@/lib/db/ensure-schema";
import {
  buildWeeklyZoneDistribution,
  type WeeklyZoneDistribution,
} from "@/lib/training-load/intensity-zones";

export async function fetchWeeklyZoneDistribution(
  userId: string,
  weekOffset = 0,
): Promise<WeeklyZoneDistribution | null> {
  await ensureProductionSchema();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hrMaxBpm: true },
  });

  if (!user?.hrMaxBpm) return null;

  const anchor = new Date();
  anchor.setUTCDate(anchor.getUTCDate() + weekOffset * 7);

  const weekStart = startOfIsoWeek(anchor);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const weekStartKey = toDateKey(weekStart);
  const weekEndDisplay = new Date(weekStart);
  weekEndDisplay.setUTCDate(weekEndDisplay.getUTCDate() + 6);

  const activities = await prisma.activity.findMany({
    where: { userId, date: { gte: weekStart, lt: weekEnd } },
    select: {
      durationSec: true,
      zoneS1Sec: true,
      zoneS2Sec: true,
      zoneS3Sec: true,
      zoneS4Sec: true,
      zoneS5Sec: true,
    },
  });

  if (activities.length === 0) return null;

  return buildWeeklyZoneDistribution(
    activities,
    weekStartKey,
    formatDateNb(weekEndDisplay, { day: "numeric", month: "short" }),
  );
}
