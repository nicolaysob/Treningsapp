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

function activityMatchTolerance(targetM: number): number {
  return targetM <= 10000 ? 0.02 : 0.01;
}

function activityMatchesDistance(distanceM: number, targetM: number): boolean {
  return Math.abs(distanceM - targetM) / targetM <= activityMatchTolerance(targetM);
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

function candidateFromActivity(
  sport: Sport,
  distanceM: number | null,
  durationSec: number,
  targetM: number,
): BestTimeCandidate | null {
  if (!distanceM || distanceM <= 0 || durationSec <= 0) return null;
  if (!activityMatchesDistance(distanceM, targetM)) return null;
  return { distanceM: targetM, metric: "time", value: durationSec };
}

/**
 * For near-exact race distances, Strava's activity moving_time is more reliable
 * than noisy GPS streams. For longer sessions, use the fastest stream segment.
 */
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

    if (activityCandidate) {
      candidates.push(activityCandidate);
      continue;
    }

    if (streamCandidate) {
      candidates.push(streamCandidate);
    }
  }

  return candidates;
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
