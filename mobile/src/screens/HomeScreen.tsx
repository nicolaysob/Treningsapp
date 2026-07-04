import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchHome, type HomeData } from "../api";
import { clearToken } from "../auth";

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

export function HomeScreen({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
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

  async function handleLogout() {
    await clearToken();
    onLogout();
  }

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b2b" />
      </View>
    );
  }

  const firstName = data?.userName?.split(" ")[0] ?? "deg";
  const weekGoal = data?.weeklyTssGoal;
  const weekProgress =
    weekGoal && weekGoal > 0 ? Math.min(100, ((data?.weekTss ?? 0) / weekGoal) * 100) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor="#ff6b2b" />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{data?.greeting ?? "Hei"}</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <Pressable onPress={() => void handleLogout()} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {data?.latestLoad ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fitness · Fatigue · Form</Text>
          <View style={styles.statRow}>
            <Stat label="CTL" value={data.latestLoad.ctl.toFixed(0)} />
            <Stat label="ATL" value={data.latestLoad.atl.toFixed(0)} />
            <Stat label="TSB" value={data.latestLoad.tsb.toFixed(0)} highlight />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.empty}>Ingen treningsdata ennå. Synk Strava på nett.</Text>
        </View>
      )}

      {weekGoal && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Ukens TSS</Text>
          <Text style={styles.weekTss}>
            {Math.round(data?.weekTss ?? 0)} / {weekGoal}
          </Text>
          {weekProgress !== null && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${weekProgress}%` }]} />
            </View>
          )}
        </View>
      )}

      {data?.coachTitle && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Coach</Text>
          <Text style={styles.coachTitle}>{data.coachTitle}</Text>
          {data.coachSummary && <Text style={styles.coachSummary}>{data.coachSummary}</Text>}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Dagens økter</Text>
        {data?.todayWorkouts.length ? (
          data.todayWorkouts.map((w, i) => (
            <View key={`${w.sport}-${i}`} style={styles.workoutRow}>
              <Text style={styles.workoutTitle}>{SPORT_LABELS[w.sport] ?? w.sport}</Text>
              <Text style={styles.workoutMeta}>
                {w.durationMin} min · {w.description}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Ingen planlagte økter i dag</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050506",
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050506",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  greeting: {
    color: "#ff8f4c",
    fontSize: 13,
    fontWeight: "600",
  },
  name: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  logoutText: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  cardLabel: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "700",
  },
  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  statValueHighlight: {
    color: "#ff6b2b",
  },
  weekTss: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff6b2b",
    borderRadius: 999,
  },
  coachTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  coachSummary: {
    color: "#a1a1aa",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  workoutRow: {
    marginBottom: 10,
  },
  workoutTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  workoutMeta: {
    color: "#71717a",
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: "#71717a",
    fontSize: 14,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
});
