import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserFully, continueBestTimesImport } from "@/lib/sync-user";
import { resetBestTimesProcessing, processNewActivityPeaks } from "@/lib/peak-efforts/process";
import { revalidatePath } from "next/cache";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await syncUserFully(userId, { full: true });
    await resetBestTimesProcessing(userId);
    await processNewActivityPeaks(userId);
    revalidatePath("/peak");
    after(async () => {
      await continueBestTimesImport(userId);
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
