import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchCalendar, type CalendarData } from "../api";
import { useAuth } from "../context/AuthContext";
import { MonthGrid } from "../components/MonthGrid";
import {
  Card,
  ErrorText,
  HeroHeader,
  LoadingScreen,
  MonthNav,
  Screen,
} from "../components/ui";
import { colors } from "../theme";

const MONTH_NAMES = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

export function CalendarScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<CalendarData | null>(null);
  const [month, setMonth] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetchCalendar(token, month));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente kalender");
    }
  }, [token, month]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading && !data) return <LoadingScreen />;

  const monthDate = data?.monthStart ? new Date(data.monthStart) : new Date();
  const monthLabel = `${MONTH_NAMES[monthDate.getUTCMonth()]} ${monthDate.getUTCFullYear()}`;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      <HeroHeader title="Kalender" subtitle="Trykk på en dag for å se økter og planlegge" />

      {data && (
        <MonthNav
          label={monthLabel}
          onPrev={() => setMonth(data.prevMonth)}
          onNext={() => setMonth(data.nextMonth)}
        />
      )}

      {error && <ErrorText text={error} />}

      <Card style={styles.card}>
        <View style={styles.legend}>
          <Legend color={colors.green} label="Utført plan" hollow={false} />
          <Legend color={colors.accent} label="Planlagt" hollow />
          <Legend color="#fc4c02" label="Strava" hollow={false} />
        </View>
        {data && (
          <MonthGrid days={data.days} todayKey={data.todayKey} onChanged={() => void load()} />
        )}
      </Card>
    </Screen>
  );
}

function Legend({
  color,
  label,
  hollow,
}: {
  color: string;
  label: string;
  hollow?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          hollow
            ? { borderWidth: 1.5, borderColor: color, backgroundColor: "transparent" }
            : { backgroundColor: color },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textDim, fontSize: 11, fontWeight: "600" },
});
