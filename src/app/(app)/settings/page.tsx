import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { requireUserId } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { syncUserFully, continueBestTimesImport } from "@/lib/sync-user";
import { resetBestTimesProcessing, processNewActivityPeaks } from "@/lib/peak-efforts/process";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  SettingsGroup,
  SettingsRow,
  SettingsDivider,
} from "@/components/settings/SettingsGroup";
import { SettingsLink } from "@/components/settings/SettingsLink";

const STRAVA_ERROR_MESSAGES: Record<string, string> = {
  strava: "Noe gikk galt under Strava-tilkoblingen. Prøv igjen.",
  strava_taken: "Denne Strava-kontoen er allerede koblet til en annen bruker.",
};

const SYNC_MESSAGES: Record<string, string> = {
  started: "Synkronisert. Beste tider oppdateres fortløpende.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sync?: string }>;
}) {
  const { userId } = await requireUserId();
  const { error, sync } = await searchParams;

  const [user, stravaAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    }),
    prisma.account.findFirst({
      where: { userId, provider: "strava" },
      select: { id: true },
    }),
  ]);

  if (!user) redirect("/login");

  async function handleSync() {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const userId = session.user.id;

    await syncUserFully(userId, { full: true });
    await resetBestTimesProcessing(userId);
    await processNewActivityPeaks(userId);
    revalidatePath("/peak");

    after(async () => {
      try {
        await continueBestTimesImport(userId);
      } catch (err) {
        console.error("Background best-times import failed", err);
      }
    });

    redirect("/settings?sync=started");
  }

  async function handleDisconnectStrava() {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    await prisma.account.deleteMany({
      where: { userId: session.user.id, provider: "strava" },
    });
    redirect("/settings");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <>
      <PageHeader title="Innstillinger" />

      {error && STRAVA_ERROR_MESSAGES[error] && <Alert>{STRAVA_ERROR_MESSAGES[error]}</Alert>}
      {sync && SYNC_MESSAGES[sync] && <Alert>{SYNC_MESSAGES[sync]}</Alert>}

      <div className="flex flex-col gap-6">
        <SettingsGroup title="Konto">
          <Card className="flex flex-col gap-1">
            <SettingsLink
              href="/settings/training"
              title="Trening"
              description="Mål, terskler og TSS"
            />
          </Card>
        </SettingsGroup>

        <SettingsGroup title="Strava">
          <Card>
            {stravaAccount ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external Strava avatar URL
                    <img
                      src={user.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
                      S
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-zinc-100">{user.name}</p>
                    <p className="text-xs text-emerald-500">Tilkoblet</p>
                  </div>
                </div>

                <SettingsDivider />

                <SettingsRow title="Synk aktiviteter" description="Automatisk én gang daglig">
                  <form action={handleSync}>
                    <SubmitButton size="sm" pendingLabel="Synker…">
                      Synk nå
                    </SubmitButton>
                  </form>
                </SettingsRow>

                <form action={handleDisconnectStrava} className="pt-1">
                  <button
                    type="submit"
                    className="text-sm text-zinc-500 transition-colors hover:text-red-400"
                  >
                    Koble fra Strava
                  </button>
                </form>
              </div>
            ) : (
              <SettingsRow
                title="Ikke tilkoblet"
                description="Koble til for å hente aktiviteter automatisk"
              >
                <ButtonLink href="/api/strava/connect" size="sm">
                  Koble til
                </ButtonLink>
              </SettingsRow>
            )}
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
