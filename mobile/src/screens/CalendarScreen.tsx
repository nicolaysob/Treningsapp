import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createPlannedWorkout,
  deletePlannedWorkout,
  fetchCalendar,
  type CalendarData,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { ActionButton, RowCard, ScreenHeader, Section } from "../components/ui";
import { colors, spacing } from "../theme";

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORTS = ["RIDE", "RUN", "SWIM", "STRENGTH", "OTHER"] as const;

export function CalendarScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<CalendarData | null>(null);
  const [month, setMonth] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addDate, setAddDate] = useState("");
  const [addSport, setAddSport] = useState<(typeof SPORTS)[number]>("RIDE");
  const [addDesc, setAddDesc] = useState("");
  const [addMin, setAddMin] = useState("60");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const cal = await fetchCalendar(token, month);
      setData(cal);
      setAddDate((prev) => prev || cal.todayKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente kalender");
    }
  }, [token, month]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAdd() {
    const durationMin = parseInt(addMin, 10);
    if (!addDate || !addDesc.trim() || !Number.isFinite(durationMin)) return;
    setSaving(true);
    try {
      await createPlannedWorkout(token, {
        date: addDate,
        sport: addSport,
        description: addDesc.trim(),
        durationMin,
      });
      setAddDesc("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePlannedWorkout(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke slette");
    }
  }

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const activeDays = (data?.days ?? []).filter(
    (d) => d.isCurrentMonth && (d.activities.length > 0 || d.planned.length > 0),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={colors.accent} />
      }
    >
      <ScreenHeader
        title="Kalender"
        subtitle="Planlagte og utførte økter"
        leftAction={
          data ? { label: "←", onPress: () => setMonth(data.prevMonth) } : undefined
        }
        rightAction={
          data ? { label: "→", onPress: () => setMonth(data.nextMonth) } : undefined
        }
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Section title="Legg til planlagt økt">
        <TextInput style={styles.input} value={addDate} onChangeText={setAddDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textDim} />
        <View style={styles.sportRow}>
          {SPORTS.map((s) => (
            <ActionButton
              key={s}
              label={SPORT_LABELS[s]}
              variant={addSport === s ? "primary" : "ghost"}
              onPress={() => setAddSport(s)}
            />
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={addDesc}
          onChangeText={setAddDesc}
          placeholder="Beskrivelse"
          placeholderTextColor={colors.textDim}
        />
        <TextInput
          style={styles.input}
          value={addMin}
          onChangeText={setAddMin}
          placeholder="Minutter"
          keyboardType="number-pad"
          placeholderTextColor={colors.textDim}
        />
        <ActionButton label={saving ? "Lagrer…" : "Legg til"} onPress={() => void handleAdd()} disabled={saving} />
      </Section>

      <Section title={data?.monthLabel ?? "Måned"}>
        {activeDays.length === 0 ? (
          <Text style={styles.empty}>Ingen økter denne måneden</Text>
        ) : (
          activeDays.map((day) => (
            <View key={day.key} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>
                {day.key}
                {day.key === data?.todayKey ? " · I dag" : ""}
              </Text>
              {day.planned.map((p) => (
                <View key={p.id} style={styles.itemRow}>
                  <RowCard
                    title={`📋 ${SPORT_LABELS[p.sport] ?? p.sport}`}
                    subtitle={p.description}
                    right={`${p.durationMin}m`}
                  />
                  <ActionButton label="Slett" variant="danger" onPress={() => void handleDelete(p.id)} />
                </View>
              ))}
              {day.activities.map((a) => (
                <RowCard
                  key={a.id}
                  title={`✓ ${SPORT_LABELS[a.sport] ?? a.sport}`}
                  subtitle="Strava"
                  right={a.tss ? `${Math.round(a.tss)} TSS` : `${Math.round(a.durationSec / 60)}m`}
                />
              ))}
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 32, gap: spacing.gap },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 15,
  },
  sportRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dayBlock: { gap: 8, marginBottom: 8 },
  dayTitle: { color: colors.accentSoft, fontSize: 13, fontWeight: "700" },
  itemRow: { gap: 6 },
  empty: { color: colors.textDim, fontSize: 14 },
  error: { color: "#f87171", fontSize: 14 },
});
