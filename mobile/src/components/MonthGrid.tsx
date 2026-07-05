import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CalendarDay } from "../api";
import { dayNumberFromKey } from "../lib/date";
import { colors, radii } from "../theme";
import { DaySheet } from "./DaySheet";

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function summarizeDay(day: CalendarDay) {
  const remaining = [...day.planned];
  let done = 0;
  for (const activity of day.activities) {
    const idx = remaining.findIndex((p) => p.sport === activity.sport);
    if (idx !== -1) {
      done++;
      remaining.splice(idx, 1);
    }
  }
  return { done, planned: remaining.length, strava: day.activities.length - done };
}

function chunkWeeks(days: CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function MonthGrid({
  days,
  todayKey,
  onChanged,
}: {
  days: CalendarDay[];
  todayKey: string;
  onChanged: () => void;
}) {
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const weeks = useMemo(() => chunkWeeks(days), [days]);

  return (
    <>
      <View style={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day) => {
              const summary = summarizeDay(day);
              const total = summary.done + summary.planned + summary.strava;
              const isToday = day.key === todayKey;
              const muted = !day.isCurrentMonth;

              return (
                <Pressable
                  key={day.key}
                  style={[
                    styles.cell,
                    muted && styles.cellMuted,
                    isToday && styles.cellToday,
                  ]}
                  onPress={() => setSelected(day)}
                >
                  <Text
                    style={[
                      styles.dayNumText,
                      isToday && styles.dayNumTodayText,
                      muted && styles.dayNumMuted,
                    ]}
                  >
                    {dayNumberFromKey(day.key)}
                  </Text>
                  {total > 0 ? (
                    <View style={styles.dots}>
                      {Array.from({ length: Math.min(summary.done, 3) }).map((_, i) => (
                        <View key={`d${i}`} style={[styles.dot, styles.dotDone]} />
                      ))}
                      {Array.from({ length: Math.min(summary.planned, 3) }).map((_, i) => (
                        <View key={`p${i}`} style={[styles.dot, styles.dotPlanned]} />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.dotsPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {selected && (
        <DaySheet day={selected} onClose={() => setSelected(null)} onChanged={onChanged} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  weekdays: { flexDirection: "row", gap: 4, marginBottom: 8 },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "600",
  },
  grid: { gap: 4 },
  weekRow: { flexDirection: "row", gap: 4 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: 6,
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  cellMuted: { opacity: 0.35 },
  cellToday: {
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.35)",
  },
  dayNumText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  dayNumMuted: { color: colors.textDim },
  dayNumTodayText: { color: colors.accentSoft, fontWeight: "800" },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 3, minHeight: 5 },
  dotsPlaceholder: { minHeight: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotDone: { backgroundColor: colors.green },
  dotPlanned: { backgroundColor: colors.accent },
});
