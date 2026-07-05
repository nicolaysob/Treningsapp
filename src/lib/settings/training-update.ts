import { after } from "next/server";
import { prisma } from "@/lib/db";
import { parseCalendarDateKey } from "@/lib/date";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { invalidateActivityZones, syncActivityZones } from "@/lib/strava/sync-zones";
import { revalidateUserCache, invalidateUserCache } from "@/lib/cache/user-data";
import { parsePaceToSeconds } from "@/lib/settings-fields";

export async function updateTrainingGoals(
  userId: string,
  input: { weeklyTssGoal?: number | null; raceName?: string | null; raceDate?: string | null },
): Promise<void> {
  const data: {
    weeklyTssGoal?: number | null;
    raceName?: string | null;
    raceDate?: Date | null;
  } = {};

  if (input.weeklyTssGoal !== undefined) data.weeklyTssGoal = input.weeklyTssGoal;
  if (input.raceName !== undefined) data.raceName = input.raceName?.trim() || null;
  if (input.raceDate !== undefined) {
    data.raceDate = input.raceDate ? parseCalendarDateKey(input.raceDate) : null;
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  invalidateUserCache(userId);
}

export async function updateTrainingThresholds(
  userId: string,
  input: {
    hrMaxBpm?: number | null;
    hrThresholdBpm?: number | null;
    ftpWatts?: number | null;
    thresholdPaceMinPerKm?: string | null;
    thresholdPaceSecPerKm?: number | null;
  },
): Promise<void> {
  const thresholdPaceSecPerKm =
    input.thresholdPaceSecPerKm ??
    (input.thresholdPaceMinPerKm
      ? parsePaceToSeconds(input.thresholdPaceMinPerKm)
      : undefined);

  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { hrMaxBpm: true },
  });

  const data: {
    hrMaxBpm?: number | null;
    ftpWatts?: number | null;
    thresholdPaceSecPerKm?: number | null;
    hrThresholdBpm?: number | null;
  } = {};

  if (input.hrMaxBpm !== undefined) data.hrMaxBpm = input.hrMaxBpm;
  if (input.ftpWatts !== undefined) data.ftpWatts = input.ftpWatts;
  if (input.hrThresholdBpm !== undefined) data.hrThresholdBpm = input.hrThresholdBpm;
  if (thresholdPaceSecPerKm !== undefined) data.thresholdPaceSecPerKm = thresholdPaceSecPerKm;

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  invalidateUserCache(userId);

  const hrMaxBpm = input.hrMaxBpm;
  if (hrMaxBpm !== undefined && hrMaxBpm !== prev?.hrMaxBpm) {
    await invalidateActivityZones(userId);
  }

  after(async () => {
    try {
      await recomputeDailyLoad(userId);
      if (hrMaxBpm) await syncActivityZones(userId);
      revalidateUserCache(userId);
    } catch (err) {
      console.error("Background training settings update failed", err);
    }
  });
}

export async function updateHrMaxQuick(userId: string, hrMaxBpm: number): Promise<boolean> {
  if (!hrMaxBpm || hrMaxBpm < 120 || hrMaxBpm > 230) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { hrMaxBpm },
  });

  invalidateUserCache(userId);
  await invalidateActivityZones(userId);

  after(async () => {
    try {
      await syncActivityZones(userId);
      revalidateUserCache(userId);
    } catch (err) {
      console.error("Background zone sync failed", err);
    }
  });

  return true;
}
