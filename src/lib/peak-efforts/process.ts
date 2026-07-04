import { prisma } from "@/lib/db";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { fetchActivityStreams } from "@/lib/strava/streams";
import { StravaApiError } from "@/lib/strava/client";
import { computePeakEffortCandidates, detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 20;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

/**
 * Fetches streams and detects peak efforts only for activities that have
 * never been processed (streamsFetchedAt is null) — this is the one
 * rate-limit-relevant step in the app, so it's capped per run and bails out
 * cleanly on 429. Safe to re-run: unprocessed activities are picked up on
 * the next sync since the guard is persisted per-activity.
 */
export async function processNewActivityPeaks(userId: string): Promise<ProcessPeaksResult> {
  const candidates = await prisma.activity.findMany({
    where: { userId, streamsFetchedAt: null, sport: { in: ["RIDE", "RUN"] } },
    orderBy: { date: "desc" },
    take: MAX_ACTIVITIES_PER_RUN,
  });

  const result: ProcessPeaksResult = { processed: 0, newRecords: [] };
  if (candidates.length === 0) return result;

  const accessToken = await ensureFreshToken(userId);

  for (const activity of candidates) {
    try {
      const streams = await fetchActivityStreams(activity.stravaActivityId, accessToken);
      const effortCandidates = computePeakEffortCandidates(activity.sport, streams);
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
      console.error("Failed to process peak efforts for activity", activity.id, err);
      // Mark as attempted so a persistently-broken activity doesn't block
      // the queue forever.
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return result;
}
