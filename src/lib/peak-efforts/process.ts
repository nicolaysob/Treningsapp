import { prisma } from "@/lib/db";
import { ensureFreshToken } from "@/lib/strava/tokens";
import { fetchActivityDetail } from "@/lib/strava/activity-detail";
import { StravaApiError } from "@/lib/strava/client";
import { countsForBestTimes, isOutdoorCycling, isOutdoorRun } from "@/lib/strava/sport-type";
import {
  bestEffortsToCandidates,
  activitySummaryToCandidates,
} from "./strava-best-efforts";
import { detectAndStorePeaks, type DetectedPr } from "./detect";

const MAX_ACTIVITIES_PER_RUN = 30;

export interface ProcessPeaksResult {
  processed: number;
  newRecords: (DetectedPr & { activityId: string })[];
}

export async function resetBestTimesProcessing(userId: string): Promise<void> {
  await prisma.activity.updateMany({
    where: { userId, sport: { in: ["RIDE", "RUN"] } },
    data: { streamsFetchedAt: null },
  });
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
    if (activity.sport !== "RUN" && activity.sport !== "RIDE") continue;

    const includeActivity =
      activity.sport === "RIDE"
        ? isOutdoorCycling(activity.raw)
        : isOutdoorRun(activity.raw);

    try {
      let effortCandidates: ReturnType<typeof bestEffortsToCandidates> = [];

      if (includeActivity) {
        try {
          const detail = await fetchActivityDetail(activity.stravaActivityId, accessToken);

          if (countsForBestTimes(activity.sport, detail)) {
            effortCandidates = bestEffortsToCandidates(activity.sport, detail.best_efforts ?? []);
          }
        } catch (streamErr) {
          if (streamErr instanceof StravaApiError && streamErr.status === 429) {
            throw streamErr;
          }
        }

        if (effortCandidates.length === 0) {
          effortCandidates = activitySummaryToCandidates(
            activity.sport,
            activity.distanceM,
            activity.durationSec,
            activity.date,
          );
        }
      }

      if (effortCandidates.length > 0) {
        const prs = await detectAndStorePeaks(userId, activity.id, activity.sport, effortCandidates);
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
