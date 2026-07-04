import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWeeklyLeaderboard } from "@/lib/leaderboard/weekly";
import { getFriendIds } from "@/lib/friends";
import { startOfIsoWeek } from "@/lib/date";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStartParam = request.nextUrl.searchParams.get("weekStart");
  const weekStart = weekStartParam ? new Date(weekStartParam) : startOfIsoWeek(new Date());

  const friendIds = await getFriendIds(session.user.id);
  const rows = await getWeeklyLeaderboard(weekStart, [session.user.id, ...friendIds]);
  return NextResponse.json({ weekStart: weekStart.toISOString(), rows });
}
