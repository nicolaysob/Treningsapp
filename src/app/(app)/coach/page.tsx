import Link from "next/link";
import { requireUserId } from "@/lib/auth-session";
import { fetchTrainingInsightContext } from "@/lib/training-load/fetch-context";
import { getCoachReport } from "@/lib/training-load/coach-report";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";
import { CoachReportView } from "@/components/coach/CoachReport";
import { ZoneDistributionChart } from "@/components/coach/ZoneDistributionChart";
import { ThresholdQuickSetup } from "@/components/settings/ThresholdQuickSetup";
import { fetchWeeklyZoneDistribution } from "@/lib/training-load/fetch-week-zones";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { userId } = await requireUserId();
  const { saved } = await searchParams;
  const [context, setup, zoneDistribution] = await Promise.all([
    fetchTrainingInsightContext(userId),
    getThresholdSetup(userId),
    fetchWeeklyZoneDistribution(userId),
  ]);

  if (!context) {
    return (
      <>
        <PageHeader title="Coach" />
        {saved === "hr" && (
          <p className="mb-3 text-center text-sm font-semibold text-emerald-400">Makspuls aktivert</p>
        )}
        {zoneDistribution && (
          <div className="mb-4">
            <ZoneDistributionChart distribution={zoneDistribution} />
          </div>
        )}
        {setup.needsHrMaxSetup ? (
          <Card className="flex flex-col gap-4 py-6">
            <ThresholdQuickSetup setup={setup} />
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="text-4xl">✦</div>
            <h2 className="text-lg font-bold text-zinc-100">Ikke nok data</h2>
            <Link
              href="/settings"
              className="rounded-full bg-[#ff6b2b]/15 px-4 py-2 text-sm font-bold text-[#ff8f4c]"
            >
              Koble Strava →
            </Link>
          </Card>
        )}
      </>
    );
  }

  const report = getCoachReport(context);

  return (
    <>
      <PageHeader title="Coach" />
      {saved === "hr" && (
        <p className="mb-3 text-center text-sm font-semibold text-emerald-400">Makspuls aktivert</p>
      )}
      {setup.needsHrMaxSetup && (
        <div className="mb-4">
          <ThresholdQuickSetup setup={setup} compact returnTo="/coach" />
        </div>
      )}
      {zoneDistribution && <ZoneDistributionChart distribution={zoneDistribution} />}
      <CoachReportView report={report} />
    </>
  );
}
