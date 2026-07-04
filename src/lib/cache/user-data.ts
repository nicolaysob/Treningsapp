import { revalidateTag, unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getFriendIds } from "@/lib/friends";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";

const CACHE_SECONDS = 120;

function userTag(userId: string) {
  return `user-${userId}`;
}

export function revalidateUserCache(userId: string) {
  revalidateTag(userTag(userId), "max");
}

export function invalidateUserCache(userId: string) {
  updateTag(userTag(userId));
}

export async function getCachedDailyLoadSeries(userId: string, since: Date) {
  const sinceKey = since.toISOString().slice(0, 10);
  return unstable_cache(
    async () =>
      prisma.dailyLoad.findMany({
        where: { userId, date: { gte: since } },
        orderBy: { date: "asc" },
        select: { date: true, ctl: true, atl: true, tsb: true },
      }),
    ["daily-load-series", userId, sinceKey],
    { revalidate: CACHE_SECONDS, tags: [userTag(userId)] },
  )();
}

export async function getCachedLatestLoad(userId: string) {
  return unstable_cache(
    async () =>
      prisma.dailyLoad.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        select: { ctl: true, atl: true, tsb: true },
      }),
    ["daily-load-latest", userId],
    { revalidate: CACHE_SECONDS, tags: [userTag(userId)] },
  )();
}

export async function getCachedWeeklyLeaderboard(userId: string, weekStart: Date) {
  const weekKey = weekStart.toISOString().slice(0, 10);
  return unstable_cache(
    async () => {
      const friendIds = await getFriendIds(userId);
      return getWeeklyLeaderboard(weekStart, [userId, ...friendIds]);
    },
    ["weekly-leaderboard", userId, weekKey],
    { revalidate: CACHE_SECONDS, tags: [userTag(userId)] },
  )();
}
