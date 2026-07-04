import { prisma } from "@/lib/db";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { fetchActivityStreams } from "@/lib/strava/streams";
import { StravaApiError } from "@/lib/strava/client";
import { computeBestTimeCandidates, detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 20;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

/**
 * Fetches distance streams and detects best times only for activities that
 * have never been processed (streamsFetchedAt is null).
 */
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
    },
  });

  const result: ProcessPeaksResult = { processed: 0, newRecords: [] };
  if (candidates.length === 0) return result;

  const accessToken = await ensureFreshToken(userId);

  for (const activity of candidates) {
    try {
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
      if (err instanceof StravaApiError && err.status === 429) {
        break;
      }
      console.error("Failed to process best times for activity", activity.id, err);
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return result;
}
