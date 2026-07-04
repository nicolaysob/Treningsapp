import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CalendarDay } from "../api";
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
        {days.map((day) => {
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
              <View style={[styles.dayNum, isToday && styles.dayNumToday]}>
                <Text style={[styles.dayNumText, isToday && styles.dayNumTodayText]}>
                  {new Date(day.date).getUTCDate()}
                </Text>
              </View>
              {total > 0 ? (
                <View style={styles.dots}>
                  {Array.from({ length: summary.done }).map((_, i) => (
                    <View key={`d${i}`} style={[styles.dot, styles.dotDone]} />
                  ))}
                  {Array.from({ length: summary.planned }).map((_, i) => (
                    <View key={`p${i}`} style={[styles.dot, styles.dotPlanned]} />
                  ))}
                  {Array.from({ length: summary.strava }).map((_, i) => (
                    <View key={`s${i}`} style={[styles.dot, styles.dotStrava]} />
                  ))}
                </View>
              ) : (
                <Text style={styles.plus}>+</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      {selected && (
        <DaySheet day={selected} onClose={() => setSelected(null)} onChanged={onChanged} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  weekdays: { flexDirection: "row", marginBottom: 8 },
  weekday: { flex: 1, textAlign: "center", color: colors.textDim, fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.285%",
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    padding: 6,
    marginBottom: 4,
  },
  cellMuted: { backgroundColor: "rgba(255,255,255,0.02)", borderColor: "transparent" },
  cellToday: {
    borderColor: "rgba(255,107,43,0.45)",
    backgroundColor: "rgba(255,107,43,0.08)",
  },
  dayNum: { alignSelf: "flex-start" },
  dayNumText: { color: colors.textDim, fontSize: 12, fontWeight: "700" },
  dayNumToday: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumTodayText: { color: "#fff" },
  dots: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotDone: { backgroundColor: colors.green },
  dotPlanned: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: "transparent" },
  dotStrava: { backgroundColor: "#fc4c02" },
  plus: { color: "rgba(255,107,43,0.5)", fontSize: 14, fontWeight: "800", marginTop: 4 },
});
