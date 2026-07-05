import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { syncUserFully } from "@/lib/sync-user";

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stravaAccount = await prisma.account.findFirst({
    where: { userId, provider: "strava" },
    select: { id: true },
  });

  if (!stravaAccount) {
    return NextResponse.json({ error: "Strava er ikke koblet til" }, { status: 400 });
  }

  try {
    const { processed } = await syncUserFully(userId);
    return NextResponse.json({ ok: true, processed });
  } catch (err) {
    console.error("Mobile sync failed", err);
    const message = err instanceof Error ? err.message : "Synk feilet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
