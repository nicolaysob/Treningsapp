import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { formatSecondsToPace } from "@/lib/settings-fields";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";
import { saveTrainingGoals, saveTrainingThresholds } from "@/app/(app)/settings/training/actions";
import {
  ThresholdQuickSetup,
  ThresholdStatusChip,
} from "@/components/settings/ThresholdQuickSetup";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

const SAVED_MESSAGES: Record<string, string> = {
  goals: "Lagret",
  thresholds: "Lagret",
  hr: "Makspuls aktivert",
};

export default async function TrainingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { userId } = await requireUserId();
  const { saved, error } = await searchParams;

  const [user, setup] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        ftpWatts: true,
        thresholdPaceSecPerKm: true,
        hrThresholdBpm: true,
        hrMaxBpm: true,
        weeklyTssGoal: true,
        raceName: true,
        raceDate: true,
      },
    }),
    getThresholdSetup(userId),
  ]);

  if (!user) redirect("/login");

  const thresholdPaceDisplay = user.thresholdPaceSecPerKm
    ? formatSecondsToPace(user.thresholdPaceSecPerKm)
    : "";

  return (
    <>
      <PageHeader title="Trening" subtitle="Mål og terskler" backHref="/settings" />

      <div className="mb-4">
        <ThresholdStatusChip setup={setup} />
      </div>

      {saved && SAVED_MESSAGES[saved] && <Alert>{SAVED_MESSAGES[saved]}</Alert>}
      {error === "hr" && <Alert>Ugyldig makspuls</Alert>}

      <div className="flex flex-col gap-5">
        {setup.needsHrMaxSetup && (
          <Card>
            <ThresholdQuickSetup setup={setup} />
          </Card>
        )}

        <Card>
          <form action={saveTrainingGoals} className="flex flex-col gap-4">
            <p className="text-sm font-bold text-zinc-200">Mål</p>
            <Field label="Uke-TSS">
              <Input
                type="number"
                name="weeklyTssGoal"
                defaultValue={user.weeklyTssGoal ?? ""}
                min={0}
                placeholder="400"
              />
            </Field>
            <Field label="Race">
              <Input
                type="text"
                name="raceName"
                defaultValue={user.raceName ?? ""}
                placeholder="Birkebeinerrittet"
              />
            </Field>
            <Field label="Dato">
              <Input
                type="date"
                name="raceDate"
                defaultValue={user.raceDate ? user.raceDate.toISOString().slice(0, 10) : ""}
              />
            </Field>
            <SubmitButton className="self-start">Lagre</SubmitButton>
          </form>
        </Card>

        <Card>
          <form action={saveTrainingThresholds} className="flex flex-col gap-4">
            <p className="text-sm font-bold text-zinc-200">Pulssoner · Olympiatoppen</p>
            <Field label="Makspuls">
              <Input
                type="number"
                name="hrMaxBpm"
                defaultValue={user.hrMaxBpm ?? setup.suggestedHrMax ?? ""}
                min={120}
                max={230}
                placeholder="190"
              />
            </Field>
            <Field label="Puls-terskel (TSS)">
              <Input
                type="number"
                name="hrThresholdBpm"
                defaultValue={user.hrThresholdBpm ?? ""}
                min={100}
                max={220}
                placeholder="165"
              />
            </Field>
            <Field label="FTP">
              <Input type="number" name="ftpWatts" defaultValue={user.ftpWatts ?? ""} min={0} placeholder="250" />
            </Field>
            <Field label="Terskeltempo">
              <Input
                type="text"
                name="thresholdPaceMinPerKm"
                defaultValue={thresholdPaceDisplay}
                placeholder="4:30"
              />
            </Field>
            <SubmitButton className="self-start">Lagre</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
