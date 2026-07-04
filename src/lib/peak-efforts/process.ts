import { prisma } from "@/lib/db";
import { computeBestTimeCandidates, detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 50;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

/**
 * Derives best times from synced Strava activity distance + moving_time.
 * No GPS streams — matches what Strava shows on the activity.
 */
export async function processNewActivityPeaks(userId: string): Promise<ProcessPeaksResult> {
  const candidates = await prisma.activity.findMany({
    where: { userId, streamsFetchedAt: null, sport: { in: ["RIDE", "RUN"] } },
    orderBy: { date: "desc" },
    take: MAX_ACTIVITIES_PER_RUN,
    select: {
      id: true,
      sport: true,
      date: true,
      distanceM: true,
      durationSec: true,
    },
  });

  const result: ProcessPeaksResult = { processed: 0, newRecords: [] };
  if (candidates.length === 0) return result;

  for (const activity of candidates) {
    try {
      const effortCandidates = computeBestTimeCandidates(activity.sport, {
        distanceM: activity.distanceM,
        durationSec: activity.durationSec,
      });
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
      console.error("Failed to process best times for activity", activity.id, err);
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return result;
}
