import { StyleSheet, Text, View } from "react-native";
import type { CoachData } from "../api";
import { Card, CardHeader } from "./ui";
import { colors, radii } from "../theme";

type Distribution = NonNullable<CoachData["zoneDistribution"]>;

const ZONE_COLORS: Record<string, string> = {
  z1: "#3b82f6",
  z2: "#22c55e",
  z3: "#eab308",
  z4: "#f97316",
  z5: "#ef4444",
};

const ZONE_RANGES: Record<string, string> = {
  z1: "55–72% maks",
  z2: "72–82% maks",
  z3: "82–87% maks",
  z4: "87–92% maks",
  z5: "92–100% maks",
};

const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function formatDurationShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}t ${minutes}m`;
  return `${minutes}m`;
}

function formatWeekLabel(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getUTCDate()}. ${MONTHS[s.getUTCMonth()]} – ${e.getUTCDate()}. ${MONTHS[e.getUTCMonth()]}`;
}

export function ZoneDistributionChart({
  distribution,
  hrMaxBpm,
}: {
  distribution: Distribution;
  hrMaxBpm: number;
}) {
  const visibleZones = distribution.zones.filter((z) => z.durationSec > 0 && z.zone !== "unknown");
  const hasData = distribution.classifiedDurationSec > 0;
  const easyPct = Math.round(distribution.easyPercent);
  const hardPct = Math.round(distribution.hardPercent);
  const easyOk = easyPct >= distribution.targetEasyPercent - 10;
  const hardOk = hardPct <= distribution.targetHardPercent + 10;
  const weekLabel = formatWeekLabel(distribution.weekStart, distribution.weekEnd);

  return (
    <Card style={styles.card}>
      <CardHeader title="Pulssoner" subtitle={`${hrMaxBpm} maks · ${weekLabel}`} />

      {!hasData ? (
        <Text style={styles.empty}>Ingen pulsdata denne uken</Text>
      ) : (
        <>
          <View style={styles.bar}>
            {visibleZones.map((z) => (
              <View
                key={z.zone}
                style={[
                  styles.barSeg,
                  { width: `${Math.max(z.percent, 1)}%`, backgroundColor: ZONE_COLORS[z.zone] ?? colors.textDim },
                ]}
              />
            ))}
          </View>

          <View style={styles.summary}>
            <View style={[styles.summaryItem, easyOk ? styles.summaryOk : styles.summaryOff]}>
              <Text style={styles.summaryLabel}>Lett · sone 1–2</Text>
              <Text style={[styles.summaryValue, easyOk ? styles.valueOk : styles.valueOff]}>{easyPct}%</Text>
              <Text style={styles.summaryGoal}>Mål 80%</Text>
            </View>
            <View style={[styles.summaryItem, hardOk ? styles.summaryOk : styles.summaryOff]}>
              <Text style={styles.summaryLabel}>Hard · sone 4–5</Text>
              <Text style={[styles.summaryValue, hardOk ? styles.valueOk : styles.valueOff]}>{hardPct}%</Text>
              <Text style={styles.summaryGoal}>Mål 20%</Text>
            </View>
          </View>

          <View style={styles.legend}>
            {visibleZones.map((z) => (
              <View key={z.zone} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: ZONE_COLORS[z.zone] }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendLabel}>{z.label}</Text>
                  <Text style={styles.legendRange}>{ZONE_RANGES[z.zone]}</Text>
                </View>
                <Text style={styles.legendPct}>{Math.round(z.percent)}%</Text>
                <Text style={styles.legendTime}>{formatDurationShort(z.durationSec)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  empty: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.cardBorder,
    borderRadius: radii.md,
  },
  bar: {
    flexDirection: "row",
    height: 20,
    borderRadius: radii.pill,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  barSeg: { minWidth: 2 },
  summary: { flexDirection: "row", gap: 8 },
  summaryItem: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  summaryOk: { borderColor: "rgba(52,211,153,0.2)" },
  summaryOff: { borderColor: "rgba(251,191,36,0.2)" },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  valueOk: { color: "#6ee7b7" },
  valueOff: { color: colors.amber },
  summaryGoal: { color: colors.textDim, fontSize: 11, fontWeight: "600", marginTop: 2 },
  legend: { gap: 8, marginTop: 4 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { flex: 1 },
  legendLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "700" },
  legendRange: { color: colors.textDim, fontSize: 11, marginTop: 1 },
  legendPct: { color: colors.text, fontSize: 13, fontWeight: "800", minWidth: 36, textAlign: "right" },
  legendTime: { color: colors.textDim, fontSize: 12, minWidth: 44, textAlign: "right" },
});
