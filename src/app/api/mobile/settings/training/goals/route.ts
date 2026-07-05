import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { updateTrainingGoals } from "@/lib/settings/training-update";

export async function PATCH(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    weeklyTssGoal?: number | null;
    raceName?: string | null;
    raceDate?: string | null;
  };

  await updateTrainingGoals(userId, body);
  return NextResponse.json({ ok: true });
}
