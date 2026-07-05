import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { updateHrMaxQuick, updateTrainingThresholds } from "@/lib/settings/training-update";

export async function PATCH(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    hrMaxBpm?: number | null;
    hrThresholdBpm?: number | null;
    ftpWatts?: number | null;
    thresholdPaceMinPerKm?: string | null;
    thresholdPaceSecPerKm?: number | null;
  };

  await updateTrainingThresholds(userId, body);
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { hrMaxBpm?: number };
  const ok = await updateHrMaxQuick(userId, body.hrMaxBpm ?? 0);
  if (!ok) {
    return NextResponse.json({ error: "Makspuls må være mellom 120 og 230" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
