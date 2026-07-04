export interface DistanceSample {
  t: number; // seconds from activity start
  d: number; // cumulative distance in meters
}

/**
 * Shortest elapsed time to cover at least `distanceM` meters, using a
 * sliding start pointer over cumulative distance samples.
 */
export function bestTimeForDistance(samples: DistanceSample[], distanceM: number): number | null {
  if (samples.length < 2 || distanceM <= 0) return null;

  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const totalDistance = sorted[sorted.length - 1].d - sorted[0].d;
  if (totalDistance < distanceM) return null;

  let start = 0;
  let best: number | null = null;

  for (let end = 1; end < sorted.length; end++) {
    while (start < end && sorted[end].d - sorted[start].d >= distanceM) {
      const elapsed = sorted[end].t - sorted[start].t;
      if (elapsed > 0 && (best === null || elapsed < best)) {
        best = elapsed;
      }
      start++;
    }
  }

  return best;
}
