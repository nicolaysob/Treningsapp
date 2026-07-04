import { prisma } from "@/lib/db";
import { computeActivityTss } from "./tss";
import { nextAtl, nextCtl, tsb } from "./pmc";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Recomputes TSS for every activity (using the user's current thresholds)
 * and rebuilds the full DailyLoad history from scratch. Always doing a full
 * recompute rather than an incremental update is deliberate: the data
 * volume here is tiny, and it eliminates drift bugs and lets retroactive
 * edits (e.g. changing FTP) self-heal on the next call.
 */
export async function recomputeDailyLoad(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { ftpWatts: true, thresholdPaceSecPerKm: true, hrThresholdBpm: true },
  });

  const activities = await prisma.activity.findMany({
    where: { userId },
    select: {
      id: true,
      date: true,
      sport: true,
      durationSec: true,
      npWatts: true,
      avgWatts: true,
      avgHr: true,
      avgPaceSecPerKm: true,
    },
    orderBy: { date: "asc" },
  });

  if (activities.length === 0) return;

  const dailyTssByKey = new Map<string, number>();

  for (const activity of activities) {
    const { tss, method } = computeActivityTss(activity, user);

    await prisma.activity.update({
      where: { id: activity.id },
      data: { tss, tssMethod: method },
    });

    if (tss !== null) {
      const key = toDateKey(activity.date);
      dailyTssByKey.set(key, (dailyTssByKey.get(key) ?? 0) + tss);
    }
  }

  const firstDay = startOfUtcDay(activities[0].date);
  const today = startOfUtcDay(new Date());

  let prevCtl = 0;
  let prevAtl = 0;

  const cursor = new Date(firstDay);
  while (cursor.getTime() <= today.getTime()) {
    const dailyTss = dailyTssByKey.get(toDateKey(cursor)) ?? 0;

    const ctl = nextCtl(prevCtl, dailyTss);
    const atl = nextAtl(prevAtl, dailyTss);
    const tsbValue = tsb(prevCtl, prevAtl);

    await prisma.dailyLoad.upsert({
      where: { userId_date: { userId, date: new Date(cursor) } },
      create: { userId, date: new Date(cursor), dailyTss, ctl, atl, tsb: tsbValue },
      update: { dailyTss, ctl, atl, tsb: tsbValue },
    });

    prevCtl = ctl;
    prevAtl = atl;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}
