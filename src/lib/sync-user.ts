import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { processNewActivityPeaks } from "@/lib/peak-efforts/process";

/** Full per-user sync chain: ingest activities, recompute load, detect peaks. */
export async function syncUserFully(userId: string) {
  await syncUserActivities(userId);
  await recomputeDailyLoad(userId);
  await processNewActivityPeaks(userId);
}
