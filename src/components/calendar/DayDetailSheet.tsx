"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createPlannedWorkout, deletePlannedWorkout } from "@/app/(app)/calendar/actions";
import type { MonthDayData } from "@/components/calendar/MonthView";
import { formatDateNb } from "@/lib/date";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORT_ICONS: Record<string, string> = {
  RIDE: "🚴",
  RUN: "🏃",
  SWIM: "🏊",
  STRENGTH: "💪",
  OTHER: "⚡",
};

function matchPlannedToActivities(day: MonthDayData) {
  const remainingPlanned = [...day.planned];
  const activityRows = day.activities.map((activity) => {
    const matchIndex = remainingPlanned.findIndex((p) => p.sport === activity.sport);
    const matchedPlanned = matchIndex === -1 ? null : remainingPlanned.splice(matchIndex, 1)[0];
    return { activity, matchedPlanned };
  });
  return { activityRows, unmatchedPlanned: remainingPlanned };
}

export function DayDetailSheet({
  day,
  onClose,
}: {
  day: MonthDayData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activityRows, unmatchedPlanned } = matchPlannedToActivities(day);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setError(null);
    try {
      await createPlannedWorkout(formData);
      form.reset();
      router.refresh();
      onClose();
    } catch {
      setError("Kunne ikke lagre. Prøv igjen.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string) {
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    try {
      await deletePlannedWorkout(fd);
      router.refresh();
      onClose();
    } catch {
      setError("Kunne ikke slette. Prøv igjen.");
    } finally {
      setPending(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="surface-card flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              {formatDateNb(day.date, { weekday: "long", day: "numeric", month: "long" })}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 [-webkit-overflow-scrolling:touch]">
          {activityRows.length === 0 && unmatchedPlanned.length === 0 && (
            <p className="text-sm text-zinc-500">Ingen økter ennå denne dagen.</p>
          )}

          {activityRows.length > 0 && (
            <section>
              <p className="section-label mb-2">Gjennomført (Strava)</p>
              <div className="flex flex-col gap-2">
                {activityRows.map(({ activity, matchedPlanned }) => (
                  <div
                    key={activity.id}
                    className={`cal-detail-item ${matchedPlanned ? "cal-detail-item--done" : ""}`}
                  >
                    <span className="text-2xl">{SPORT_ICONS[activity.sport] ?? "⚡"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-100">
                        {SPORT_LABELS[activity.sport]} · {Math.round(activity.durationSec / 60)} min
                      </p>
                      {matchedPlanned ? (
                        <p className="text-sm text-emerald-400">✓ Planen var: {matchedPlanned.description}</p>
                      ) : (
                        <p className="text-sm text-zinc-500">Ikke planlagt på forhånd</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {unmatchedPlanned.length > 0 && (
            <section>
              <p className="section-label mb-2">Planlagt (ikke gjort)</p>
              <div className="flex flex-col gap-2">
                {unmatchedPlanned.map((p) => (
                  <div key={p.id} className="cal-detail-item cal-detail-item--planned">
                    <span className="text-2xl">{SPORT_ICONS[p.sport] ?? "⚡"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-100">{p.description}</p>
                      <p className="text-sm text-zinc-500">
                        {SPORT_LABELS[p.sport]} · {p.durationMin} min
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onDelete(p.id)}
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Slett
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-orange-500/25 bg-orange-500/8 p-4">
            <p className="mb-3 text-sm font-bold text-orange-300">Legg til planlagt økt</p>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <input type="hidden" name="date" value={day.key} />

              <Field label="Type">
                <Select name="sport" defaultValue="RUN">
                  <option value="RIDE">Sykkel</option>
                  <option value="RUN">Løping</option>
                  <option value="SWIM">Svømming</option>
                  <option value="STRENGTH">Styrke</option>
                  <option value="OTHER">Annet</option>
                </Select>
              </Field>

              <Field label="Hva skal du gjøre?">
                <Input
                  type="text"
                  name="description"
                  required
                  placeholder="f.eks. Rolig løpetur 45 min"
                />
              </Field>

              <Field label="Varighet (minutter)">
                <Input type="number" name="durationMin" min={1} required placeholder="45" />
              </Field>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Lagrer…" : "Lagre planlagt økt"}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
