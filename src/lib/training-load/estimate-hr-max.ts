export function estimateHrMaxFromPeak(peakAvgHr: number): number {
  return Math.min(220, Math.round(peakAvgHr + 8));
}

/** @deprecated Use estimateHrMaxFromPeak — kept for tests */
export function estimateHrMaxFromActivities(
  activities: Array<{ avgHr: number | null; durationSec: number }>,
): number | null {
  const candidates = activities
    .filter((a) => a.avgHr !== null && a.durationSec >= 10 * 60)
    .map((a) => a.avgHr as number);

  if (candidates.length === 0) return null;

  return estimateHrMaxFromPeak(Math.max(...candidates));
}
