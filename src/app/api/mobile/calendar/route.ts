import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { prisma } from "@/lib/db";
import { startOfMonth, getMonthGridDays, toDateKey } from "@/lib/date";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  const monthStart = monthParam ? startOfMonth(new Date(monthParam)) : startOfMonth(new Date());

  const gridDays = getMonthGridDays(monthStart);
  const gridStart = gridDays[0];
  const gridEnd = new Date(gridDays[gridDays.length - 1]);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 1);

  const [activities, planned] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, date: { gte: gridStart, lt: gridEnd } },
      orderBy: { date: "asc" },
      select: { id: true, date: true, sport: true, durationSec: true, tss: true },
    }),
    prisma.plannedWorkout.findMany({
      where: { userId, date: { gte: gridStart, lt: gridEnd } },
      orderBy: { date: "asc" },
      select: { id: true, date: true, sport: true, description: true, durationMin: true },
    }),
  ]);

  const activitiesByDay = new Map<string, typeof activities>();
  for (const activity of activities) {
    const key = toDateKey(activity.date);
    const list = activitiesByDay.get(key);
    if (list) list.push(activity);
    else activitiesByDay.set(key, [activity]);
  }

  const plannedByDay = new Map<string, typeof planned>();
  for (const workout of planned) {
    const key = toDateKey(workout.date);
    const list = plannedByDay.get(key);
    if (list) list.push(workout);
    else plannedByDay.set(key, [workout]);
  }

  const days = gridDays.map((date) => {
    const key = toDateKey(date);
    return {
      key,
      date: date.toISOString(),
      isCurrentMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
      activities: (activitiesByDay.get(key) ?? []).map((a) => ({
        id: a.id,
        sport: a.sport,
        durationSec: a.durationSec,
        tss: a.tss,
      })),
      planned: plannedByDay.get(key) ?? [],
    };
  });

  const prevMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));
  const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));

  return NextResponse.json({
    monthStart: toDateKey(monthStart),
    monthLabel: `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}`,
    todayKey: toDateKey(new Date()),
    prevMonth: toDateKey(prevMonth),
    nextMonth: toDateKey(nextMonth),
    days,
  });
}
