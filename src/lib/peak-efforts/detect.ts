import { prisma } from "@/lib/db";
import type { BestTimeCandidate } from "./strava-best-efforts";

export interface DetectedPr {
  distanceM: number;
  metric: "time";
  value: number;
}

export async function detectAndStorePeaks(
  userId: string,
  activityId: string,
  sport: "RUN" | "RIDE",
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
        achievedAt: candidate.achievedAt,
        activityId,
      },
      update: { value: candidate.value, achievedAt: candidate.achievedAt, activityId },
    });

    prs.push({ distanceM: candidate.distanceM, metric: candidate.metric, value: candidate.value });
  }

  return prs;
}
