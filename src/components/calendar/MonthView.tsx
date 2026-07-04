"use client";

import { useEffect, useState } from "react";
import type { PlannedWorkout } from "@prisma/client";
import { DayDetailSheet } from "@/components/calendar/DayDetailSheet";

export type CalendarActivity = {
  id: string;
  date: Date;
  sport: PlannedWorkout["sport"];
  durationSec: number;
};

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export type CalendarPlannedWorkout = {
  id: string;
  date: Date;
  sport: CalendarActivity["sport"];
  description: string;
  durationMin: number;
};

export interface MonthDayData {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  activities: CalendarActivity[];
  planned: CalendarPlannedWorkout[];
}

type DaySummary = {
  done: number;
  planned: number;
  strava: number;
};

function summarizeDay(day: MonthDayData): DaySummary {
  const remainingPlanned = [...day.planned];
  let done = 0;

  for (const activity of day.activities) {
    const idx = remainingPlanned.findIndex((p) => p.sport === activity.sport);
    if (idx !== -1) {
      done++;
      remainingPlanned.splice(idx, 1);
    }
  }

  return {
    done,
    planned: remainingPlanned.length,
    strava: day.activities.length - done,
  };
}

function dayClassName(day: MonthDayData, todayKey: string): string {
  if (day.key === todayKey) return "cal-day cal-day--today";
  if (day.isCurrentMonth) return "cal-day";
  return "cal-day cal-day--muted";
}

export function MonthView({ days, todayKey }: { days: MonthDayData[]; todayKey: string }) {
  const [selectedDay, setSelectedDay] = useState<MonthDayData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="cal-weekday mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((day) => {
          const summary = summarizeDay(day);
          const total = summary.done + summary.planned + summary.strava;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`cal-day-btn ${dayClassName(day, todayKey)}`}
            >
              <p className={day.key === todayKey ? "cal-day-num cal-day-num--today" : "cal-day-num"}>
                {day.date.getUTCDate()}
              </p>

              {total > 0 ? (
                <div className="mt-1 flex flex-col items-start gap-1">
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: summary.done }).map((_, i) => (
                      <span key={`d-${i}`} className="cal-dot cal-dot--done" title="Planlagt og gjort" />
                    ))}
                    {Array.from({ length: summary.planned }).map((_, i) => (
                      <span key={`p-${i}`} className="cal-dot cal-dot--planned" title="Planlagt" />
                    ))}
                    {Array.from({ length: summary.strava }).map((_, i) => (
                      <span key={`s-${i}`} className="cal-dot cal-dot--strava" title="Gjennomført" />
                    ))}
                  </div>
                  <span className="cal-day-summary">
                    {summary.done > 0 && `${summary.done} utført`}
                    {summary.done > 0 && summary.planned > 0 && " · "}
                    {summary.planned > 0 && `${summary.planned} plan`}
                  </span>
                </div>
              ) : (
                <span className="cal-day-empty">+</span>
              )}
            </button>
          );
        })}
      </div>

      {mounted && selectedDay && (
        <DayDetailSheet day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}
