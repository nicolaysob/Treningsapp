import { prisma } from "@/lib/db";
import {
  pickBestTimesFromActivities,
  type BestTimeRecord,
} from "./best-times";
import type { Sport } from "@prisma/client";

export async function getBestTimesForUser(
  userId: string,
  sport: Sport,
): Promise<BestTimeRecord[]> {
  const activities = await prisma.activity.findMany({
    where: { userId, sport, distanceM: { not: null } },
    select: { durationSec: true, distanceM: true, date: true },
    orderBy: { date: "desc" },
  });

  return pickBestTimesFromActivities(sport, activities);
}
