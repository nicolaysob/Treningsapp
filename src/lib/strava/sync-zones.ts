import { prisma } from "@/lib/db";
import { startOfIsoWeek } from "@/lib/date";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { stravaRequest } from "@/lib/strava/client";
import {
  computeZoneSecondsFromHrStream,
  parseStravaHrStream,
} from "@/lib/strava/hr-stream-zones";

const MAX_PER_RUN = 15;

export async function invalidateActivityZones(userId: string): Promise<void> {
  const since = startOfIsoWeek(new Date());
  since.setUTCDate(since.getUTCDate() - 28);

  await prisma.activity.updateMany({
    where: { userId, date: { gte: since } },
    data: {
      streamsFetchedAt: null,
      zoneS1Sec: null,
      zoneS2Sec: null,
      zoneS3Sec: null,
      zoneS4Sec: null,
      zoneS5Sec: null,
    },
  });
}

export async function syncActivityZones(userId: string): Promise<{ processed: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hrMaxBpm: true },
  });

  if (!user?.hrMaxBpm) return { processed: 0 };

  const weekStart = startOfIsoWeek(new Date());

  const activities = await prisma.activity.findMany({
    where: {
      userId,
      streamsFetchedAt: null,
      date: { gte: weekStart },
    },
    orderBy: { date: "desc" },
    take: MAX_PER_RUN,
    select: { id: true, stravaActivityId: true },
  });

  if (activities.length === 0) return { processed: 0 };

  const accessToken = await ensureFreshToken(userId);
  let processed = 0;

  for (const activity of activities) {
    try {
      const { data, rateLimitNearLimit } = await stravaRequest<Record<string, { data: number[] }>>(
        `/activities/${activity.stravaActivityId}/streams?keys=heartrate,time&key_by_type=true`,
        accessToken,
      );

      const stream = parseStravaHrStream(data);
      const zones = stream
        ? computeZoneSecondsFromHrStream(stream.heartrate, stream.time, user.hrMaxBpm)
        : null;

      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          streamsFetchedAt: new Date(),
          zoneS1Sec: zones ? Math.round(zones.z1) : null,
          zoneS2Sec: zones ? Math.round(zones.z2) : null,
          zoneS3Sec: zones ? Math.round(zones.z3) : null,
          zoneS4Sec: zones ? Math.round(zones.z4) : null,
          zoneS5Sec: zones ? Math.round(zones.z5) : null,
        },
      });

      processed++;
      if (rateLimitNearLimit) break;
    } catch (err) {
      console.error("Failed to fetch HR stream for activity", activity.id, err);
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return { processed };
}
