import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = Number(request.nextUrl.searchParams.get("days") ?? 90);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.dailyLoad.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    orderBy: { date: "asc" },
    select: { date: true, ctl: true, atl: true, tsb: true },
  });

  return NextResponse.json(rows);
}
