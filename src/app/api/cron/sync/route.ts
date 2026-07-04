import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncUserFully } from "@/lib/sync-user";

export const maxDuration = 300;

/**
 * Hourly sync for all Strava-connected users. Triggered by Vercel Cron;
 * requires CRON_SECRET in Authorization header (set automatically by Vercel).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { provider: "strava" },
    select: { userId: true },
    distinct: ["userId"],
  });

  let synced = 0;
  let failed = 0;

  for (const { userId } of accounts) {
    try {
      await syncUserFully(userId);
      synced++;
    } catch (err) {
      failed++;
      console.error(`Cron sync failed for user ${userId}`, err);
    }
  }

  return NextResponse.json({ ok: true, synced, failed, total: accounts.length });
}
