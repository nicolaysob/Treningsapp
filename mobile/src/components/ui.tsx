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
import { AmbientBackground } from "./AmbientBackground";
import { colors, radii, spacing, shadow, type as typography, bento, coachTone } from "../theme";

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
    <AmbientBackground>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.screenContent,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: 100 + insets.bottom },
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
    </AmbientBackground>
  );
}

export function LoadingScreen() {
  return (
    <AmbientBackground>
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    </AmbientBackground>
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
    <View style={styles.hero}>
      <View style={styles.heroRow}>
        <View style={styles.heroBody}>
          {label ? <Text style={styles.heroLabel}>{label}</Text> : null}
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function StatChip({
  label,
  value,
  tint = colors.text,
}: {
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipLabel}>{label}</Text>
      <Text style={[styles.statChipValue, { color: tint }]}>{value}</Text>
    </View>
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
  showReadiness = true,
  footer,
}: {
  tone?: keyof typeof coachTone;
  readiness?: number | null;
  title: string;
  body?: string;
  showReadiness?: boolean;
  footer?: string;
}) {
  const t = coachTone[tone] ?? coachTone.balanced;
  return (
    <LinearGradient colors={[...t.bg]} style={[styles.coachCard, { borderColor: t.border }]}>
      <View style={styles.coachTop}>
        <Text style={styles.coachEyebrow}>✦ Coach</Text>
        {showReadiness && readiness != null ? (
          <View style={styles.readinessPill}>
            <Text style={[styles.coachReadiness, { color: t.text }]}>{readiness}% form</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.coachTitle, { color: t.text }]}>{title}</Text>
      {body ? <Text style={styles.coachBody}>{body}</Text> : null}
      {footer ? <Text style={styles.coachFooter}>{footer}</Text> : null}
    </LinearGradient>
  );
}

export function RowItem({
  title,
  subtitle,
  right,
  icon,
  highlight,
  boxed,
  divider,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  icon?: string;
  highlight?: boolean;
  boxed?: boolean;
  divider?: boolean;
}) {
  return (
    <View style={[divider && styles.rowDivider]}>
      <View style={[styles.row, boxed && styles.rowBoxed, highlight && styles.rowHighlight]}>
        {icon ? <Text style={styles.rowIcon}>{icon}</Text> : null}
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <Text style={styles.rowRight}>{right}</Text> : null}
      </View>
    </View>
  );
}

/* ─── Form ─── */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionSurface}>{children}</View>
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
      <LinearGradient
        colors={[colors.accent, colors.accentSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${Math.min(100, percent)}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  screenContent: { paddingHorizontal: spacing.screen, gap: spacing.section },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  hero: { paddingVertical: 4, marginBottom: 2 },
  heroRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  heroBody: { flex: 1, minWidth: 0 },
  heroLabel: { ...typography.eyebrow, color: colors.accentSoft, marginBottom: 4 },
  heroTitle: { ...typography.display, color: colors.text },
  heroSubtitle: { ...typography.caption, color: colors.textDim, marginTop: 6, lineHeight: 18 },

  statChip: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  statChipLabel: { ...typography.label, color: colors.textDim, fontSize: 10 },
  statChipValue: { ...typography.stat, fontSize: 18 },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 8,
    ...shadow.card,
  },
  navArrow: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  navArrowText: { color: colors.text, fontSize: 24, fontWeight: "300" },
  navArrowDisabled: { opacity: 0.25 },
  monthLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },

  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.card,
    gap: 10,
    ...shadow.card,
  },
  bento: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  bentoLabel: { color: colors.textDim, fontSize: 10, fontWeight: "700" },
  bentoValue: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  bentoUnit: { color: colors.textDim, fontSize: 10, fontWeight: "700", marginTop: 1 },

  coachCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.card,
    gap: 8,
    ...shadow.card,
  },
  coachTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  coachEyebrow: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  readinessPill: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  coachReadiness: { fontSize: 11, fontWeight: "700" },
  coachTitle: { fontSize: 18, fontWeight: "800", lineHeight: 24, letterSpacing: -0.3 },
  coachBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  coachFooter: { color: colors.accentSoft, fontSize: 12, fontWeight: "600", marginTop: 2 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowBoxed: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
  },
  rowHighlight: {
    borderColor: "rgba(255,107,53,0.2)",
    backgroundColor: colors.accentSubtle,
  },
  rowIcon: { fontSize: 17, width: 22, textAlign: "center" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  rowSubtitle: { color: colors.textDim, fontSize: 12, marginTop: 2, lineHeight: 16 },
  rowRight: { color: colors.textMuted, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },

  section: { gap: 8 },
  sectionTitle: { ...typography.label, color: colors.textDim, paddingHorizontal: 2 },
  sectionSurface: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    ...shadow.card,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: {
    backgroundColor: colors.accentGlow,
    borderColor: "rgba(255,107,53,0.35)",
  },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.accentSoft },

  btn: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    ...shadow.card,
  },
  btnGhost: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnDanger: { backgroundColor: "rgba(248,113,113,0.12)", shadowOpacity: 0, elevation: 0 },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnTextGhost: { color: colors.text },
  btnTextDanger: { color: colors.error },

  empty: { color: colors.textDim, fontSize: 14, textAlign: "center", paddingVertical: 24 },
  error: { color: colors.error, fontSize: 14, textAlign: "center" },
  success: { color: colors.green, fontSize: 14, textAlign: "center" },

  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radii.pill },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  cardHeaderBody: { flex: 1 },
  cardHeaderTitle: { ...typography.title, fontSize: 17, color: colors.text },
  cardHeaderSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
