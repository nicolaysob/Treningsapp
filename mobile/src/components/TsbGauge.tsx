import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme";

type TsbStatus = "fresh" | "neutral" | "fatigued";

const STATUS: Record<TsbStatus, { stroke: string; label: string }> = {
  fresh: { stroke: colors.fresh, label: "Frisk" },
  neutral: { stroke: colors.neutral, label: "Nøytral" },
  fatigued: { stroke: colors.fatigued, label: "Sliten" },
};

function tsbColor(tsb: number): TsbStatus {
  if (tsb > 5) return "fresh";
  if (tsb < -10) return "fatigued";
  return "neutral";
}

function tsbToProgress(tsb: number): number {
  const clamped = Math.max(-45, Math.min(45, tsb));
  return ((clamped + 45) / 90) * 100;
}

export function TsbGauge({ tsb }: { tsb: number | null }) {
  if (tsb === null) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.emptyValue}>—</Text>
        <Text style={styles.emptyLabel}>TSB</Text>
      </View>
    );
  }

  const status = tsbColor(tsb);
  const { stroke, label } = STATUS[status];
  const progress = tsbToProgress(tsb);
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const dashOffset = circumference - (progress / 100) * arcLength;

  return (
    <View style={styles.wrap}>
      <Svg width={112} height={112} style={styles.svg}>
        <Circle
          cx={56}
          cy={56}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          rotation={-135}
          origin="56, 56"
        />
        <Circle
          cx={56}
          cy={56}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-135}
          origin="56, 56"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { color: stroke }]}>{tsb.toFixed(0)}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  center: {
    alignItems: "center",
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  emptyValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textDim,
  },
  emptyLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
});
