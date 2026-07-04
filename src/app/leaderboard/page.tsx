import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";
import { getFriendIds } from "@/lib/friends";
import { startOfIsoWeek, toDateKey } from "@/lib/date";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeekNav } from "@/components/ui/SegmentedNav";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ weekStart?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { weekStart: weekStartParam } = await searchParams;
  const weekStart = weekStartParam ? new Date(weekStartParam) : startOfIsoWeek(new Date());

  const friendIds = await getFriendIds(session.user.id);
  const rows = await getWeeklyLeaderboard(weekStart, [session.user.id, ...friendIds]);

  const prevWeek = new Date(weekStart);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  return (
    <AppShell userName={session.user.name}>
      <PageHeader
        title="Leaderboard"
        subtitle="Ukentlig duell med venner"
      />

      <div className="flex flex-col gap-4">
        <WeekNav
          prevHref={`/leaderboard?weekStart=${toDateKey(prevWeek)}`}
          nextHref={`/leaderboard?weekStart=${toDateKey(nextWeek)}`}
          label={`${weekStart.toLocaleDateString("nb-NO")} – ${weekEnd.toLocaleDateString("nb-NO")}`}
        />

        <LeaderboardTable rows={rows} currentUserId={session.user.id} />
      </div>
    </AppShell>
  );
}
