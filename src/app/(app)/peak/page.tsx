import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  RUN_DISTANCES_M,
  RIDE_DISTANCES_M,
  DISTANCE_LABELS,
} from "@/lib/peak-efforts/format";
import { BestTimesList } from "@/components/peak/BestTimesList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SegmentedNav } from "@/components/ui/SegmentedNav";

export default async function PeakPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { userId } = await requireUserId();

  const { sport: sportParam } = await searchParams;
  const sport = sportParam === "RUN" ? "RUN" : "RIDE";
  const distances = sport === "RUN" ? RUN_DISTANCES_M : RIDE_DISTANCES_M;

  const rows = await prisma.peakEffort.findMany({
    where: { userId, sport, metric: "time" },
    orderBy: { durationSec: "asc" },
    select: { durationSec: true, value: true, achievedAt: true },
  });

  const byDistance = new Map(rows.map((r) => [r.durationSec, r]));
  const listData = distances.map((distanceM) => {
    const record = byDistance.get(distanceM);
    return {
      distanceM,
      label: DISTANCE_LABELS[distanceM],
      timeSec: record?.value ?? null,
      achievedAt: record?.achievedAt ?? null,
    };
  });

  const hasAny = listData.some((row) => row.timeSec !== null);

  return (
    <>
      <PageHeader title="Beste tider" subtitle="Personlige rekorder på ulike distanser" />

      <div className="flex flex-col gap-4">
        <SegmentedNav
          items={[
            { value: "RIDE", label: "Sykkel" },
            { value: "RUN", label: "Løping" },
          ]}
          activeValue={sport}
          paramName="sport"
          basePath="/peak"
        />

        {!hasAny ? (
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-zinc-500">Ingen tider ennå</p>
              <p className="max-w-sm text-sm text-zinc-600">
                Beste tider beregnes automatisk fra synkede{" "}
                {sport === "RIDE" ? "sykkeløkter" : "løpeøkter"} med GPS-data.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <BestTimesList data={listData} sport={sport} />
          </Card>
        )}
      </div>
    </>
  );
}
