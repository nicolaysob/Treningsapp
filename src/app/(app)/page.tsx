import Link from "next/link";
import type { PlannedWorkout } from "@prisma/client";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { deletePlannedWorkout } from "@/app/(app)/calendar/actions";
import { startOfIsoWeek, formatDateNb, toDateKey, parseCalendarDateKey } from "@/lib/date";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";
import { PmcChartLazy } from "@/components/pmc/PmcChartLazy";
import { TsbGauge } from "@/components/pmc/TsbGauge";
import { CoachTeaser } from "@/components/coach/CoachReport";
import { ThresholdQuickSetup } from "@/components/settings/ThresholdQuickSetup";
import { createInsightContext, getTrainingInsight } from "@/lib/training-load/insight";
import { Card, CardHeader } from "@/components/ui/Card";
import { BentoStat } from "@/components/ui/BentoStat";
import { SegmentedNav } from "@/components/ui/SegmentedNav";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORT_ICONS: Record<string, string> = {
  RIDE: "🚴",
  RUN: "🏃",
  SWIM: "🏊",
  STRENGTH: "💪",
  OTHER: "⚡",
};

const PERIOD_OPTIONS = [30, 90, 180, 365];
const DEFAULT_DAYS = 90;

function utcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function PlannedWorkoutRows({ workouts }: { workouts: PlannedWorkout[] }) {
  if (workouts.length === 0) {
    return <p className="text-sm text-zinc-500">Ingen økter</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {workouts.map((p) => (
        <div
          key={p.id}
          className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/2 px-3.5 py-3 transition-colors hover:border-white/10 hover:bg-white/4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-lg leading-none">{SPORT_ICONS[p.sport] ?? "⚡"}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-100">
                {SPORT_LABELS[p.sport] ?? p.sport}
              </p>
              <p className="truncate text-xs text-zinc-500">{p.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-xs font-bold text-zinc-400">
              {p.durationMin}m
            </span>
            <form action={deletePlannedWorkout}>
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-400"
                aria-label="Slett"
              >
                ×
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

function getWeekdayGreeting(): string {
  const day = new Date().getDay();
  const greetings = [
    "God søndag",
    "God mandag",
    "God tirsdag",
    "God onsdag",
    "God torsdag",
    "God fredag",
    "God lørdag",
  ];
  return greetings[day];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; saved?: string }>;
}) {
  const { userId, userName } = await requireUserId();
  const { days: daysParam, saved } = await searchParams;
  const days = PERIOD_OPTIONS.includes(Number(daysParam)) ? Number(daysParam) : DEFAULT_DAYS;

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const todayStart = utcDayStart(new Date());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const dayAfterTomorrow = new Date(tomorrowStart);
  dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 1);

  const todayKey = toDateKey(todayStart);
  const tomorrowKey = toDateKey(tomorrowStart);

  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [dailyLoad, latestLoad, plannedTodayTomorrow, user, weekTssResult, setup] = await Promise.all([
    prisma.dailyLoad.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, ctl: true, atl: true, tsb: true },
    }),
    prisma.dailyLoad.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { ctl: true, atl: true, tsb: true },
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
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyTssGoal: true, raceName: true, raceDate: true },
    }),
    prisma.activity.aggregate({
      where: { userId, date: { gte: weekStart, lt: weekEnd } },
      _sum: { tss: true },
    }),
    getThresholdSetup(userId),
  ]);

  const todayPlanned = plannedTodayTomorrow.filter((p) => toDateKey(p.date) === todayKey);
  const tomorrowPlanned = plannedTodayTomorrow.filter((p) => toDateKey(p.date) === tomorrowKey);

  const chartData = dailyLoad.map((row) => ({
    date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
    ctl: row.ctl,
    atl: row.atl,
    tsb: row.tsb,
  }));

  const weekTss = weekTssResult._sum.tss ?? 0;

  const now = new Date();
  const daysToRace = user?.raceDate
    ? Math.ceil((user.raceDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  const coachPreview = latestLoad
    ? getTrainingInsight(
        createInsightContext({
          ctl: latestLoad.ctl,
          atl: latestLoad.atl,
          tsb: latestLoad.tsb,
        }),
      )
    : null;

  const firstName = userName?.split(" ")[0] ?? "deg";

  return (
    <div className="flex flex-col gap-5">
        {saved === "hr" && (
          <p className="text-center text-sm font-semibold text-emerald-400">Makspuls aktivert</p>
        )}
        <div className="hero-card animate-in flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="relative z-10 min-w-0">
            <p className="section-label text-orange-400/80">{getWeekdayGreeting()}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {firstName}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {latestLoad
                ? `Fitness ${latestLoad.ctl.toFixed(0)} · Fatigue ${latestLoad.atl.toFixed(0)}`
                : setup.needsHrMaxSetup
                  ? "Sett makspuls"
                  : "Synk Strava"}
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <TsbGauge tsb={latestLoad?.tsb ?? null} />
          </div>
        </div>

        {latestLoad && (
          <div className="animate-in animate-in-delay-1 grid grid-cols-3 gap-2.5 sm:gap-3">
            <BentoStat label="Fitness" value={latestLoad.ctl.toFixed(0)} unit="CTL" variant="blue" />
            <BentoStat label="Fatigue" value={latestLoad.atl.toFixed(0)} unit="ATL" variant="orange" />
            <BentoStat label="Uke" value={weekTss.toFixed(0)} unit="TSS" variant="green" />
          </div>
        )}

        {setup.needsHrMaxSetup && (
          <ThresholdQuickSetup setup={setup} compact returnTo="/" />
        )}

        {coachPreview && (
          <CoachTeaser readiness={coachPreview.readiness} headline={coachPreview.headline} />
        )}

        {(user?.weeklyTssGoal || user?.raceName) && (
          <Card className="animate-in animate-in-delay-3 !p-4">
            <CardHeader title="Mål" />
            {user.weeklyTssGoal ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Ukentlig TSS</span>
                  <span className="font-mono font-bold tabular-nums text-zinc-200">
                    {weekTss.toFixed(0)}
                    <span className="font-normal text-zinc-600"> / {user.weeklyTssGoal}</span>
                  </span>
                </div>
                <AnimatedProgress percent={Math.min(100, (weekTss / user.weeklyTssGoal) * 100)} />
              </div>
            ) : null}
            {user.raceName && daysToRace !== null ? (
              <div className={`flex items-baseline gap-2 ${user.weeklyTssGoal ? "mt-4" : ""}`}>
                <span className="font-mono text-4xl font-extrabold tabular-nums text-[#ff6b2b]">
                  {daysToRace}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-300">
                    {daysToRace === 1 ? "dag igjen" : "dager igjen"}
                  </p>
                  <p className="text-xs text-zinc-500">{user.raceName}</p>
                </div>
              </div>
            ) : null}
          </Card>
        )}

        <Card className="animate-in animate-in-delay-4">
          <CardHeader
            title="Treningsbelastning"
            subtitle="Performance Management Chart"
            action={
              <SegmentedNav
                items={PERIOD_OPTIONS.map((d) => ({ value: String(d), label: `${d}d` }))}
                activeValue={String(days)}
                paramName="days"
                basePath="/"
              />
            }
          />
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/4 text-2xl">
                📊
              </div>
              <p className="font-semibold text-zinc-400">Ingen data ennå</p>
              <p className="max-w-xs text-sm text-zinc-600">
                Koble til Strava og sett FTP/terskeltempo for å se PMC-grafen din.
              </p>
              <Link
                href="/settings"
                className="mt-1 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold text-zinc-300 ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                Gå til innstillinger
              </Link>
            </div>
          ) : (
            <PmcChartLazy data={chartData} />
          )}
        </Card>

        <Card className="animate-in animate-in-delay-5">
          <CardHeader
            title="Økter"
            action={
              <Link
                href="/calendar"
                className="text-xs font-semibold text-[#ff6b2b] hover:text-[#ff8f4c]"
              >
                Kalender →
              </Link>
            }
          />
          {todayPlanned.length === 0 && tomorrowPlanned.length === 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-zinc-800 px-4 py-5">
              <p className="text-sm text-zinc-500">Ingen økter i dag eller i morgen</p>
              <Link
                href="/calendar"
                className="rounded-full bg-[#ff6b2b]/15 px-3 py-1.5 text-xs font-bold text-[#ff8f4c]"
              >
                + Legg til
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <section>
                <h3 className="section-label mb-2.5">Dagens økter</h3>
                <PlannedWorkoutRows workouts={todayPlanned} />
              </section>
              <section>
                <h3 className="section-label mb-2.5">
                  I morgen ·{" "}
                  {formatDateNb(tomorrowStart, { weekday: "short", day: "numeric", month: "short" })}
                </h3>
                <PlannedWorkoutRows workouts={tomorrowPlanned} />
              </section>
            </div>
          )}
        </Card>
      </div>
  );
}
