import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserFully, syncUserPeaks } from "@/lib/sync-user";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    await syncUserFully(userId);
    after(async () => {
      await syncUserPeaks(userId);
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync failed", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
