import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { disconnectStrava, syncStrava } from "@/app/(app)/settings/actions";

export function StravaAccountRow({ connected }: { connected: boolean }) {
  if (!connected) {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-200">Strava</p>
          <p className="text-xs text-zinc-500">Ikke tilkoblet</p>
        </div>
        <ButtonLink href="/api/strava/connect" size="sm">
          Koble til
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="strava-dot" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-200">Strava</p>
            <p className="text-xs text-emerald-500">Tilkoblet</p>
          </div>
        </div>
        <form action={syncStrava}>
          <SubmitButton size="sm" pendingLabel="Synker…">
            Synk
          </SubmitButton>
        </form>
      </div>
      <p className="text-xs text-zinc-600">Dra ned på en side for å synke automatisk.</p>
      <form action={disconnectStrava}>
        <button
          type="submit"
          className="text-xs text-zinc-500 transition-colors hover:text-red-400"
        >
          Koble fra
        </button>
      </form>
    </div>
  );
}
