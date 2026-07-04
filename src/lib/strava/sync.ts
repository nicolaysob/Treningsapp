import { Prisma, Sport } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureFreshToken } from "./tokens";
import { stravaRequest } from "./client";

interface StravaSummaryActivity {
  id: number;
  type: string;
  sport_type: string;
  start_date: string;
  moving_time: number;
  distance: number;
  average_watts?: number;
  weighted_average_watts?: number;
  average_heartrate?: number;
  total_elevation_gain?: number;
}

function mapSport(sportType: string): Sport {
  if (["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide"].includes(sportType)) {
    return Sport.RIDE;
  }
  if (["Run", "TrailRun", "VirtualRun"].includes(sportType)) {
    return Sport.RUN;
  }
  if (["Swim"].includes(sportType)) {
    return Sport.SWIM;
  }
  if (["WeightTraining", "Workout", "Crossfit"].includes(sportType)) {
    return Sport.STRENGTH;
  }
  return Sport.OTHER;
}

export interface SyncResult {
  processed: number;
  errors: number;
}

/**
 * Fetches new/changed activities from Strava and upserts them by
 * stravaActivityId (idempotent — safe to re-run). Deliberately does not
 * compute TSS or fetch streams here; those are separate, independently
 * retryable steps.
 */
export async function syncUserActivities(userId: string): Promise<SyncResult> {
  const accessToken = await ensureFreshToken(userId);

  const latest = await prisma.activity.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  // Small overlap buffer to catch clock-skew edge cases on incremental syncs.
  const afterEpoch = latest
    ? Math.floor(latest.date.getTime() / 1000) - 60 * 60 * 24
    : 0;

  const result: SyncResult = { processed: 0, errors: 0 };
  let page = 1;

  while (true) {
    const { data: activities, rateLimitNearLimit } = await stravaRequest<
      StravaSummaryActivity[]
    >(`/athlete/activities?after=${afterEpoch}&per_page=100&page=${page}`, accessToken);

    if (activities.length === 0) break;

    for (const a of activities) {
      try {
        const distanceM = a.distance || null;
        const avgPaceSecPerKm =
          distanceM && distanceM > 0
            ? Math.round(a.moving_time / (distanceM / 1000))
            : null;

        const fields = {
          date: new Date(a.start_date),
          sport: mapSport(a.sport_type ?? a.type),
          durationSec: a.moving_time,
          distanceM,
          avgWatts: a.average_watts ?? null,
          npWatts: a.weighted_average_watts ?? null,
          avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
          elevationM: a.total_elevation_gain ?? null,
          avgPaceSecPerKm,
          raw: a as unknown as Prisma.InputJsonValue,
        };

        await prisma.activity.upsert({
          where: { stravaActivityId: BigInt(a.id) },
          // userId is intentionally excluded from `update`: an activity's
          // owner must never change on re-sync, even if stravaActivityId
          // collided across users due to an unrelated bug.
          create: { userId, stravaActivityId: BigInt(a.id), ...fields },
          update: fields,
        });

        result.processed++;
      } catch (err) {
        console.error("Failed to upsert Strava activity", a.id, err);
        result.errors++;
      }
    }

    // Near the rate limit: stop here, the next sync run picks up where we
    // left off since upserts are idempotent.
    if (rateLimitNearLimit) break;
    if (activities.length < 100) break;
    page++;
  }

  return result;
}
