import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { startOfIsoWeek, toDateKey, parseCalendarDateKey } from "@/lib/date";
import { createInsightContext, getTrainingInsight } from "@/lib/training-load/insight";

function utcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getWeekdayGreeting(): string {
  const greetings = [
    "God søndag",
    "God mandag",
    "God tirsdag",
    "God onsdag",
    "God torsdag",
    "God fredag",
    "God lørdag",
  ];
  return greetings[new Date().getDay()];
}

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = utcDayStart(new Date());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const dayAfterTomorrow = new Date(tomorrowStart);
  dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 1);

  const todayKey = toDateKey(todayStart);
  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [user, latestLoad, weekTssResult, plannedTodayTomorrow] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, weeklyTssGoal: true },
    }),
    prisma.dailyLoad.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { ctl: true, atl: true, tsb: true },
    }),
    prisma.dailyLoad.aggregate({
      where: { userId, date: { gte: weekStart, lt: weekEnd } },
      _sum: { dailyTss: true },
    }),
    prisma.plannedWorkout.findMany({
      where: {
        userId,
        date: {
          gte: parseCalendarDateKey(todayKey),
          lt: parseCalendarDateKey(toDateKey(dayAfterTomorrow)),
        },
      },
      orderBy: { date: "asc" },
      select: { sport: true, description: true, durationMin: true, date: true },
    }),
  ]);

  const weekTss = weekTssResult._sum.dailyTss ?? 0;
  const coachPreview = latestLoad
    ? getTrainingInsight(
        createInsightContext({
          ctl: latestLoad.ctl,
          atl: latestLoad.atl,
          tsb: latestLoad.tsb,
        }),
      )
    : null;

  const todayWorkouts = plannedTodayTomorrow.filter((p) => toDateKey(p.date) === todayKey);

  return NextResponse.json({
    greeting: getWeekdayGreeting(),
    userName: user?.name ?? null,
    latestLoad,
    weekTss,
    weeklyTssGoal: user?.weeklyTssGoal ?? null,
    coachTitle: coachPreview?.headline ?? null,
    coachSummary: coachPreview?.detail ?? null,
    todayWorkouts: todayWorkouts.map((w) => ({
      sport: w.sport,
      description: w.description,
      durationMin: w.durationMin,
    })),
  });
}
