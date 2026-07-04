import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function ScreenHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  leftAction?: { label: string; onPress: () => void };
  rightAction?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        {leftAction ? (
          <Pressable onPress={leftAction.onPress}>
            <Text style={styles.navBtn}>{leftAction.label}</Text>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
        {rightAction ? (
          <Pressable onPress={rightAction.onPress}>
            <Text style={styles.navBtn}>{rightAction.label}</Text>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function RowCard({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={styles.rowRight}>{right}</Text> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.btn,
        variant === "ghost" && styles.btnGhost,
        variant === "danger" && styles.btnDanger,
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.btnText,
          variant === "ghost" && styles.btnTextGhost,
          variant === "danger" && styles.btnTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  nav: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  navBtn: { color: colors.accent, fontSize: 14, fontWeight: "700", minWidth: 60 },
  navSpacer: { minWidth: 60 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  section: { gap: 8 },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 12,
  },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  rowSubtitle: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  rowRight: { color: colors.accent, fontSize: 14, fontWeight: "800" },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.06)" },
  btnDanger: { backgroundColor: "rgba(248,113,113,0.15)" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  btnTextGhost: { color: colors.textMuted },
  btnTextDanger: { color: "#f87171" },
});
