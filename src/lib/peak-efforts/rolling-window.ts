export interface StreamSample {
  t: number; // seconds from activity start
  v: number; // watts or speed (m/s)
}

/**
 * Best average value over a window of durationSec, using an O(n) sliding
 * window sum. Handles non-uniform sample intervals by tracking actual time
 * coverage rather than assuming 1 sample/sec.
 */
export function bestRollingAverage(samples: StreamSample[], durationSec: number): number | null {
  if (samples.length === 0) return null;

  const sorted = [...samples].sort((a, b) => a.t - b.t);
  const totalSpan = sorted[sorted.length - 1].t - sorted[0].t;
  if (totalSpan < durationSec) return null;

  let windowStart = 0;
  let windowSum = 0;
  let best: number | null = null;

  for (let i = 0; i < sorted.length; i++) {
    windowSum += sorted[i].v;

    // Keep the window strictly under durationSec wide so it stays a tight
    // "N-second window", not a wider one that dilutes a short peak with
    // older, lower-value samples still technically inside a laxer bound.
    while (sorted[i].t - sorted[windowStart].t >= durationSec) {
      windowSum -= sorted[windowStart].v;
      windowStart++;
    }

    const windowCount = i - windowStart + 1;
    const windowSpan = sorted[i].t - sorted[windowStart].t;

    // Only consider windows that actually cover close to the target
    // duration — guards against sparse/gappy streams producing false peaks.
    if (windowSpan >= durationSec - 1) {
      const avg = windowSum / windowCount;
      if (best === null || avg > best) best = avg;
    }
  }

  return best;
}
