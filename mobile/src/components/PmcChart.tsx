import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";
import { colors } from "../theme";

type Point = { date: string; ctl: number; atl: number; tsb: number };

const W = Dimensions.get("window").width - 72;
const H = 200;
const PAD = { t: 12, r: 8, b: 24, l: 8 };
const CHART_W = W - PAD.l - PAD.r;
const CHART_H = H - PAD.t - PAD.b;

function toPolyline(points: Point[], key: keyof Point, min: number, max: number): string {
  if (points.length < 2) return "";
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = PAD.l + (i / (points.length - 1)) * CHART_W;
      const y = PAD.t + CHART_H - (((p[key] as number) - min) / range) * CHART_H;
      return `${x},${y}`;
    })
    .join(" ");
}

export function PmcChart({ data }: { data: Point[] }) {
  const { min, max, ctl, atl, tsb } = useMemo(() => {
    if (!data.length) return { min: 0, max: 1, ctl: "", atl: "", tsb: "" };
    const vals = data.flatMap((d) => [d.ctl, d.atl, d.tsb]);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = (hi - lo) * 0.1 || 5;
    const minV = lo - pad;
    const maxV = hi + pad;
    return {
      min: minV,
      max: maxV,
      ctl: toPolyline(data, "ctl", minV, maxV),
      atl: toPolyline(data, "atl", minV, maxV),
      tsb: toPolyline(data, "tsb", minV, maxV),
    };
  }, [data]);

  if (data.length < 2) {
    return <Text style={styles.empty}>Ikke nok data for graf</Text>;
  }

  const zeroY = PAD.t + CHART_H - ((0 - min) / (max - min)) * CHART_H;

  return (
    <View>
      <Svg width={W} height={H}>
        <Line
          x1={PAD.l}
          y1={zeroY}
          x2={W - PAD.r}
          y2={zeroY}
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="4 4"
        />
        <Polyline points={ctl} fill="none" stroke={colors.blue} strokeWidth={2.5} />
        <Polyline points={atl} fill="none" stroke={colors.accent} strokeWidth={2} />
        <Polyline points={tsb} fill="none" stroke={colors.green} strokeWidth={1.5} strokeDasharray="4 3" />
      </Svg>
      <View style={styles.legend}>
        <Legend color={colors.blue} label="CTL" />
        <Legend color={colors.accent} label="ATL" />
        <Legend color={colors.green} label="TSB" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textDim, fontSize: 14, textAlign: "center", paddingVertical: 40 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textDim, fontSize: 11, fontWeight: "600" },
});
