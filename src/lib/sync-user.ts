import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { processNewActivityPeaks } from "@/lib/peak-efforts/process";
import { revalidateUserCache } from "@/lib/cache/user-data";

/** Ingest activities and recompute CTL/ATL/TSB. */
export async function syncUserFully(userId: string) {
  await syncUserActivities(userId);
  await recomputeDailyLoad(userId);
  revalidateUserCache(userId);
}

/** Update stored best times from synced activities — run after activity sync. */
export async function syncUserPeaks(userId: string) {
  await processNewActivityPeaks(userId);
}
