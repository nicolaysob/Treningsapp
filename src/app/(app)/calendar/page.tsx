import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { startOfMonth, getMonthGridDays, toDateKey } from "@/lib/date";
import { MonthView, type MonthDayData } from "@/components/calendar/MonthView";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeekNav } from "@/components/ui/SegmentedNav";
import { Card } from "@/components/ui/Card";

const MONTH_LABELS = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { userId } = await requireUserId();

  const { month: monthParam } = await searchParams;
  const monthStart = monthParam ? startOfMonth(new Date(monthParam)) : startOfMonth(new Date());

  const gridDays = getMonthGridDays(monthStart);
  const gridStart = gridDays[0];
  const gridEnd = new Date(gridDays[gridDays.length - 1]);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 1);

  const [activities, planned] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, date: { gte: gridStart, lt: gridEnd } },
      orderBy: { date: "asc" },
      select: { id: true, date: true, sport: true, durationSec: true },
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

  const days: MonthDayData[] = gridDays.map((date) => {
    const key = toDateKey(date);
    return {
      date,
      key,
      isCurrentMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
      activities: activitiesByDay.get(key) ?? [],
      planned: plannedByDay.get(key) ?? [],
    };
  });

  const prevMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1),
  );
  const nextMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );

  return (
    <>
      <PageHeader
        title="Kalender"
        subtitle="Trykk på en dag for å se økter og planlegge"
      />

      <div className="flex flex-col gap-4">
        <WeekNav
          prevHref={`/calendar?month=${toDateKey(prevMonth)}`}
          nextHref={`/calendar?month=${toDateKey(nextMonth)}`}
          label={`${MONTH_LABELS[monthStart.getUTCMonth()]} ${monthStart.getUTCFullYear()}`}
        />

        <Card padding="lg">
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="cal-dot cal-dot--done" /> Utført plan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="cal-dot cal-dot--planned" /> Planlagt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="cal-dot cal-dot--strava" /> Strava (ikke plan)
            </span>
          </div>
          <MonthView days={days} todayKey={toDateKey(new Date())} />
        </Card>
      </div>
    </>
  );
}
