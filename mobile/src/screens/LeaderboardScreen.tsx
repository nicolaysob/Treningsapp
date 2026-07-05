import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchLeaderboard, type LeaderboardData } from "../api";
import { useAuth } from "../context/AuthContext";
import { Podium } from "../components/Podium";
import { SegmentedControl } from "../components/SegmentedControl";
import { UserAvatar } from "../components/UserAvatar";
import {
  Card,
  EmptyState,
  ErrorText,
  HeroHeader,
  LoadingScreen,
  MonthNav,
  Screen,
} from "../components/ui";
import { colors } from "../theme";

type SortKey = "totalTss" | "totalDurationSec" | "longestDurationSec" | "totalElevationM";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "totalTss", label: "TSS" },
  { key: "totalDurationSec", label: "Tid" },
  { key: "longestDurationSec", label: "Lengste" },
  { key: "totalElevationM", label: "Høyde" },
];

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}t ${m}m` : `${m}m`;
}

function formatValue(row: LeaderboardData["rows"][number], key: SortKey): string {
  if (key === "totalTss") return row.totalTss.toFixed(0);
  if (key === "totalElevationM") return `${row.totalElevationM.toFixed(0)} m`;
  return formatDuration(row[key]);
}

export function LeaderboardScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [weekStart, setWeekStart] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>("totalTss");
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

  const sorted = useMemo(
    () => (data?.rows ? [...data.rows].sort((a, b) => b[sortKey] - a[sortKey]) : []),
    [data?.rows, sortKey],
  );

  if (loading && !data) return <LoadingScreen />;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      <HeroHeader title="Duell" subtitle="Ukentlig leaderboard mot venner" />

      {data && (
        <MonthNav
          label={data.weekLabel}
          onPrev={() => setWeekStart(data.prevWeekStart)}
          onNext={() => setWeekStart(data.nextWeekStart)}
        />
      )}

      {error && <ErrorText text={error} />}

      {!sorted.length ? (
        <EmptyState text="Ingen aktivitet denne uken. Synk Strava på nett." />
      ) : (
        <Card style={styles.card}>
          <Podium rows={sorted} currentUserId={data!.currentUserId} sortKey={sortKey} />

          <View style={styles.sortRow}>
            <SegmentedControl
              options={SORT_OPTIONS.map((o) => o.key)}
              value={sortKey}
              onChange={setSortKey}
              formatLabel={(k) => SORT_OPTIONS.find((o) => o.key === k)!.label}
            />
          </View>

          <View style={styles.table}>
            {sorted.map((row, index) => {
              const isMe = row.userId === data!.currentUserId;
              return (
                <View key={row.userId} style={[styles.row, isMe && styles.rowMe]}>
                  <Text style={styles.rank}>{index + 1}</Text>
                  <UserAvatar
                    name={row.userName}
                    image={row.userImage}
                    size="sm"
                    highlight={isMe}
                  />
                  <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
                    {row.userName ?? "Ukjent"}
                  </Text>
                  <Text style={styles.value}>{formatValue(row, sortKey)}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 0, padding: 0, overflow: "hidden" },
  sortRow: { padding: 10, borderTopWidth: 1, borderTopColor: colors.divider },
  table: { borderTopWidth: 1, borderTopColor: colors.divider },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowMe: { backgroundColor: colors.accentSubtle },
  rank: { width: 20, textAlign: "center", color: colors.textDim, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  name: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600" },
  nameMe: { color: colors.accentSoft },
  value: { color: colors.textMuted, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
});
