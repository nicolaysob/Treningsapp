import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserActivities } from "@/lib/strava/sync";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { processNewActivityPeaks } from "@/lib/peak-efforts/process";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncUserActivities(session.user.id);
    await recomputeDailyLoad(session.user.id);
    const peaks = await processNewActivityPeaks(session.user.id);
    return NextResponse.json({ ...result, newRecords: peaks.newRecords });
  } catch (err) {
    console.error("Sync failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
