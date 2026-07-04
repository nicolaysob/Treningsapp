import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recomputeDailyLoad } from "@/lib/training-load/batch";

import { revalidateUserCache } from "@/lib/cache/user-data";

export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await recomputeDailyLoad(session.user.id);
  revalidateUserCache(session.user.id);
  return NextResponse.json({ ok: true });
}
