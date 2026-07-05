import { StyleSheet, Text, View } from "react-native";
import type { LeaderboardData } from "../api";
import { UserAvatar } from "./UserAvatar";
import { colors } from "../theme";

type Row = LeaderboardData["rows"][number];
type SortKey = "totalTss" | "totalDurationSec" | "longestDurationSec" | "totalElevationM";

const ORDER = [1, 0, 2] as const;
const MEDALS = ["🥈", "🥇", "🥉"] as const;
const HEIGHTS = [72, 96, 56] as const;

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}t ${m}m` : `${m}m`;
}

function formatValue(row: Row, key: SortKey): string {
  if (key === "totalTss") return `${row.totalTss.toFixed(0)} TSS`;
  if (key === "totalElevationM") return `${row.totalElevationM.toFixed(0)} m`;
  return formatDuration(row[key]);
}

export function Podium({
  rows,
  currentUserId,
  sortKey = "totalTss",
}: {
  rows: Row[];
  currentUserId: string;
  sortKey?: SortKey;
}) {
  const top3 = rows.slice(0, 3);
  if (!top3.length) return null;

  return (
    <View style={styles.wrap}>
      {ORDER.map((rankIndex, displayIndex) => {
        const row = top3[rankIndex];
        if (!row) return <View key={displayIndex} style={styles.slot} />;
        const isMe = row.userId === currentUserId;
        return (
          <View key={row.userId} style={styles.slot}>
            <Text style={styles.medal}>{MEDALS[rankIndex]}</Text>
            <UserAvatar
              name={row.userName}
              image={row.userImage}
              size="sm"
              highlight={isMe}
            />
            <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
              {row.userName?.split(" ")[0] ?? "Ukjent"}
            </Text>
            <Text style={styles.value}>{formatValue(row, sortKey)}</Text>
            <View style={[styles.bar, { height: HEIGHTS[displayIndex] }, BAR_STYLES[rankIndex]]} />
          </View>
        );
      })}
    </View>
  );
}

const BAR_STYLES = [
  { backgroundColor: "rgba(148,163,184,0.12)", borderColor: "rgba(148,163,184,0.18)" },
  { backgroundColor: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.22)" },
  { backgroundColor: "rgba(180,140,100,0.1)", borderColor: "rgba(180,140,100,0.16)" },
];

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 10, paddingVertical: 18, paddingHorizontal: 8 },
  slot: { width: 84, alignItems: "center", gap: 5 },
  medal: { fontSize: 18 },
  name: { color: colors.textMuted, fontSize: 11, fontWeight: "600", maxWidth: 76, textAlign: "center" },
  nameMe: { color: colors.accentSoft },
  value: { color: colors.textDim, fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 1, borderBottomWidth: 0 },
});
