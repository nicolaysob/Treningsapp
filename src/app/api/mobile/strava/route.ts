import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { disconnectStravaAccount } from "@/lib/strava/link-account";

export async function DELETE(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectStravaAccount(userId);
  return NextResponse.json({ ok: true });
}
