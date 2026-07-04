import Link from "next/link";
import { requireUserId } from "@/lib/auth-session";
import { fetchTrainingInsightContext } from "@/lib/training-load/fetch-context";
import { getCoachReport } from "@/lib/training-load/coach-report";
import { CoachReportView } from "@/components/coach/CoachReport";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function CoachPage() {
  const { userId } = await requireUserId();
  const context = await fetchTrainingInsightContext(userId);

  if (!context) {
    return (
      <>
        <PageHeader title="Coach" subtitle="Gratis treningsanalyse" />
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="text-4xl">✦</div>
          <h2 className="text-lg font-bold text-zinc-100">Ikke nok data ennå</h2>
          <p className="max-w-xs text-sm text-zinc-500">
            Koble til Strava og synk aktiviteter — coach-en analyserer CTL, ATL, TSB og treningsmønster
            ditt automatisk.
          </p>
          <Link
            href="/settings"
            className="rounded-full bg-[#ff6b2b]/15 px-4 py-2 text-sm font-bold text-[#ff8f4c]"
          >
            Gå til Mer → Konto
          </Link>
        </Card>
      </>
    );
  }

  const report = getCoachReport(context);

  return (
    <>
      <PageHeader
        title="Coach"
        subtitle="Gratis analyse · ingen ekstern AI"
      />
      <CoachReportView report={report} />
    </>
  );
}
