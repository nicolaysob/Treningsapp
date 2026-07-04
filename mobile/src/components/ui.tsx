import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing, type as typography, bento, coachTone } from "../theme";

/* ─── Layout ─── */

export function Screen({
  children,
  refreshing,
  onRefresh,
  contentStyle,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.screenContent,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: 120 + insets.bottom },
        contentStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

/* ─── Headers ─── */

export function HeroHeader({
  label,
  title,
  subtitle,
  right,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <LinearGradient
      colors={["#1a120e", "#0c0c0f", "#080a14"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroGlow} />
      <View style={styles.heroRow}>
        <View style={styles.heroBody}>
          {label ? <Text style={styles.heroLabel}>{label}</Text> : null}
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

export function MonthNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <View style={styles.monthNav}>
      <Pressable style={styles.navArrow} onPress={onPrev} disabled={!onPrev}>
        <Text style={[styles.navArrowText, !onPrev && styles.navArrowDisabled]}>‹</Text>
      </Pressable>
      <Text style={styles.monthLabel}>{label}</Text>
      <Pressable style={styles.navArrow} onPress={onNext} disabled={!onNext}>
        <Text style={[styles.navArrowText, !onNext && styles.navArrowDisabled]}>›</Text>
      </Pressable>
    </View>
  );
}

/* ─── Cards ─── */

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderBody}>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardHeaderSub}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function BentoStat({
  label,
  value,
  unit,
  variant = "orange",
}: {
  label: string;
  value: string;
  unit: string;
  variant?: keyof typeof bento;
}) {
  const v = bento[variant];
  return (
    <LinearGradient colors={[...v.bg]} style={[styles.bento, { borderColor: v.border }]}>
      <Text style={styles.bentoLabel}>{label}</Text>
      <Text style={[styles.bentoValue, { color: v.accent }]}>{value}</Text>
      <Text style={styles.bentoUnit}>{unit}</Text>
    </LinearGradient>
  );
}

export function CoachCard({
  tone = "balanced",
  readiness,
  title,
  body,
}: {
  tone?: keyof typeof coachTone;
  readiness?: number | null;
  title: string;
  body?: string;
}) {
  const t = coachTone[tone] ?? coachTone.balanced;
  return (
    <LinearGradient colors={[...t.bg]} style={[styles.coachCard, { borderColor: t.border }]}>
      {readiness != null && (
        <Text style={[styles.coachReadiness, { color: t.text }]}>Readiness {readiness}%</Text>
      )}
      <Text style={[styles.coachTitle, { color: t.text }]}>{title}</Text>
      {body ? <Text style={styles.coachBody}>{body}</Text> : null}
    </LinearGradient>
  );
}

export function RowItem({
  title,
  subtitle,
  right,
  icon,
  highlight,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  icon?: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      {icon ? <Text style={styles.rowIcon}>{icon}</Text> : null}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={styles.rowRight}>{right}</Text> : null}
    </View>
  );
}

/* ─── Form ─── */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.textDim}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.btn,
        variant === "ghost" && styles.btnGhost,
        variant === "danger" && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.accent} />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "ghost" && styles.btnTextGhost,
            variant === "danger" && styles.btnTextDanger,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function ErrorText({ text }: { text: string }) {
  return <Text style={styles.error}>{text}</Text>;
}

export function SuccessText({ text }: { text: string }) {
  return <Text style={styles.success}>{text}</Text>;
}

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, percent)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { paddingHorizontal: spacing.screen, gap: spacing.section },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },

  hero: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.22)",
    padding: 20,
    overflow: "hidden",
    marginBottom: 4,
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,107,43,0.12)",
  },
  heroRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroBody: { flex: 1, minWidth: 0 },
  heroLabel: { color: colors.accentSoft, fontSize: 13, fontWeight: "600" },
  heroTitle: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 4, letterSpacing: -0.5 },
  heroSubtitle: { color: colors.textDim, fontSize: 14, marginTop: 6, lineHeight: 20 },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navArrow: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navArrowText: { color: colors.accent, fontSize: 28, fontWeight: "300", marginTop: -2 },
  navArrowDisabled: { opacity: 0.25 },
  monthLabel: { color: colors.text, fontSize: 15, fontWeight: "700" },

  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.card,
    gap: 10,
  },
  bento: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  bentoLabel: { color: colors.textDim, fontSize: 11, fontWeight: "700" },
  bentoValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  bentoUnit: { color: colors.textDim, fontSize: 11, fontWeight: "700", marginTop: 2 },

  coachCard: { borderRadius: radii.lg, borderWidth: 1, padding: spacing.card, gap: 6 },
  coachReadiness: { fontSize: 12, fontWeight: "700" },
  coachTitle: { fontSize: 18, fontWeight: "800", lineHeight: 24 },
  coachBody: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  rowHighlight: {
    borderColor: "rgba(255,107,43,0.25)",
    backgroundColor: "rgba(255,107,43,0.06)",
  },
  rowIcon: { fontSize: 22, width: 28, textAlign: "center" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  rowSubtitle: { color: colors.textDim, fontSize: 13, marginTop: 2, lineHeight: 18 },
  rowRight: { color: colors.accent, fontSize: 14, fontWeight: "800" },

  section: { gap: 10 },
  sectionTitle: { ...typography.label, color: colors.textDim },
  sectionBody: { gap: 8 },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: {
    backgroundColor: colors.accentGlow,
    borderColor: "rgba(255,107,43,0.35)",
  },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.accentSoft },

  btn: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.06)" },
  btnDanger: { backgroundColor: "rgba(248,113,113,0.12)" },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnTextGhost: { color: colors.textMuted },
  btnTextDanger: { color: colors.error },

  empty: { color: colors.textDim, fontSize: 14, textAlign: "center", paddingVertical: 20 },
  error: { color: colors.error, fontSize: 14, textAlign: "center" },
  success: { color: colors.green, fontSize: 14, textAlign: "center" },

  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.accent, borderRadius: radii.pill },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  cardHeaderBody: { flex: 1 },
  cardHeaderTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  cardHeaderSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
