import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "../UserAvatar";
import { colors, radii } from "../../theme";

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
    <LinearGradient
      colors={["#14121a", "#0c0c0f", "#08080a"]}
      style={styles.card}
    >
      <View style={styles.glow} />
      <View style={styles.row}>
        <UserAvatar name={name} username={username} image={image} size="lg" highlight />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>{display}</Text>
          {username ? <Text style={styles.handle}>@{username}</Text> : null}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.green} />
            <Text style={styles.badgeText}>Verifisert konto</Text>
          </View>
        </View>
      </View>
      {onEdit ? (
        <Pressable style={styles.editBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={colors.accentSoft} />
          <Text style={styles.editText}>Rediger profil</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textDim} />
        </Pressable>
      ) : null}
    </LinearGradient>
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
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.accentSoft} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ? (
        <Text style={styles.rowRight}>{right}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
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
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    overflow: "hidden",
    gap: 14,
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,107,43,0.08)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
  body: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontSize: 20, fontWeight: "800" },
  handle: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  badgeText: { color: colors.green, fontSize: 11, fontWeight: "700" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  editText: { flex: 1, color: colors.accentSoft, fontSize: 14, fontWeight: "700" },

  section: { gap: 8 },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,107,43,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconDanger: { backgroundColor: "rgba(248,113,113,0.1)" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  rowTitleDanger: { color: colors.error },
  rowSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  rowRight: { color: colors.textMuted, fontSize: 13, fontWeight: "700" },
  rowDanger: {},
});
