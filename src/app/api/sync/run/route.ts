import { after, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserFully } from "@/lib/sync-user";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Strava-synk kan ta lang tid — kjør i bakgrunnen så mobilen ikke tidsavbryter.
  after(async () => {
    try {
      await syncUserFully(userId);
    } catch (err) {
      console.error("Background sync failed", err);
    }
  });

  return NextResponse.json({ ok: true, started: true });
}
