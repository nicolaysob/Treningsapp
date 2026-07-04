import { after, NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { syncUserFully } from "@/lib/sync-user";

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  after(async () => {
    try {
      await syncUserFully(userId);
    } catch (err) {
      console.error("Background mobile sync failed", err);
    }
  });

  return NextResponse.json({ ok: true, started: true });
}
