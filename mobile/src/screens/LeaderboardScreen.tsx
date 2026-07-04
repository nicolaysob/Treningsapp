import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchLeaderboard, type LeaderboardData } from "../api";
import { useAuth } from "../context/AuthContext";
import { RowCard, ScreenHeader } from "../components/ui";
import { colors, spacing } from "../theme";

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}t ${m}m` : `${m}m`;
}

export function LeaderboardScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [weekStart, setWeekStart] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetchLeaderboard(token, weekStart));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente duell");
    }
  }, [token, weekStart]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))} tintColor={colors.accent} />
      }
    >
      <ScreenHeader
        title="Duell"
        subtitle={data?.weekLabel ?? "Ukentlig leaderboard"}
        leftAction={data ? { label: "←", onPress: () => setWeekStart(data.prevWeekStart) } : undefined}
        rightAction={data ? { label: "→", onPress: () => setWeekStart(data.nextWeekStart) } : undefined}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {!data?.rows.length ? (
        <Text style={styles.empty}>Ingen aktivitet denne uken. Synk Strava på nett.</Text>
      ) : (
        data.rows.map((row, index) => {
          const isMe = row.userId === data.currentUserId;
          return (
            <RowCard
              key={row.userId}
              title={`${index + 1}. ${row.userName ?? "Ukjent"}${isMe ? " (deg)" : ""}`}
              subtitle={`${formatDuration(row.totalDurationSec)} · ${Math.round(row.totalElevationM)} m+`}
              right={`${Math.round(row.totalTss)} TSS`}
            />
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 32, gap: 10 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  empty: { color: colors.textDim, fontSize: 14 },
  error: { color: "#f87171", fontSize: 14 },
});
