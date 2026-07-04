import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recomputeDailyLoad } from "@/lib/training-load/batch";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await recomputeDailyLoad(session.user.id);
  return NextResponse.json({ ok: true });
}
