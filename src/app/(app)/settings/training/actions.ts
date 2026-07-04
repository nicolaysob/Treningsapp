"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import { invalidateActivityZones, syncActivityZones } from "@/lib/strava/sync-zones";
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
  const hrMaxBpm = parseOptionalInt(formData.get("hrMaxBpm"));

  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { hrMaxBpm: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      hrMaxBpm,
      ftpWatts: parseOptionalInt(formData.get("ftpWatts")),
      thresholdPaceSecPerKm: parsePaceToSeconds(formData.get("thresholdPaceMinPerKm")),
      hrThresholdBpm: parseOptionalInt(formData.get("hrThresholdBpm")),
    },
  });

  invalidateUserCache(userId);

  if (hrMaxBpm !== prev?.hrMaxBpm) {
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

  redirect("/settings/training?saved=thresholds");
}

export async function saveHrMaxQuick(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const hrMax = parseOptionalInt(formData.get("hrMaxBpm"));
  if (!hrMax || hrMax < 120 || hrMax > 230) {
    redirect("/settings/training?error=hr");
  }

  const userId = session.user.id;
  const returnTo = formData.get("returnTo")?.toString();
  const safeReturn =
    returnTo && (returnTo === "/coach" || returnTo === "/" || returnTo.startsWith("/settings"))
      ? returnTo
      : "/settings/training";

  await prisma.user.update({
    where: { id: userId },
    data: { hrMaxBpm: hrMax },
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

  const separator = safeReturn.includes("?") ? "&" : "?";
  redirect(`${safeReturn}${separator}saved=hr`);
}
