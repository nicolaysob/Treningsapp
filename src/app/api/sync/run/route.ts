import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserActivitiesQuick, importBestTimesInBackground } from "@/lib/sync-user";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await syncUserActivitiesQuick(userId);

    after(async () => {
      try {
        await importBestTimesInBackground(userId);
      } catch (err) {
        console.error("Background best-times import failed", err);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
