import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { fetchTrainingInsightContext } from "@/lib/training-load/fetch-context";
import { getCoachReport } from "@/lib/training-load/coach-report";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";
import { fetchWeeklyZoneDistribution } from "@/lib/training-load/fetch-week-zones";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [context, setup, zoneDistribution] = await Promise.all([
    fetchTrainingInsightContext(userId),
    getThresholdSetup(userId),
    fetchWeeklyZoneDistribution(userId).catch(() => null),
  ]);

  if (!context) {
    return NextResponse.json({
      hasData: false,
      setup,
      zoneDistribution: null,
      report: null,
    });
  }

  const report = getCoachReport(context);

  return NextResponse.json({
    hasData: true,
    setup,
    zoneDistribution,
    hrMaxBpm: setup.hrMaxBpm,
    report,
  });
}
