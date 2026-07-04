import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { formatSecondsToPace } from "@/lib/settings-fields";
import { saveTrainingGoals, saveTrainingThresholds } from "@/app/(app)/settings/training/actions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

const SAVED_MESSAGES: Record<string, string> = {
  goals: "Mål lagret.",
  thresholds: "Terskler lagret. CTL/ATL/TSB oppdateres i bakgrunnen.",
};

export default async function TrainingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { userId } = await requireUserId();
  const { saved } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ftpWatts: true,
      thresholdPaceSecPerKm: true,
      hrThresholdBpm: true,
      weeklyTssGoal: true,
      raceName: true,
      raceDate: true,
    },
  });

  if (!user) redirect("/login");

  const thresholdPaceDisplay = user.thresholdPaceSecPerKm
    ? formatSecondsToPace(user.thresholdPaceSecPerKm)
    : "";

  return (
    <>
      <PageHeader
        title="Trening"
        subtitle="Mål og terskler for TSS-beregning"
        backHref="/settings"
      />

      {saved && SAVED_MESSAGES[saved] && <Alert>{SAVED_MESSAGES[saved]}</Alert>}

      <div className="flex flex-col gap-5">
        <Card>
          <form action={saveTrainingGoals} className="flex flex-col gap-4">
            <p className="text-sm font-bold text-zinc-200">Mål</p>
            <Field label="Ukentlig TSS-mål">
              <Input
                type="number"
                name="weeklyTssGoal"
                defaultValue={user.weeklyTssGoal ?? ""}
                min={0}
                placeholder="f.eks. 400"
              />
            </Field>
            <Field label="Løp du trener mot">
              <Input
                type="text"
                name="raceName"
                defaultValue={user.raceName ?? ""}
                placeholder="f.eks. Birkebeinerrittet"
              />
            </Field>
            <Field label="Løpsdato">
              <Input
                type="date"
                name="raceDate"
                defaultValue={user.raceDate ? user.raceDate.toISOString().slice(0, 10) : ""}
              />
            </Field>
            <SubmitButton className="self-start">Lagre mål</SubmitButton>
          </form>
        </Card>

        <Card>
          <form action={saveTrainingThresholds} className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-zinc-200">Terskler</p>
              <p className="mt-0.5 text-xs text-zinc-500">Brukes til TSS-beregning</p>
            </div>
            <Field label="FTP (watt)">
              <Input type="number" name="ftpWatts" defaultValue={user.ftpWatts ?? ""} min={0} />
            </Field>
            <Field label="Terskeltempo (min:sek per km)">
              <Input
                type="text"
                name="thresholdPaceMinPerKm"
                defaultValue={thresholdPaceDisplay}
                placeholder="f.eks. 4:30"
              />
            </Field>
            <Field label="Puls-terskel">
              <Input
                type="number"
                name="hrThresholdBpm"
                defaultValue={user.hrThresholdBpm ?? ""}
                min={0}
                placeholder="Valgfritt"
              />
            </Field>
            <SubmitButton className="self-start">Lagre terskler</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
