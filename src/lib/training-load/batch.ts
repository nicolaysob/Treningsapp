import { prisma } from "@/lib/db";
import { computeActivityTss } from "./tss";
import { nextAtl, nextCtl, tsb } from "./pmc";

const ACTIVITY_UPDATE_CHUNK = 25;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function buildDailyLoadSeries(
  dailyTssByKey: Map<string, number>,
  firstDay: Date,
  today: Date,
): Array<{
  date: Date;
  dailyTss: number;
  ctl: number;
  atl: number;
  tsb: number;
}> {
  let prevCtl = 0;
  let prevAtl = 0;
  const dailyLoads: Array<{
    date: Date;
    dailyTss: number;
    ctl: number;
    atl: number;
    tsb: number;
  }> = [];

  const cursor = new Date(firstDay);
  while (cursor.getTime() <= today.getTime()) {
    const dailyTss = dailyTssByKey.get(toDateKey(cursor)) ?? 0;

    const ctl = nextCtl(prevCtl, dailyTss);
    const atl = nextAtl(prevAtl, dailyTss);
    const tsbValue = tsb(prevCtl, prevAtl);

    dailyLoads.push({
      date: new Date(cursor),
      dailyTss,
      ctl,
      atl,
      tsb: tsbValue,
    });

    prevCtl = ctl;
    prevAtl = atl;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dailyLoads;
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
      tss: true,
      tssMethod: true,
    },
    orderBy: { date: "asc" },
  });

  if (activities.length === 0) {
    await prisma.dailyLoad.deleteMany({ where: { userId } });
    return;
  }

  const computed = activities.map((activity) => ({
    id: activity.id,
    date: activity.date,
    currentTss: activity.tss,
    currentMethod: activity.tssMethod,
    ...computeActivityTss(activity, user),
  }));

  const dailyTssByKey = new Map<string, number>();
  for (const { date, tss } of computed) {
    if (tss !== null) {
      const key = toDateKey(date);
      dailyTssByKey.set(key, (dailyTssByKey.get(key) ?? 0) + tss);
    }
  }

  const firstDay = startOfUtcDay(activities[0].date);
  const today = startOfUtcDay(new Date());
  const dailyLoads = buildDailyLoadSeries(dailyTssByKey, firstDay, today).map((row) => ({
    userId,
    ...row,
  }));

  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < computed.length; i += ACTIVITY_UPDATE_CHUNK) {
        const chunk = computed.slice(i, i + ACTIVITY_UPDATE_CHUNK);
        await Promise.all(
          chunk
            .filter(
              ({ tss, method, currentTss, currentMethod }) =>
                tss !== currentTss || method !== currentMethod,
            )
            .map(({ id, tss, method }) =>
              tx.activity.update({
                where: { id },
                data: { tss, tssMethod: method },
              }),
            ),
        );
      }

      await tx.dailyLoad.deleteMany({ where: { userId } });
      if (dailyLoads.length > 0) {
        await tx.dailyLoad.createMany({ data: dailyLoads });
      }
    },
    { timeout: 60_000 },
  );
}
