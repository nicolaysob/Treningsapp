import { prisma } from "@/lib/db";

export interface WeeklyLeaderboardRow {
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalTss: number;
  totalDurationSec: number;
  longestDurationSec: number;
  totalElevationM: number;
}

export async function getWeeklyLeaderboard(
  weekStart: Date,
  allowedUserIds: string[],
): Promise<WeeklyLeaderboardRow[]> {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const grouped = await prisma.activity.groupBy({
    by: ["userId"],
    where: { date: { gte: weekStart, lt: weekEnd }, userId: { in: allowedUserIds } },
    _sum: { tss: true, durationSec: true, elevationM: true },
    _max: { durationSec: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, name: true, image: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const imageById = new Map(users.map((u) => [u.id, u.image]));

  return grouped
    .map((g) => ({
      userId: g.userId,
      userName: nameById.get(g.userId) ?? "Ukjent",
      userImage: imageById.get(g.userId) ?? null,
      totalTss: g._sum.tss ?? 0,
      totalDurationSec: g._sum.durationSec ?? 0,
      longestDurationSec: g._max.durationSec ?? 0,
      totalElevationM: g._sum.elevationM ?? 0,
    }))
    .sort((a, b) => b.totalTss - a.totalTss);
}
