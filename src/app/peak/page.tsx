import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PEAK_DURATIONS_SEC, DURATION_LABELS } from "@/lib/peak-efforts/format";
import { PeakCurveChart } from "@/components/peak/PeakCurveChart";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SegmentedNav } from "@/components/ui/SegmentedNav";

export default async function PeakPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { sport: sportParam } = await searchParams;
  const sport = sportParam === "RUN" ? "RUN" : "RIDE";
  const metric = sport === "RIDE" ? "power" : "pace";

  const rows = await prisma.peakEffort.findMany({
    where: { userId: session.user.id, sport, metric },
    orderBy: { durationSec: "asc" },
  });

  const byDuration = new Map(rows.map((r) => [r.durationSec, r.value]));
  const chartData = PEAK_DURATIONS_SEC.map((durationSec) => ({
    durationSec,
    label: DURATION_LABELS[durationSec],
    value: byDuration.get(durationSec) ?? null,
  }));

  return (
    <AppShell userName={session.user.name}>
      <PageHeader
        title="Peak-kurver"
        subtitle="Dine beste effekter over ulike varigheter"
      />

      <div className="flex flex-col gap-4">
        <SegmentedNav
          items={[
            { value: "RIDE", label: "Sykkel (watt)" },
            { value: "RUN", label: "Løping (pace)" },
          ]}
          activeValue={sport}
          paramName="sport"
          basePath="/peak"
        />

        {rows.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-zinc-500">Ingen data ennå</p>
              <p className="max-w-sm text-sm text-zinc-600">
                Peak-effekter beregnes automatisk fra nye synkede{" "}
                {sport === "RIDE" ? "sykkeløkter" : "løpeøkter"}.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <PeakCurveChart data={chartData} metric={metric} />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
