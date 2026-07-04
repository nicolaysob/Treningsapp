import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getThresholdSetup } from "@/lib/training-load/threshold-setup";
import { AccountProfileForm } from "@/components/settings/AccountProfileForm";
import { StravaAccountRow } from "@/components/settings/StravaAccountRow";
import {
  SettingsGroup,
  SettingsDivider,
} from "@/components/settings/SettingsGroup";
import { SettingsLink } from "@/components/settings/SettingsLink";

const STRAVA_ERROR_MESSAGES: Record<string, string> = {
  strava: "Noe gikk galt under Strava-tilkoblingen. Prøv igjen.",
  strava_taken: "Denne Strava-kontoen er allerede koblet til en annen bruker.",
};

const SYNC_MESSAGES: Record<string, string> = {
  started: "Synkronisering startet. Aktiviteter oppdateres i bakgrunnen.",
};

const PROFILE_MESSAGES: Record<string, string> = {
  saved: "Konto oppdatert.",
  invalid: "Navn må fylles ut.",
  invalid_username: "Brukernavn må være 3–30 tegn (a–z, 0–9, _).",
  username_taken: "Brukernavnet er allerede i bruk.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sync?: string; profile?: string }>;
}) {
  const { userId } = await requireUserId();
  const { error, sync, profile } = await searchParams;

  const [user, stravaAccount, setup] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true, image: true },
    }),
    prisma.account.findFirst({
      where: { userId, provider: "strava" },
      select: { id: true },
    }),
    getThresholdSetup(userId),
  ]);

  if (!user) redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <>
      <PageHeader title="Mer" subtitle="Konto og app-innstillinger" />

      {error && STRAVA_ERROR_MESSAGES[error] && <Alert>{STRAVA_ERROR_MESSAGES[error]}</Alert>}
      {sync && SYNC_MESSAGES[sync] && <Alert>{SYNC_MESSAGES[sync]}</Alert>}
      {profile && PROFILE_MESSAGES[profile] && <Alert>{PROFILE_MESSAGES[profile]}</Alert>}

      <div className="flex flex-col gap-6">
        <SettingsGroup title="Konto">
          <Card className="flex flex-col gap-4">
            <AccountProfileForm
              name={user.name}
              username={user.username}
              image={user.image}
            />

            <SettingsDivider />

            <StravaAccountRow connected={!!stravaAccount} />

            <SettingsDivider />

            <SettingsLink
              href="/settings/training"
              title="Trening"
              description={
                setup.isActive && setup.method
                  ? `Aktiv · ${setup.method === "hr" ? "puls" : setup.method === "power" ? "watt" : setup.method === "pace" ? "tempo" : "full"}`
                  : setup.needsHrMaxSetup
                    ? "Trenger makspuls"
                    : "Ikke satt"
              }
            />
          </Card>
        </SettingsGroup>

        <SettingsGroup title="App">
          <Card>
            <ThemeToggle />
          </Card>
        </SettingsGroup>

        <form action={handleSignOut}>
          <Button type="submit" variant="ghost" className="w-full text-zinc-500 hover:text-red-400">
            Logg ut
          </Button>
        </form>
      </div>
    </>
  );
}
