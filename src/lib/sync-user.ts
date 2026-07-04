import { revalidatePath } from "next/cache";
import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { revalidateUserCache } from "@/lib/cache/user-data";

/** Ingest activities and recompute CTL/ATL/TSB. */
export async function syncUserFully(userId: string, options?: { full?: boolean }) {
  await syncUserActivities(userId, options);
  await recomputeDailyLoad(userId);
  revalidateUserCache(userId);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/leaderboard");
}
