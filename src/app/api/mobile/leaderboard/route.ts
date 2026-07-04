import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";
import { getFriendIds } from "@/lib/friends";
import { startOfIsoWeek, toDateKey, formatDateNb } from "@/lib/date";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStartParam = request.nextUrl.searchParams.get("weekStart");
  const weekStart = weekStartParam ? startOfIsoWeek(new Date(weekStartParam)) : startOfIsoWeek(new Date());

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const prevWeek = new Date(weekStart);
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const friendIds = await getFriendIds(userId);
  const rows = await getWeeklyLeaderboard(weekStart, [userId, ...friendIds]);

  return NextResponse.json({
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(weekEnd),
    weekLabel: `${formatDateNb(weekStart, { day: "numeric", month: "short" })} – ${formatDateNb(new Date(weekEnd.getTime() - 86400000), { day: "numeric", month: "short" })}`,
    prevWeekStart: toDateKey(prevWeek),
    nextWeekStart: toDateKey(nextWeek),
    currentUserId: userId,
    rows,
  });
}
