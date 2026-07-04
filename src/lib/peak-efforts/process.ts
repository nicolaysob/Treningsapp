import { prisma } from "@/lib/db";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { fetchActivityStreams } from "@/lib/strava/streams";
import { StravaApiError } from "@/lib/strava/client";
import { isOutdoorCycling } from "@/lib/strava/sport-type";
import { computeBestTimeCandidates, detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 30;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

export async function processNewActivityPeaks(userId: string): Promise<ProcessPeaksResult> {
  const candidates = await prisma.activity.findMany({
    where: { userId, streamsFetchedAt: null, sport: { in: ["RIDE", "RUN"] } },
    orderBy: { date: "desc" },
    take: MAX_ACTIVITIES_PER_RUN,
    select: {
      id: true,
      stravaActivityId: true,
      sport: true,
      date: true,
      distanceM: true,
      durationSec: true,
      raw: true,
    },
  });

  const result: ProcessPeaksResult = { processed: 0, newRecords: [] };
  if (candidates.length === 0) return result;

  const accessToken = await ensureFreshToken(userId);

  for (const activity of candidates) {
    try {
      if (activity.sport === "RIDE" && !isOutdoorCycling(activity.raw)) {
        await prisma.activity.update({
          where: { id: activity.id },
          data: { streamsFetchedAt: new Date() },
        });
        result.processed++;
        continue;
      }

      let effortCandidates;
      try {
        const streams = await fetchActivityStreams(activity.stravaActivityId, accessToken);
        effortCandidates = computeBestTimeCandidates(activity.sport, streams, {
          distanceM: activity.distanceM,
          durationSec: activity.durationSec,
        });
      } catch (streamErr) {
        if (streamErr instanceof StravaApiError && streamErr.status === 429) {
          throw streamErr;
        }
        effortCandidates = computeBestTimeCandidates(
          activity.sport,
          { distance: [] },
          { distanceM: activity.distanceM, durationSec: activity.durationSec },
        );
      }

      const prs = await detectAndStorePeaks(
        userId,
        activity.id,
        activity.sport,
        activity.date,
        effortCandidates,
      );

      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });

      result.processed++;
      result.newRecords.push(...prs.map((pr) => ({ ...pr, activityId: activity.id })));
    } catch (err) {
      if (err instanceof StravaApiError && err.status === 429) break;
      console.error("Failed to process best times for activity", activity.id, err);
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return result;
}

/** Process all pending activities in batches (rate-limit aware). */
export async function processAllActivityPeaks(userId: string): Promise<ProcessPeaksResult> {
  const total: ProcessPeaksResult = { processed: 0, newRecords: [] };

  for (let batch = 0; batch < 40; batch++) {
    const result = await processNewActivityPeaks(userId);
    total.processed += result.processed;
    total.newRecords.push(...result.newRecords);
    if (result.processed === 0) break;
  }

  return total;
}
