import { requireUserId } from "@/lib/auth-session";
import { getBestTimesForUser } from "@/lib/peak-efforts/query";
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

  const listData = await getBestTimesForUser(userId, sport);
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
                Beste tider hentes fra synkede Strava-økter med matchende distanse.
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
