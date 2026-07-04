import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { processAllActivityPeaks } from "@/lib/peak-efforts/process";
import { revalidateUserCache } from "@/lib/cache/user-data";

/** Ingest activities and recompute CTL/ATL/TSB. */
export async function syncUserFully(userId: string, options?: { full?: boolean }) {
  await syncUserActivities(userId, options);
  await recomputeDailyLoad(userId);
  revalidateUserCache(userId);
}

/** Full Strava history + best-time processing — use for manual sync. */
export async function syncUserFullyWithBestTimes(userId: string) {
  await syncUserFully(userId, { full: true });
  await processAllActivityPeaks(userId);
}

/** Update stored best times from synced activities. */
export async function syncUserPeaks(userId: string) {
  await processAllActivityPeaks(userId);
}
