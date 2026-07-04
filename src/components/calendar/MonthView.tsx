"use client";

import { useState } from "react";
import type { PlannedWorkout } from "@prisma/client";
import { DayDetailSheet } from "@/components/calendar/DayDetailSheet";

export type CalendarActivity = {
  id: string;
  date: Date;
  sport: PlannedWorkout["sport"];
  durationSec: number;
};

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
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

type SessionPreview = {
  key: string;
  icon: string;
  label: string;
  variant: "done" | "planned" | "activity";
};

function buildSessionPreviews(day: MonthDayData): SessionPreview[] {
  const remainingPlanned = [...day.planned];
  const previews: SessionPreview[] = [];

  for (const activity of day.activities) {
    const matchIndex = remainingPlanned.findIndex((p) => p.sport === activity.sport);
    const matched = matchIndex === -1 ? null : remainingPlanned.splice(matchIndex, 1)[0];
    previews.push({
      key: activity.id,
      icon: SPORT_ICONS[activity.sport] ?? "⚡",
      label: matched
        ? `${SPORT_LABELS[activity.sport]} ✓`
        : `${SPORT_LABELS[activity.sport]} ${Math.round(activity.durationSec / 60)}m`,
      variant: matched ? "done" : "activity",
    });
  }

  for (const p of remainingPlanned) {
    previews.push({
      key: p.id,
      icon: SPORT_ICONS[p.sport] ?? "⚡",
      label: p.description.length > 14 ? `${p.description.slice(0, 14)}…` : p.description,
      variant: "planned",
    });
  }

  return previews;
}

function dayClassName(day: MonthDayData, todayKey: string): string {
  if (day.key === todayKey) return "cal-day cal-day--today";
  if (day.isCurrentMonth) return "cal-day";
  return "cal-day cal-day--muted";
}

export function MonthView({ days, todayKey }: { days: MonthDayData[]; todayKey: string }) {
  const [selectedDay, setSelectedDay] = useState<MonthDayData | null>(null);

  return (
    <>
      <div className="cal-weekday mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((day) => {
          const previews = buildSessionPreviews(day);
          const extra = previews.length > 2 ? previews.length - 2 : 0;

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`cal-day-btn ${dayClassName(day, todayKey)}`}
            >
              <div className="flex items-center justify-between">
                <p className={day.key === todayKey ? "cal-day-num cal-day-num--today" : "cal-day-num"}>
                  {day.date.getUTCDate()}
                </p>
                {previews.length === 0 && (
                  <span className="cal-day-add" aria-hidden>
                    +
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-col gap-0.5">
                {previews.slice(0, 2).map((item) => (
                  <div
                    key={item.key}
                    className={`cal-pill cal-pill--${item.variant}`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="line-clamp-2 leading-tight">{item.label}</span>
                  </div>
                ))}
                {extra > 0 && <span className="cal-pill-more">+{extra} til</span>}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <DayDetailSheet day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}
