import { after, NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, stravaAccount, setup] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        username: true,
        image: true,
        weeklyTssGoal: true,
        ftpWatts: true,
        thresholdPaceSecPerKm: true,
        hrThresholdBpm: true,
        hrMaxBpm: true,
        raceName: true,
        raceDate: true,
      },
    }),
    prisma.account.findFirst({
      where: { userId, provider: "strava" },
      select: { id: true },
    }),
    getThresholdSetup(userId),
  ]);

  return NextResponse.json({
    profile: {
      name: user?.name ?? null,
      username: user?.username ?? null,
      image: user?.image ?? null,
    },
    stravaConnected: Boolean(stravaAccount),
    training: {
      weeklyTssGoal: user?.weeklyTssGoal ?? null,
      ftpWatts: user?.ftpWatts ?? null,
      thresholdPaceSecPerKm: user?.thresholdPaceSecPerKm ?? null,
      hrThresholdBpm: user?.hrThresholdBpm ?? null,
      hrMaxBpm: user?.hrMaxBpm ?? null,
      raceName: user?.raceName ?? null,
      raceDate: user?.raceDate?.toISOString() ?? null,
      method: setup.method,
      isActive: setup.isActive,
      needsHrMaxSetup: setup.needsHrMaxSetup,
      tssCoverage: setup.tssCoverage,
    },
  });
}
