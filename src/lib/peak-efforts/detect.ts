import { prisma } from "@/lib/db";
import { bestTimeForDistance, type DistanceSample } from "./distance-window";
import { RIDE_DISTANCES_M, RUN_DISTANCES_M } from "./format";
import type { Sport } from "@prisma/client";

export type BestTimeMetric = "time";

export interface BestTimeCandidate {
  distanceM: number;
  metric: BestTimeMetric;
  value: number; // elapsed seconds — lower is better
}

function distanceTargets(sport: Sport): readonly number[] {
  return sport === "RUN" ? RUN_DISTANCES_M : RIDE_DISTANCES_M;
}

function candidatesFromStreams(sport: Sport, distance: DistanceSample[]): BestTimeCandidate[] {
  const candidates: BestTimeCandidate[] = [];

  for (const targetM of distanceTargets(sport)) {
    const best = bestTimeForDistance(distance, targetM);
    if (best !== null) {
      candidates.push({ distanceM: targetM, metric: "time", value: best });
    }
  }

  return candidates;
}

function candidatesFromActivity(
  sport: Sport,
  distanceM: number | null,
  durationSec: number,
): BestTimeCandidate[] {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return [];

  const candidates: BestTimeCandidate[] = [];

  for (const targetM of distanceTargets(sport)) {
    const tolerance = targetM <= 10000 ? 0.02 : 0.01;
    if (Math.abs(distanceM - targetM) / targetM <= tolerance) {
      candidates.push({ distanceM: targetM, metric: "time", value: durationSec });
    }
  }

  return candidates;
}

export function computeBestTimeCandidates(
  sport: Sport,
  streams: { distance: DistanceSample[] },
  activity?: { distanceM: number | null; durationSec: number },
): BestTimeCandidate[] {
  const fromStreams = candidatesFromStreams(sport, streams.distance);
  if (fromStreams.length > 0) return fromStreams;

  if (activity) {
    return candidatesFromActivity(sport, activity.distanceM, activity.durationSec);
  }

  return [];
}

export interface DetectedPr {
  distanceM: number;
  metric: BestTimeMetric;
  value: number;
}

/**
 * Compares candidates against stored bests per [sport, distance] bucket.
 * `PeakEffort.durationSec` stores distance in meters; `value` stores time in seconds.
 */
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
