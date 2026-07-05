import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { startOfIsoWeek, toDateKey, parseCalendarDateKey, formatDateNb, osloDateKey, osloDayStart, addDaysToKey, osloWeekday } from "@/lib/date";
import { fetchTrainingInsightContext } from "@/lib/training-load/fetch-context";
import { buildHomeCoachNarrative, getTrainingInsight } from "@/lib/training-load/insight";

const PMC_OPTIONS = [30, 90, 180, 365];
const DEFAULT_PMC_DAYS = 90;

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
  return greetings[osloWeekday(new Date())];
}

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = osloDayStart();
  const todayKey = osloDateKey();
  const tomorrowKey = addDaysToKey(todayKey, 1);
  const dayAfterTomorrowKey = addDaysToKey(todayKey, 2);
  const tomorrowStart = parseCalendarDateKey(tomorrowKey);

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get("days"));
  const chartDays = PMC_OPTIONS.includes(daysParam) ? daysParam : DEFAULT_PMC_DAYS;

  const since = new Date(todayStart);
  since.setUTCDate(since.getUTCDate() - chartDays);

  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [user, latestLoad, dailyLoad, weekTssResult, plannedTodayTomorrow, insightContext] = await Promise.all([
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
          lt: parseCalendarDateKey(dayAfterTomorrowKey),
        },
      },
      orderBy: { date: "asc" },
      select: { sport: true, description: true, durationMin: true, date: true },
    }),
    fetchTrainingInsightContext(userId),
  ]);

  const weekTss = weekTssResult._sum.dailyTss ?? 0;
  const coachPreview = insightContext ? getTrainingInsight(insightContext) : null;

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
    coachSummary: insightContext ? buildHomeCoachNarrative(insightContext) : null,
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
