import { prisma } from "@/lib/db";
import { bestTimeForDistance } from "./distance-window";
import {
  distanceTargets,
  activityMatchesTarget,
  normalizedTimeSec,
} from "./best-times";
import type { Sport } from "@prisma/client";
import type { DistanceSample } from "./distance-window";

export type BestTimeMetric = "time";

export interface BestTimeCandidate {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
}

function candidateFromActivity(
  sport: Sport,
  distanceM: number | null,
  durationSec: number,
  targetM: number,
): BestTimeCandidate | null {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return null;
  if (!activityMatchesTarget(distanceM, targetM)) return null;
  return {
    distanceM: targetM,
    metric: "time",
    value: normalizedTimeSec(durationSec, distanceM, targetM),
  };
}

function candidateFromStreams(
  sport: Sport,
  distance: DistanceSample[],
  targetM: number,
): BestTimeCandidate | null {
  const best = bestTimeForDistance(distance, targetM, sport);
  if (best === null) return null;
  return { distanceM: targetM, metric: "time", value: best };
}

function pickCandidate(
  activityCandidate: BestTimeCandidate | null,
  streamCandidate: BestTimeCandidate | null,
  actualDistanceM: number | null,
  targetM: number,
): BestTimeCandidate | null {
  if (activityCandidate && actualDistanceM) {
    const exactRace =
      Math.abs(actualDistanceM - targetM) / targetM <= (targetM <= 10000 ? 0.01 : 0.005);
    if (exactRace) return activityCandidate;
  }

  if (!activityCandidate) return streamCandidate;
  if (!streamCandidate) return activityCandidate;
  return activityCandidate.value <= streamCandidate.value
    ? activityCandidate
    : streamCandidate;
}

export function computeBestTimeCandidates(
  sport: Sport,
  streams: { distance: DistanceSample[] },
  activity?: { distanceM: number | null; durationSec: number },
): BestTimeCandidate[] {
  const candidates: BestTimeCandidate[] = [];

  for (const targetM of distanceTargets(sport)) {
    const activityCandidate = activity
      ? candidateFromActivity(sport, activity.distanceM, activity.durationSec, targetM)
      : null;
    const streamCandidate = candidateFromStreams(sport, streams.distance, targetM);
    const picked = pickCandidate(
      activityCandidate,
      streamCandidate,
      activity?.distanceM ?? null,
      targetM,
    );

    if (picked) candidates.push(picked);
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
