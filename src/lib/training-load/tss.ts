import type { Sport } from "@prisma/client";

export type TssMethod = "power" | "hr" | "pace";

export function computePowerTss({
  durationSec,
  npWatts,
  ftpWatts,
}: {
  durationSec: number;
  npWatts: number;
  ftpWatts: number;
}): number {
  const intensityFactor = npWatts / ftpWatts;
  return ((durationSec * npWatts * intensityFactor) / (ftpWatts * 3600)) * 100;
}

export function computeHrTss({
  durationSec,
  avgHr,
  hrThresholdBpm,
}: {
  durationSec: number;
  avgHr: number;
  hrThresholdBpm: number;
}): number {
  const hrIntensityFactor = avgHr / hrThresholdBpm;
  return ((durationSec * hrIntensityFactor ** 2) / 3600) * 100;
}

export function computeRunningTss({
  durationSec,
  avgPaceSecPerKm,
  thresholdPaceSecPerKm,
}: {
  durationSec: number;
  avgPaceSecPerKm: number;
  thresholdPaceSecPerKm: number;
}): number {
  // Faster pace = smaller sec/km = higher intensity factor.
  const paceIntensityFactor = thresholdPaceSecPerKm / avgPaceSecPerKm;
  return ((durationSec * paceIntensityFactor ** 2) / 3600) * 100;
}

export interface ActivityForTss {
  sport: Sport;
  durationSec: number;
  npWatts: number | null;
  avgWatts: number | null;
  avgHr: number | null;
  avgPaceSecPerKm: number | null;
}

export interface UserThresholds {
  ftpWatts: number | null;
  thresholdPaceSecPerKm: number | null;
  hrThresholdBpm: number | null;
}

export interface TssResult {
  tss: number | null;
  method: TssMethod | null;
}

/**
 * Picks the best available method per sport + data availability. Never
 * silently falls back to 0 when no threshold is set — a null TSS tells the
 * UI to prompt the user to set their FTP/threshold rather than corrupting
 * CTL/ATL with a fake zero.
 */
export function computeActivityTss(
  activity: ActivityForTss,
  thresholds: UserThresholds,
): TssResult {
  const power = activity.npWatts ?? activity.avgWatts;

  if (activity.sport === "RIDE" && thresholds.ftpWatts && power) {
    return {
      tss: computePowerTss({
        durationSec: activity.durationSec,
        npWatts: power,
        ftpWatts: thresholds.ftpWatts,
      }),
      method: "power",
    };
  }

  if (
    activity.sport === "RUN" &&
    thresholds.thresholdPaceSecPerKm &&
    activity.avgPaceSecPerKm
  ) {
    return {
      tss: computeRunningTss({
        durationSec: activity.durationSec,
        avgPaceSecPerKm: activity.avgPaceSecPerKm,
        thresholdPaceSecPerKm: thresholds.thresholdPaceSecPerKm,
      }),
      method: "pace",
    };
  }

  if (thresholds.hrThresholdBpm && activity.avgHr) {
    return {
      tss: computeHrTss({
        durationSec: activity.durationSec,
        avgHr: activity.avgHr,
        hrThresholdBpm: thresholds.hrThresholdBpm,
      }),
      method: "hr",
    };
  }

  return { tss: null, method: null };
}
