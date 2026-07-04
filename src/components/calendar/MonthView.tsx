"use client";

import { useState, useTransition } from "react";
import type { Activity, PlannedWorkout } from "@prisma/client";
import { createPlannedWorkout, deletePlannedWorkout } from "@/app/calendar/actions";
import { PlannedWorkoutForm } from "./PlannedWorkoutForm";

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORT_DOT_CLASSES: Record<string, string> = {
  RIDE: "cal-dot--ride",
  RUN: "cal-dot--run",
  SWIM: "cal-dot--swim",
  STRENGTH: "cal-dot--strength",
  OTHER: "cal-dot--other",
};

export interface MonthDayData {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  activities: Activity[];
  planned: PlannedWorkout[];
}

interface MatchedDay {
  activityRows: { activity: Activity; matchedPlanned: PlannedWorkout | null }[];
  unmatchedPlanned: PlannedWorkout[];
}

function matchPlannedToActivities(activities: Activity[], planned: PlannedWorkout[]): MatchedDay {
  const remainingPlanned = [...planned];

  const activityRows = activities.map((activity) => {
    const matchIndex = remainingPlanned.findIndex((p) => p.sport === activity.sport);
    const matchedPlanned = matchIndex === -1 ? null : remainingPlanned.splice(matchIndex, 1)[0];
    return { activity, matchedPlanned };
  });

  return { activityRows, unmatchedPlanned: remainingPlanned };
}

function dayClassName(day: MonthDayData, todayKey: string): string {
  if (day.key === todayKey) return "cal-day cal-day--today";
  if (day.isCurrentMonth) return "cal-day";
  return "cal-day cal-day--muted";
}

export function MonthView({ days, todayKey }: { days: MonthDayData[]; todayKey: string }) {
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createPlannedWorkout(formData);
      setModalDate(null);
    });
  }

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      await deletePlannedWorkout(formData);
    });
  }

  return (
    <>
      <div className="cal-weekday mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((day) => (
          <div
            key={day.key}
            className={`group relative flex min-h-[5.5rem] flex-col gap-1 p-1.5 sm:min-h-[6.5rem] sm:p-2 ${dayClassName(day, todayKey)}`}
          >
            <div className="flex items-center justify-between">
              <p
                className={
                  day.key === todayKey ? "cal-day-num cal-day-num--today" : "cal-day-num"
                }
              >
                {day.date.getUTCDate()}
              </p>
              <button
                type="button"
                onClick={() => setModalDate(day.key)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white opacity-0 shadow-sm transition-all hover:bg-orange-500 group-hover:opacity-100"
                aria-label="Legg til planlagt økt"
              >
                +
              </button>
            </div>

            {(() => {
              const { activityRows, unmatchedPlanned } = matchPlannedToActivities(
                day.activities,
                day.planned,
              );

              return (
                <div className="flex flex-col gap-1 overflow-hidden">
                  {activityRows.map(({ activity: a, matchedPlanned }) => (
                    <div
                      key={a.id}
                      className={`cal-activity ${matchedPlanned ? "cal-activity--done" : ""}`}
                    >
                      {matchedPlanned ? (
                        <span className="cal-check">✓</span>
                      ) : (
                        <span
                          className={`cal-dot ${SPORT_DOT_CLASSES[a.sport] ?? "cal-dot--other"}`}
                        />
                      )}
                      <span className="truncate">
                        {SPORT_LABELS[a.sport] ?? a.sport} · {Math.round(a.durationSec / 60)}m
                        {matchedPlanned && (
                          <span className="cal-activity-sub">
                            {" "}
                            (plan {matchedPlanned.durationMin}m)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}

                  {unmatchedPlanned.map((p) => (
                    <div key={p.id} className="cal-activity cal-activity--planned">
                      <span
                        className={`cal-dot ${SPORT_DOT_CLASSES[p.sport] ?? "cal-dot--other"}`}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {SPORT_LABELS[p.sport] ?? p.sport} · {p.durationMin}m
                      </span>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="shrink-0 text-base leading-none opacity-50 transition-opacity hover:opacity-100"
                          style={{ color: "var(--muted)" }}
                          aria-label="Slett"
                        >
                          ×
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {modalDate && (
        <PlannedWorkoutForm
          date={modalDate}
          action={handleCreate}
          pending={isPending}
          onClose={() => setModalDate(null)}
        />
      )}
    </>
  );
}
