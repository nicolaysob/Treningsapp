import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeDailyLoad } from "@/lib/training-load/batch";
import {
  formatSecondsToPace,
  parseOptionalInt,
  parsePaceToSeconds,
} from "@/lib/settings-fields";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default async function TrainingSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  async function handleSaveGoals(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const raceDateRaw = formData.get("raceDate")?.toString();
    const raceName = formData.get("raceName")?.toString().trim();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        weeklyTssGoal: parseOptionalInt(formData.get("weeklyTssGoal")),
        raceName: raceName || null,
        raceDate: raceDateRaw ? new Date(raceDateRaw) : null,
      },
    });

    redirect("/settings/training");
  }

  async function handleSaveThresholds(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ftpWatts: parseOptionalInt(formData.get("ftpWatts")),
        thresholdPaceSecPerKm: parsePaceToSeconds(formData.get("thresholdPaceMinPerKm")),
        hrThresholdBpm: parseOptionalInt(formData.get("hrThresholdBpm")),
      },
    });

    await recomputeDailyLoad(session.user.id);
    redirect("/settings/training");
  }

  const thresholdPaceDisplay = user.thresholdPaceSecPerKm
    ? formatSecondsToPace(user.thresholdPaceSecPerKm)
    : "";

  return (
    <AppShell userName={session.user.name}>
      <PageHeader
        title="Trening"
        subtitle="Mål og terskler for TSS-beregning"
        backHref="/settings"
      />

      <div className="flex flex-col gap-5">
        <Card>
          <form action={handleSaveGoals} className="flex flex-col gap-4">
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
            <Button type="submit" size="sm" className="self-start">
              Lagre mål
            </Button>
          </form>
        </Card>

        <Card>
          <form action={handleSaveThresholds} className="flex flex-col gap-4">
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
            <Button type="submit" size="sm" className="self-start">
              Lagre terskler
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
