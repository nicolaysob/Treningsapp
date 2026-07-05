import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "../UserAvatar";
import { colors, radii, shadow } from "../../theme";

export function AccountCard({
  name,
  username,
  image,
  onEdit,
}: {
  name: string | null;
  username: string | null;
  image: string | null;
  onEdit?: () => void;
}) {
  const display = name ?? username ?? "Bruker";

  return (
    <Pressable style={styles.card} onPress={onEdit} disabled={!onEdit}>
      <UserAvatar name={name} username={username} image={image} size="lg" highlight />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{display}</Text>
        {username ? <Text style={styles.handle}>@{username}</Text> : null}
      </View>
      {onEdit ? <Ionicons name="chevron-forward" size={16} color={colors.textDim} /> : null}
    </Pressable>
  );
}

export function SettingsLinkRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: string;
  danger?: boolean;
}) {
  const content = (
    <View style={[styles.row, danger && styles.rowDanger]}>
      <View style={[styles.iconWrap, danger && styles.iconDanger]}>
        <Ionicons name={icon} size={16} color={danger ? colors.error : colors.accentSoft} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ? (
        <Text style={styles.rowRight}>{right}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={14} color={colors.textDim} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export function SettingsSection({
  title,
  children,
  bare,
}: {
  title: string;
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {bare ? children : <View style={styles.sectionCard}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    ...shadow.card,
  },
  body: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.2 },
  handle: { color: colors.textDim, fontSize: 13, marginTop: 2 },

  section: { gap: 8 },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  sectionCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    ...shadow.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: { backgroundColor: "rgba(248,113,113,0.1)" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowTitleDanger: { color: colors.error },
  rowSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  rowRight: { color: colors.textMuted, fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  rowDanger: {},
});
