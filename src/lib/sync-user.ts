import { revalidatePath } from "next/cache";
import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import {
  processAllActivityPeaks,
  resetBestTimesProcessing,
} from "@/lib/peak-efforts/process";
import { revalidateUserCache } from "@/lib/cache/user-data";

/** Ingest activities and recompute CTL/ATL/TSB. */
export async function syncUserFully(userId: string, options?: { full?: boolean }) {
  await syncUserActivities(userId, options);
  await recomputeDailyLoad(userId);
  revalidateUserCache(userId);
}

/** Fast manual sync — activities only. Best times import runs separately. */
export async function syncUserActivitiesQuick(userId: string) {
  await syncUserFully(userId);
  revalidatePath("/peak");
  revalidatePath("/");
}

/** Background: reimport Strava best_efforts (slow, many API calls). */
export async function importBestTimesInBackground(userId: string) {
  await resetBestTimesProcessing(userId);
  await processAllActivityPeaks(userId);
  revalidatePath("/peak");
}

/** Import Strava best_efforts after activity sync. */
export async function syncUserPeaks(userId: string) {
  await processAllActivityPeaks(userId);
  revalidatePath("/peak");
}
