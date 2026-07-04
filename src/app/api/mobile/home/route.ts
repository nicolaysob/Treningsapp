import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { startOfIsoWeek, toDateKey, parseCalendarDateKey, formatDateNb } from "@/lib/date";
import { createInsightContext, getTrainingInsight } from "@/lib/training-load/insight";

const PMC_OPTIONS = [30, 90, 180, 365];
const DEFAULT_PMC_DAYS = 90;

function utcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getOsloWeekday(): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    weekday: "short",
  }).format(new Date());
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
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
  return greetings[getOsloWeekday()];
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
  const tomorrowKey = toDateKey(tomorrowStart);

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get("days"));
  const chartDays = PMC_OPTIONS.includes(daysParam) ? daysParam : DEFAULT_PMC_DAYS;

  const since = new Date(todayStart);
  since.setUTCDate(since.getUTCDate() - chartDays);

  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [user, latestLoad, dailyLoad, weekTssResult, plannedTodayTomorrow] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, weeklyTssGoal: true, raceName: true, raceDate: true },
    }),
    prisma.dailyLoad.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { ctl: true, atl: true, tsb: true },
    }),
    prisma.dailyLoad.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, ctl: true, atl: true, tsb: true },
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
  const tomorrowWorkouts = plannedTodayTomorrow.filter((p) => toDateKey(p.date) === tomorrowKey);

  const now = new Date();
  const daysToRace = user?.raceDate
    ? Math.ceil((user.raceDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  return NextResponse.json({
    greeting: getWeekdayGreeting(),
    userName: user?.name ?? null,
    latestLoad,
    weekTss,
    weeklyTssGoal: user?.weeklyTssGoal ?? null,
    raceName: user?.raceName ?? null,
    daysToRace,
    coachTitle: coachPreview?.headline ?? null,
    coachSummary: coachPreview?.detail ?? null,
    coachReadiness: coachPreview?.readiness ?? null,
    coachTone: coachPreview?.tone ?? null,
    pmcChart: dailyLoad.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
      ctl: row.ctl,
      atl: row.atl,
      tsb: row.tsb,
    })),
    todayWorkouts: todayWorkouts.map((w) => ({
      sport: w.sport,
      description: w.description,
      durationMin: w.durationMin,
    })),
    tomorrowWorkouts: tomorrowWorkouts.map((w) => ({
      sport: w.sport,
      description: w.description,
      durationMin: w.durationMin,
    })),
    tomorrowLabel: formatDateNb(tomorrowStart, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  });
}
