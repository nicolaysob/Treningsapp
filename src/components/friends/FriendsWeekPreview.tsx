import Link from "next/link";
import { Podium } from "@/components/leaderboard/Podium";
import type { WeeklyLeaderboardRow } from "@/lib/leaderboard/weekly";

export function FriendsWeekPreview({
  rows,
  currentUserId,
}: {
  rows: WeeklyLeaderboardRow[];
  currentUserId: string;
}) {
  const activeRows = rows.filter((r) => r.totalTss > 0);
  if (activeRows.length === 0) return null;

  return (
    <section className="surface-card animate-in overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">Denne uken</h2>
          <p className="text-xs text-zinc-500">Hvem leder duellen?</p>
        </div>
        <Link
          href="/leaderboard"
          className="text-xs font-semibold text-[#ff8f4c] transition-colors hover:text-[#ff6b2b]"
        >
          Se alt →
        </Link>
      </div>
      <Podium rows={activeRows} currentUserId={currentUserId} />
    </section>
  );
}
