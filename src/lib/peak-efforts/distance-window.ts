import type { Sport } from "@prisma/client";

export interface DistanceSample {
  t: number; // moving time in seconds
  d: number; // cumulative distance in meters
}

export function buildMovingDistanceSamples(
  time: number[],
  distance: number[],
  moving?: boolean[],
): DistanceSample[] {
  if (time.length === 0 || distance.length === 0) return [];

  const samples: DistanceSample[] = [];
  let movingClock = 0;
  let maxD = distance[0] ?? 0;

  for (let i = 0; i < time.length; i++) {
    if (i > 0) {
      const dt = time[i] - time[i - 1];
      const isMoving =
        moving && moving[i] !== undefined ? Boolean(moving[i]) : distance[i] > distance[i - 1];
      if (isMoving && dt > 0) movingClock += dt;
    }

    maxD = Math.max(maxD, distance[i] ?? maxD);
    samples.push({ t: movingClock, d: maxD });
  }

  return samples;
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
  return sport === "RUN" ? speed <= 7.5 : speed <= 25;
}

export function bestTimeForDistance(
  samples: DistanceSample[],
  distanceM: number,
  sport: Sport = "RUN",
): number | null {
  if (distanceM <= 0 || samples.length < 2) return null;

  const totalDistance = samples[samples.length - 1].d - samples[0].d;
  if (totalDistance < distanceM) return null;

  let best: number | null = null;

  for (let i = 0; i < samples.length; i++) {
    const start = samples[i];
    const endD = start.d + distanceM;
    const endT = interpolateTime(samples, endD);
    if (endT === null) continue;

    const elapsed = endT - start.t;
    if (!isPlausibleTime(distanceM, elapsed, sport)) continue;
    if (best === null || elapsed < best) best = elapsed;
  }

  return best;
}
