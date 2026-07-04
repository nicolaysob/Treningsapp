export interface PowerSample {
  timestampSec: number;
  watts: number;
}

/**
 * Standard Coggan normalized power: 30s rolling average of the watt stream,
 * then the 4th-power mean of those rolling averages, then the 4th root.
 * Only needed when computing peak curves from raw streams — during regular
 * sync, Strava's own weighted_average_watts is used directly as NP.
 */
export function computeNormalizedPower(samples: PowerSample[]): number | null {
  if (samples.length === 0) return null;

  const sorted = [...samples].sort((a, b) => a.timestampSec - b.timestampSec);
  const windowSec = 30;
  const rollingAverages: number[] = [];

  let windowStart = 0;
  let windowSum = 0;
  let windowCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    windowSum += sorted[i].watts;
    windowCount++;

    while (sorted[i].timestampSec - sorted[windowStart].timestampSec >= windowSec) {
      windowSum -= sorted[windowStart].watts;
      windowCount--;
      windowStart++;
    }

    rollingAverages.push(windowSum / windowCount);
  }

  const meanFourthPower =
    rollingAverages.reduce((sum, v) => sum + v ** 4, 0) / rollingAverages.length;

  return Math.pow(meanFourthPower, 0.25);
}
