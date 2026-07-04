import { startOfIsoWeek, toDateKey } from "@/lib/date";
import { prisma } from "@/lib/db";
import type { TrainingInsightContext } from "@/lib/training-load/insight";

export async function fetchTrainingInsightContext(
  userId: string,
): Promise<TrainingInsightContext | null> {
  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

  const insightSince = new Date();
  insightSince.setUTCDate(insightSince.getUTCDate() - 28);
  insightSince.setUTCHours(0, 0, 0, 0);

  const activitySince = new Date();
  activitySince.setUTCDate(activitySince.getUTCDate() - 14);
  activitySince.setUTCHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [latestLoad, insightLoads, recentActivities, upcomingPlanned, user, weekTssResult, prevWeekTssResult] =
    await Promise.all([
      prisma.dailyLoad.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: { ctl: true, atl: true, tsb: true },
      }),
      prisma.dailyLoad.findMany({
        where: { userId, date: { gte: insightSince } },
        orderBy: { date: "asc" },
        select: { date: true, ctl: true, atl: true, tsb: true, dailyTss: true },
      }),
      prisma.activity.findMany({
        where: { userId, date: { gte: activitySince } },
        orderBy: { date: "desc" },
        select: { date: true, sport: true, tss: true, durationSec: true },
      }),
      prisma.plannedWorkout.findMany({
        where: { userId, date: { gte: todayStart } },
        orderBy: { date: "asc" },
        take: 7,
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { weeklyTssGoal: true, raceName: true, raceDate: true },
      }),
      prisma.activity.aggregate({
        where: { userId, date: { gte: weekStart, lt: weekEnd } },
        _sum: { tss: true },
      }),
      prisma.activity.aggregate({
        where: { userId, date: { gte: prevWeekStart, lt: weekStart } },
        _sum: { tss: true },
      }),
    ]);

  if (!latestLoad) return null;

  const now = new Date();
  const daysToRace = user?.raceDate
    ? Math.ceil((user.raceDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    ctl: latestLoad.ctl,
    atl: latestLoad.atl,
    tsb: latestLoad.tsb,
    dailyLoads: insightLoads.map((row) => ({
      date: row.date instanceof Date ? toDateKey(row.date) : String(row.date).slice(0, 10),
      ctl: row.ctl,
      atl: row.atl,
      tsb: row.tsb,
      dailyTss: row.dailyTss,
    })),
    recentActivities: recentActivities.map((a) => ({
      date: a.date instanceof Date ? toDateKey(a.date) : String(a.date).slice(0, 10),
      sport: a.sport,
      tss: a.tss ?? 0,
      durationSec: a.durationSec,
    })),
    weekTss: weekTssResult._sum.tss ?? 0,
    prevWeekTss: prevWeekTssResult._sum.tss ?? 0,
    weeklyTssGoal: user?.weeklyTssGoal ?? null,
    raceName: user?.raceName ?? null,
    daysToRace,
    plannedWorkoutsNext7Days: upcomingPlanned.length,
    dayOfWeek: now.getUTCDay(),
  };
}
