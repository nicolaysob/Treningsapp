"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlannedWorkout, deletePlannedWorkout } from "@/app/(app)/calendar/actions";
import { PlannedWorkoutForm } from "@/components/calendar/PlannedWorkoutForm";
import type { MonthDayData } from "@/components/calendar/MonthView";
import { formatDateNb } from "@/lib/date";
import { Button } from "@/components/ui/Button";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { activityRows, unmatchedPlanned } = matchPlannedToActivities(day);
  const isEmpty = activityRows.length === 0 && unmatchedPlanned.length === 0;

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      await deletePlannedWorkout(formData);
      router.refresh();
      onClose();
    });
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createPlannedWorkout(formData);
      setShowAddForm(false);
      router.refresh();
      onClose();
    });
  }

  if (showAddForm) {
    return (
      <PlannedWorkoutForm
        date={day.key}
        action={handleCreate}
        pending={isPending}
        onClose={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="surface-card flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl shadow-2xl shadow-black/60 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              {formatDateNb(day.date, { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            <p className="text-sm text-zinc-500">
              {activityRows.length} gjennomført · {unmatchedPlanned.length} planlagt
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 [-webkit-overflow-scrolling:touch]">
          {isEmpty && (
            <p className="py-6 text-center text-sm text-zinc-500">Ingen økter denne dagen.</p>
          )}

          {activityRows.length > 0 && (
            <section className="mb-5">
              <p className="section-label mb-2">Gjennomført</p>
              <div className="flex flex-col gap-2">
                {activityRows.map(({ activity, matchedPlanned }) => (
                  <div
                    key={activity.id}
                    className={`cal-detail-item ${matchedPlanned ? "cal-detail-item--done" : ""}`}
                  >
                    <span className="text-xl leading-none">{SPORT_ICONS[activity.sport] ?? "⚡"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-100">
                        {SPORT_LABELS[activity.sport] ?? activity.sport}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {Math.round(activity.durationSec / 60)} min
                        {matchedPlanned && ` · plan var ${matchedPlanned.durationMin} min`}
                      </p>
                      {matchedPlanned && (
                        <p className="mt-0.5 text-sm text-emerald-400/90">
                          ✓ {matchedPlanned.description}
                        </p>
                      )}
                    </div>
                    {matchedPlanned ? (
                      <span className="cal-detail-badge cal-detail-badge--done">Utført</span>
                    ) : (
                      <span className="cal-detail-badge">Strava</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {unmatchedPlanned.length > 0 && (
            <section>
              <p className="section-label mb-2">Planlagt</p>
              <div className="flex flex-col gap-2">
                {unmatchedPlanned.map((p) => (
                  <div key={p.id} className="cal-detail-item cal-detail-item--planned">
                    <span className="text-xl leading-none">{SPORT_ICONS[p.sport] ?? "⚡"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-100">
                        {SPORT_LABELS[p.sport] ?? p.sport}
                      </p>
                      <p className="text-sm text-zinc-400">{p.description}</p>
                      <p className="text-sm text-zinc-500">{p.durationMin} min</p>
                    </div>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-full px-2 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Slett
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-white/8 px-5 py-4">
          <Button type="button" className="w-full" onClick={() => setShowAddForm(true)}>
            + Planlegg økt
          </Button>
        </div>
      </div>
    </div>
  );
}
