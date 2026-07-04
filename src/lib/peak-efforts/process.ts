import { prisma } from "@/lib/db";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { fetchActivityDetail } from "@/lib/strava/activity-detail";
import { StravaApiError } from "@/lib/strava/client";
import { countsForBestTimes } from "@/lib/strava/sport-type";
import { bestEffortsToCandidates } from "./strava-best-efforts";
import { detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 30;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

/**
 * Fetches Strava activity details and imports official best_efforts.
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
    },
  });

  const result: ProcessPeaksResult = { processed: 0, newRecords: [] };
  if (candidates.length === 0) return result;

  const accessToken = await ensureFreshToken(userId);

  for (const activity of candidates) {
    if (activity.sport !== "RUN" && activity.sport !== "RIDE") continue;

    try {
      const detail = await fetchActivityDetail(activity.stravaActivityId, accessToken);

      if (countsForBestTimes(activity.sport, detail)) {
        const effortCandidates = bestEffortsToCandidates(
          activity.sport,
          detail.best_efforts ?? [],
        );
        const prs = await detectAndStorePeaks(
          userId,
          activity.id,
          activity.sport,
          effortCandidates,
        );
        result.newRecords.push(...prs.map((pr) => ({ ...pr, activityId: activity.id })));
      }

      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });

      result.processed++;
    } catch (err) {
      if (err instanceof StravaApiError && err.status === 429) break;
      console.error("Failed to import Strava best efforts for activity", activity.id, err);
      await prisma.activity.update({
        where: { id: activity.id },
        data: { streamsFetchedAt: new Date() },
      });
    }
  }

  return result;
}

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
