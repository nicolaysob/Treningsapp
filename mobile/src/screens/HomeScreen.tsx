import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchHome, type HomeData } from "../api";
import { useAuth } from "../context/AuthContext";
import { TsbGauge } from "../components/TsbGauge";
import { colors, spacing } from "../theme";

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

const COACH_TONE: Record<string, { border: string; bg: string; title: string }> = {
  fresh: { border: "rgba(61,214,140,0.2)", bg: "rgba(61,214,140,0.08)", title: "#6ee7b7" },
  balanced: { border: "rgba(255,255,255,0.08)", bg: "rgba(255,255,255,0.03)", title: "#f4f4f5" },
  building: { border: "rgba(251,191,36,0.2)", bg: "rgba(251,191,36,0.08)", title: "#fcd34d" },
  risk: { border: "rgba(248,113,113,0.2)", bg: "rgba(248,113,113,0.08)", title: "#fca5a5" },
};

export function HomeScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const home = await fetchHome(token);
      setData(home);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente data");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const firstName = data?.userName?.split(" ")[0] ?? "deg";
  const weekGoal = data?.weeklyTssGoal;
  const weekProgress =
    weekGoal && weekGoal > 0 ? Math.min(100, ((data?.weekTss ?? 0) / weekGoal) * 100) : null;
  const coachStyle = COACH_TONE[data?.coachTone ?? "balanced"] ?? COACH_TONE.balanced;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          tintColor={colors.accent}
        />
      }
    >
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.greeting}>{data?.greeting ?? "Hei"}</Text>
          <Text style={styles.name}>{firstName}</Text>
          {data?.latestLoad ? (
            <Text style={styles.heroMeta}>
              Fitness {data.latestLoad.ctl.toFixed(0)} · Fatigue {data.latestLoad.atl.toFixed(0)}
            </Text>
          ) : (
            <Text style={styles.heroMeta}>Synk Strava på nett</Text>
          )}
        </View>
        <TsbGauge tsb={data?.latestLoad?.tsb ?? null} />
      </View>

      {data?.latestLoad && (
        <View style={styles.bentoRow}>
          <BentoStat label="Fitness" value={data.latestLoad.ctl.toFixed(0)} unit="CTL" color={colors.blue} />
          <BentoStat label="Fatigue" value={data.latestLoad.atl.toFixed(0)} unit="ATL" color={colors.accent} />
          <BentoStat label="Uke" value={Math.round(data.weekTss).toString()} unit="TSS" color={colors.green} />
        </View>
      )}

      {data?.coachTitle && (
        <View style={[styles.card, { borderColor: coachStyle.border, backgroundColor: coachStyle.bg }]}>
          <Text style={styles.cardLabel}>Coach</Text>
          {data.coachReadiness !== null && (
            <Text style={[styles.readiness, { color: coachStyle.title }]}>
              Readiness {data.coachReadiness}%
            </Text>
          )}
          <Text style={[styles.coachTitle, { color: coachStyle.title }]}>{data.coachTitle}</Text>
          {data.coachSummary && <Text style={styles.coachSummary}>{data.coachSummary}</Text>}
        </View>
      )}

      {(weekGoal || data?.raceName) && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Mål</Text>
          {weekGoal ? (
            <>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Ukentlig TSS</Text>
                <Text style={styles.goalValue}>
                  {Math.round(data?.weekTss ?? 0)}
                  <Text style={styles.goalTarget}> / {weekGoal}</Text>
                </Text>
              </View>
              {weekProgress !== null && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${weekProgress}%` }]} />
                </View>
              )}
            </>
          ) : null}
          {data?.raceName && data.daysToRace !== null ? (
            <View style={[styles.raceRow, weekGoal ? styles.raceRowSpaced : null]}>
              <Text style={styles.raceDays}>{data.daysToRace}</Text>
              <View>
                <Text style={styles.raceCountdown}>
                  {data.daysToRace === 1 ? "dag igjen" : "dager igjen"}
                </Text>
                <Text style={styles.raceName}>{data.raceName}</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Treningsbelastning</Text>
        {(data?.pmcChart.length ?? 0) > 0 ? (
          <Text style={styles.pmcHint}>
            {data?.pmcChart.length} dager med data · graf kommer i neste oppdatering
          </Text>
        ) : (
          <Text style={styles.empty}>Koble til Strava for å se PMC-grafen</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Økter</Text>
        {data?.todayWorkouts.length ? (
          <WorkoutSection title="Dagens økter" workouts={data.todayWorkouts} />
        ) : null}
        {data?.tomorrowWorkouts.length ? (
          <WorkoutSection
            title={`I morgen · ${data.tomorrowLabel}`}
            workouts={data.tomorrowWorkouts}
            spaced
          />
        ) : null}
        {!data?.todayWorkouts.length && !data?.tomorrowWorkouts.length ? (
          <Text style={styles.empty}>Ingen økter i dag eller i morgen</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function BentoStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.bento}>
      <Text style={styles.bentoLabel}>{label}</Text>
      <Text style={[styles.bentoValue, { color }]}>{value}</Text>
      <Text style={styles.bentoUnit}>{unit}</Text>
    </View>
  );
}

function WorkoutSection({
  title,
  workouts,
  spaced,
}: {
  title: string;
  workouts: HomeData["todayWorkouts"];
  spaced?: boolean;
}) {
  return (
    <View style={spaced ? styles.workoutSectionSpaced : undefined}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {workouts.map((w, i) => (
        <View key={`${w.sport}-${i}`} style={styles.workoutRow}>
          <Text style={styles.workoutIcon}>{SPORT_ICONS[w.sport] ?? "⚡"}</Text>
          <View style={styles.workoutBody}>
            <Text style={styles.workoutTitle}>{SPORT_LABELS[w.sport] ?? w.sport}</Text>
            <Text style={styles.workoutMeta}>{w.description}</Text>
          </View>
          <Text style={styles.workoutDuration}>{w.durationMin}m</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 32, gap: spacing.gap },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  heroCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  heroText: { flex: 1, minWidth: 0 },
  greeting: { color: colors.accentSoft, fontSize: 13, fontWeight: "600" },
  name: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 4 },
  heroMeta: { color: colors.textDim, fontSize: 13, marginTop: 6 },
  bentoRow: { flexDirection: "row", gap: 10 },
  bento: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    alignItems: "center",
  },
  bentoLabel: { color: colors.textDim, fontSize: 11, fontWeight: "700" },
  bentoValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  bentoUnit: { color: colors.textDim, fontSize: 11, fontWeight: "700", marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.card,
  },
  cardLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  readiness: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  coachTitle: { fontSize: 17, fontWeight: "700" },
  coachSummary: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  goalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalLabel: { color: colors.textDim, fontSize: 14 },
  goalValue: { color: colors.text, fontSize: 16, fontWeight: "800" },
  goalTarget: { color: colors.textDim, fontWeight: "400" },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.accent, borderRadius: 999 },
  raceRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  raceRowSpaced: { marginTop: 16 },
  raceDays: { color: colors.accent, fontSize: 36, fontWeight: "800" },
  raceCountdown: { color: colors.text, fontSize: 14, fontWeight: "600" },
  raceName: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  pmcHint: { color: colors.textMuted, fontSize: 14 },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  workoutSectionSpaced: { marginTop: 16 },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    padding: 12,
    marginBottom: 8,
  },
  workoutIcon: { fontSize: 20 },
  workoutBody: { flex: 1, minWidth: 0 },
  workoutTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  workoutMeta: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  workoutDuration: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  empty: { color: colors.textDim, fontSize: 14 },
  error: { color: "#f87171", fontSize: 14, textAlign: "center" },
});
