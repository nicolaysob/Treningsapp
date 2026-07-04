export function estimateHrMaxFromActivities(
  activities: Array<{ avgHr: number | null; durationSec: number }>,
): number | null {
  const candidates = activities
    .filter((a) => a.avgHr !== null && a.durationSec >= 10 * 60)
    .map((a) => a.avgHr as number);

  if (candidates.length === 0) return null;

  const peak = Math.max(...candidates);
  return Math.min(220, Math.round(peak + 8));
}
