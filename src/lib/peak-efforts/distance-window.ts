import type { Sport } from "@prisma/client";

export interface DistanceSample {
  t: number; // seconds from activity start
  d: number; // cumulative distance in meters
}

function prepareSamples(samples: DistanceSample[]): DistanceSample[] {
  if (samples.length === 0) return [];

  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const baseT = sorted[0].t;
  const baseD = sorted[0].d;
  let maxD = 0;

  return sorted.map((sample) => {
    maxD = Math.max(maxD, sample.d - baseD);
    return { t: sample.t - baseT, d: maxD };
  });
}

function interpolateTime(samples: DistanceSample[], targetD: number): number | null {
  if (samples.length === 0) return null;
  if (targetD < samples[0].d || targetD > samples[samples.length - 1].d) return null;

  let lo = 0;
  let hi = samples.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (samples[mid].d < targetD) lo = mid + 1;
    else hi = mid;
  }

  if (samples[lo].d === targetD) return samples[lo].t;
  if (lo === 0) return null;

  const prev = samples[lo - 1];
  const next = samples[lo];
  if (next.d <= prev.d) return next.t;

  const ratio = (targetD - prev.d) / (next.d - prev.d);
  return prev.t + ratio * (next.t - prev.t);
}

function isPlausibleTime(distanceM: number, timeSec: number, sport: Sport): boolean {
  if (timeSec <= 0) return false;
  const speed = distanceM / timeSec;
  return sport === "RUN" ? speed <= 7 : speed <= 30;
}

/**
 * Shortest elapsed time to cover exactly `distanceM` meters, interpolating
 * between GPS samples and using monotonic cumulative distance.
 */
export function bestTimeForDistance(
  samples: DistanceSample[],
  distanceM: number,
  sport: Sport = "RUN",
): number | null {
  if (distanceM <= 0) return null;

  const prepared = prepareSamples(samples);
  if (prepared.length < 2) return null;

  const totalDistance = prepared[prepared.length - 1].d;
  if (totalDistance < distanceM) return null;

  let best: number | null = null;

  for (let i = 0; i < prepared.length; i++) {
    const start = prepared[i];
    const endD = start.d + distanceM;
    const endT = interpolateTime(prepared, endD);
    if (endT === null) continue;

    const elapsed = endT - start.t;
    if (!isPlausibleTime(distanceM, elapsed, sport)) continue;
    if (best === null || elapsed < best) best = elapsed;
  }

  return best;
}
