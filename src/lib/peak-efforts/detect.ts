import { prisma } from "@/lib/db";
import { bestRollingAverage, type StreamSample } from "./rolling-window";
import type { Sport } from "@prisma/client";

const DURATIONS_SEC = [5, 60, 300, 1200, 3600];

export type PeakMetric = "power" | "pace";

export interface PeakEffortCandidate {
  durationSec: number;
  metric: PeakMetric;
  value: number; // watts, or pace as sec/km (lower = better)
}

/**
 * Time-based windowing is used for both sports for algorithmic uniformity:
 * cycling windows the watts stream directly; running windows the speed
 * stream and converts the best average speed to a pace (sec/km) afterward.
 */
export function computePeakEffortCandidates(
  sport: Sport,
  streams: { watts: StreamSample[]; speed: StreamSample[] },
): PeakEffortCandidate[] {
  const candidates: PeakEffortCandidate[] = [];

  if (sport === "RIDE" && streams.watts.length > 0) {
    for (const durationSec of DURATIONS_SEC) {
      const best = bestRollingAverage(streams.watts, durationSec);
      if (best !== null) {
        candidates.push({ durationSec, metric: "power", value: best });
      }
    }
  }

  if (sport === "RUN" && streams.speed.length > 0) {
    for (const durationSec of DURATIONS_SEC) {
      const bestSpeed = bestRollingAverage(streams.speed, durationSec);
      if (bestSpeed !== null && bestSpeed > 0) {
        candidates.push({ durationSec, metric: "pace", value: 1000 / bestSpeed });
      }
    }
  }

  return candidates;
}

export interface DetectedPr {
  durationSec: number;
  metric: PeakMetric;
  value: number;
}

/**
 * Compares candidates against the stored "current record" row for each
 * [sport, metric, durationSec] bucket, upserting on improvement. Returns
 * the buckets that got a new PR from this activity.
 */
export async function detectAndStorePeaks(
  userId: string,
  activityId: string,
  sport: Sport,
  achievedAt: Date,
  candidates: PeakEffortCandidate[],
): Promise<DetectedPr[]> {
  const prs: DetectedPr[] = [];

  for (const candidate of candidates) {
    const key = {
      userId_sport_metric_durationSec: {
        userId,
        sport,
        metric: candidate.metric,
        durationSec: candidate.durationSec,
      },
    };

    const existing = await prisma.peakEffort.findUnique({ where: key });

    // Power: higher is better. Pace (sec/km): lower is better.
    const isBetter =
      !existing ||
      (candidate.metric === "power"
        ? candidate.value > existing.value
        : candidate.value < existing.value);

    if (!isBetter) continue;

    await prisma.peakEffort.upsert({
      where: key,
      create: {
        userId,
        sport,
        metric: candidate.metric,
        durationSec: candidate.durationSec,
        value: candidate.value,
        achievedAt,
        activityId,
      },
      update: { value: candidate.value, achievedAt, activityId },
    });

    prs.push({ durationSec: candidate.durationSec, metric: candidate.metric, value: candidate.value });
  }

  return prs;
}
