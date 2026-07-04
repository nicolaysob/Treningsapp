"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { revalidateUserCache, invalidateUserCache } from "@/lib/cache/user-data";
import {
  parseOptionalInt,
  parsePaceToSeconds,
} from "@/lib/settings-fields";

export async function saveTrainingGoals(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const raceDateRaw = formData.get("raceDate")?.toString();
  const raceName = formData.get("raceName")?.toString().trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      weeklyTssGoal: parseOptionalInt(formData.get("weeklyTssGoal")),
      raceName: raceName || null,
      raceDate: raceDateRaw ? new Date(raceDateRaw) : null,
    },
  });

  invalidateUserCache(session.user.id);
  redirect("/settings/training?saved=goals");
}

export async function saveTrainingThresholds(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ftpWatts: parseOptionalInt(formData.get("ftpWatts")),
      thresholdPaceSecPerKm: parsePaceToSeconds(formData.get("thresholdPaceMinPerKm")),
      hrThresholdBpm: parseOptionalInt(formData.get("hrThresholdBpm")),
    },
  });

  invalidateUserCache(userId);

  after(async () => {
    try {
      await recomputeDailyLoad(userId);
      revalidateUserCache(userId);
    } catch (err) {
      console.error("Background CTL/ATL recompute failed", err);
    }
  });

  redirect("/settings/training?saved=thresholds");
}
