import { prisma } from "@/lib/db";
import {
  pickBestTimesFromActivities,
  distanceTargets,
  normalizedTimeSec,
  activityMatchesTarget,
} from "./best-times";
import type { Sport } from "@prisma/client";

export type BestTimeMetric = "time";

export interface BestTimeCandidate {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
}

export function computeBestTimeCandidates(
  sport: Sport,
  activity: { distanceM: number | null; durationSec: number },
): BestTimeCandidate[] {
  if (!activity.distanceM || activity.distanceM <= 0 || activity.durationSec <= 0) {
    return [];
  }

  const candidates: BestTimeCandidate[] = [];

  for (const targetM of distanceTargets(sport)) {
    if (!activityMatchesTarget(activity.distanceM, targetM)) continue;
    candidates.push({
      distanceM: targetM,
      metric: "time",
      value: normalizedTimeSec(activity.durationSec, activity.distanceM, targetM),
    });
  }

  return candidates;
}

export interface DetectedPr {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
}

export async function detectAndStorePeaks(
  userId: string,
  activityId: string,
  sport: Sport,
  achievedAt: Date,
  candidates: BestTimeCandidate[],
): Promise<DetectedPr[]> {
  const prs: DetectedPr[] = [];

  for (const candidate of candidates) {
    const key = {
      userId_sport_metric_durationSec: {
        userId,
        sport,
        metric: candidate.metric,
        durationSec: candidate.distanceM,
      },
    };

    const existing = await prisma.peakEffort.findUnique({ where: key });
    const isBetter = !existing || candidate.value < existing.value;

    if (!isBetter) continue;

    await prisma.peakEffort.upsert({
      where: key,
      create: {
        userId,
        sport,
        metric: candidate.metric,
        durationSec: candidate.distanceM,
        value: candidate.value,
        achievedAt,
        activityId,
      },
      update: { value: candidate.value, achievedAt, activityId },
    });

    prs.push({ distanceM: candidate.distanceM, metric: candidate.metric, value: candidate.value });
  }

  return prs;
}
