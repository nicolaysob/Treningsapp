import { requireUserId } from "@/lib/auth-session";
import { getFriendIds } from "@/lib/friends";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";
import { startOfIsoWeek, toDateKey, formatDateNb } from "@/lib/date";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeekNav } from "@/components/ui/SegmentedNav";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ weekStart?: string }>;
}) {
  const { userId } = await requireUserId();

  const { weekStart: weekStartParam } = await searchParams;
  const weekStart = weekStartParam ? new Date(weekStartParam) : startOfIsoWeek(new Date());

  const rows = await getWeeklyLeaderboard(weekStart, [userId, ...(await getFriendIds(userId))]);

  const prevWeek = new Date(weekStart);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  return (
    <>
      <PageHeader title="Leaderboard" subtitle="Ukentlig duell med venner" />

      <div className="flex flex-col gap-4">
        <WeekNav
          prevHref={`/leaderboard?weekStart=${toDateKey(prevWeek)}`}
          nextHref={`/leaderboard?weekStart=${toDateKey(nextWeek)}`}
          label={`${formatDateNb(weekStart)} – ${formatDateNb(weekEnd)}`}
        />

        <LeaderboardTable rows={rows} currentUserId={userId} />
      </div>
    </>
  );
}
