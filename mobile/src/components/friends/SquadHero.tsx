import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserAvatar } from "../UserAvatar";
import { avatarColor } from "../../lib/avatar";
import { colors, radii } from "../../theme";

type Friend = { name: string | null; username: string | null };

export function SquadHero({
  friends,
  pendingCount,
}: {
  friends: Friend[];
  pendingCount: number;
}) {
  const count = friends.length;
  const shown = friends.slice(0, 6);

  return (
    <LinearGradient
      colors={["#1c1008", "#0a0a0c", "#050508"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <Text style={styles.ghost}>{count || "?"}</Text>
      <View style={styles.glowA} />
      <View style={styles.glowB} />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>Troppen din</Text>
          <Text style={styles.title}>GJENGEN</Text>
          <Text style={styles.sub}>
            {count === 0
              ? "Tom arena — fyll den opp"
              : `${count} ${count === 1 ? "rival" : "rivaler"} i ukentlig duell`}
          </Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pending}>
            <Text style={styles.pendingNum}>{pendingCount}</Text>
            <Text style={styles.pendingLbl}>NYE</Text>
          </View>
        )}
      </View>

      <View style={styles.stackRow}>
        {count === 0 ? (
          <View style={styles.emptySlots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.emptySlot, i > 0 && styles.emptyOverlap]}>
                <Text style={styles.emptyQ}>?</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.stack}>
            {shown.map((f, i) => (
              <View key={`${f.username}-${i}`} style={[styles.stackItem, i > 0 && styles.stackOverlap]}>
                <UserAvatar name={f.name} username={f.username} size="lg" />
              </View>
            ))}
            {count > 6 && (
              <View style={[styles.stackItem, styles.stackOverlap, styles.moreBubble]}>
                <Text style={styles.moreText}>+{count - 6}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.power}>
          <Text style={styles.powerLabel}>Tropp</Text>
          <Text style={styles.powerValue}>{count}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export function RivalTile({
  user,
  rank,
  onRemove,
}: {
  user: Friend;
  rank: number;
  onRemove: () => void;
}) {
  const label = user.name ?? user.username ?? "?";
  const first = (user.name ?? user.username ?? "?").split(" ")[0];
  const accent = avatarColor(label);

  return (
    <View style={[styles.tile, { borderColor: `${accent}55` }]}>
      <LinearGradient
        colors={[`${accent}22`, "rgba(0,0,0,0.5)"]}
        style={styles.tileBg}
      />
      <Text style={styles.rank}>#{rank}</Text>
      <View style={styles.tileAvatar}>
        <UserAvatar name={user.name} username={user.username} size="xl" />
      </View>
      <Text style={styles.tileName} numberOfLines={1}>{first}</Text>
      {user.username ? (
        <Text style={styles.tileHandle} numberOfLines={1}>@{user.username}</Text>
      ) : null}
      <View style={styles.vsRow}>
        <Text style={styles.vs}>VS</Text>
        <Text style={styles.duel}>Duell</Text>
      </View>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.removeBtn}>Fjern</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.3)",
    padding: 20,
    overflow: "hidden",
    minHeight: 180,
  },
  ghost: {
    position: "absolute",
    right: -8,
    bottom: -28,
    fontSize: 140,
    fontWeight: "900",
    color: "rgba(255,107,43,0.07)",
  },
  glowA: {
    position: "absolute",
    top: -60,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,107,43,0.15)",
  },
  glowB: {
    position: "absolute",
    bottom: -40,
    right: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(77,159,255,0.08)",
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: {
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 34, fontWeight: "900", letterSpacing: -1, marginTop: 2 },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 4, maxWidth: 220 },
  pending: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 52,
  },
  pendingNum: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 24 },
  pendingLbl: { color: "rgba(255,255,255,0.85)", fontSize: 8, fontWeight: "800", letterSpacing: 1 },

  stackRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 20 },
  stack: { flexDirection: "row", alignItems: "center" },
  stackItem: { borderWidth: 3, borderColor: colors.bg, borderRadius: 999 },
  stackOverlap: { marginLeft: -18 },
  moreBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,107,43,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { color: colors.accentSoft, fontSize: 14, fontWeight: "900" },
  emptySlots: { flexDirection: "row" },
  emptySlot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,107,43,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,107,43,0.05)",
  },
  emptyOverlap: { marginLeft: -14 },
  emptyQ: { color: "rgba(255,107,43,0.5)", fontSize: 20, fontWeight: "800" },
  power: { alignItems: "flex-end" },
  powerLabel: { color: colors.textDim, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  powerValue: { color: colors.accentSoft, fontSize: 42, fontWeight: "900", lineHeight: 44 },

  tile: {
    width: "48%",
    borderRadius: radii.lg,
    borderWidth: 1.5,
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#0a0a0c",
  },
  tileBg: { ...StyleSheet.absoluteFillObject },
  rank: {
    position: "absolute",
    top: 10,
    left: 12,
    color: "rgba(255,255,255,0.25)",
    fontSize: 13,
    fontWeight: "900",
  },
  tileAvatar: { marginTop: 8, marginBottom: 10 },
  tileName: { color: colors.text, fontSize: 17, fontWeight: "900" },
  tileHandle: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  vsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  vs: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(255,107,43,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  duel: { color: colors.textDim, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  removeBtn: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
