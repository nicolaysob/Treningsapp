import { revalidatePath } from "next/cache";
import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import {
  processAllActivityPeaks,
  processNewActivityPeaks,
  resetBestTimesProcessing,
} from "@/lib/peak-efforts/process";
import { revalidateUserCache } from "@/lib/cache/user-data";

/** Ingest activities and recompute CTL/ATL/TSB. */
export async function syncUserFully(userId: string, options?: { full?: boolean }) {
  await syncUserActivities(userId, options);
  await recomputeDailyLoad(userId);
  revalidateUserCache(userId);
}

/** Manual sync: full history, reset + import Strava best efforts. */
export async function syncUserFullyWithBestTimes(userId: string) {
  await syncUserFully(userId, { full: true });
  await resetBestTimesProcessing(userId);
  await processNewActivityPeaks(userId);
  revalidatePath("/peak");
}

/** Continue importing best efforts in background after manual sync. */
export async function continueBestTimesImport(userId: string) {
  await processAllActivityPeaks(userId);
  revalidatePath("/peak");
}

/** Import Strava best_efforts after activity sync. */
export async function syncUserPeaks(userId: string) {
  await processAllActivityPeaks(userId);
  revalidatePath("/peak");
}
