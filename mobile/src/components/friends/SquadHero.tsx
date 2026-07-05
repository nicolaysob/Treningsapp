import { Pressable, StyleSheet, Text, View } from "react-native";
import { UserAvatar } from "../UserAvatar";
import { avatarColor } from "../../lib/avatar";
import { colors, radii, shadow } from "../../theme";

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
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Troppen din</Text>
          <Text style={styles.title}>Gjengen</Text>
          <Text style={styles.sub}>
            {count === 0
              ? "Inviter venner til ukentlig duell"
              : `${count} ${count === 1 ? "rival" : "rivaler"} denne uken`}
          </Text>
        </View>
        {pendingCount > 0 ? (
          <View style={styles.pending}>
            <Text style={styles.pendingNum}>{pendingCount}</Text>
            <Text style={styles.pendingLbl}>Nye</Text>
          </View>
        ) : null}
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
            {count > 6 ? (
              <View style={[styles.stackItem, styles.stackOverlap, styles.moreBubble]}>
                <Text style={styles.moreText}>+{count - 6}</Text>
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.power}>
          <Text style={styles.powerLabel}>Totalt</Text>
          <Text style={styles.powerValue}>{count}</Text>
        </View>
      </View>
    </View>
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
    <View style={[styles.tile, { borderColor: `${accent}33` }]}>
      <Text style={styles.rank}>#{rank}</Text>
      <View style={styles.tileAvatar}>
        <UserAvatar name={user.name} username={user.username} size="xl" />
      </View>
      <Text style={styles.tileName} numberOfLines={1}>{first}</Text>
      {user.username ? (
        <Text style={styles.tileHandle} numberOfLines={1}>@{user.username}</Text>
      ) : null}
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
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceRaised,
    padding: 18,
    ...shadow.card,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  copy: { flex: 1 },
  eyebrow: {
    color: colors.accentSoft,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginTop: 4 },
  sub: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  pending: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
  },
  pendingNum: { color: "#fff", fontSize: 18, fontWeight: "800", lineHeight: 20 },
  pendingLbl: { color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },

  stackRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 18 },
  stack: { flexDirection: "row", alignItems: "center" },
  stackItem: { borderWidth: 2, borderColor: colors.surfaceRaised, borderRadius: 999 },
  stackOverlap: { marginLeft: -14 },
  moreBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { color: colors.accentSoft, fontSize: 13, fontWeight: "800" },
  emptySlots: { flexDirection: "row" },
  emptySlot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  emptyOverlap: { marginLeft: -12 },
  emptyQ: { color: colors.textDim, fontSize: 16, fontWeight: "700" },
  power: { alignItems: "flex-end" },
  powerLabel: { color: colors.textDim, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  powerValue: { color: colors.text, fontSize: 32, fontWeight: "800", lineHeight: 34, fontVariant: ["tabular-nums"] },

  tile: {
    width: "48%",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    ...shadow.card,
  },
  rank: {
    alignSelf: "flex-start",
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "800",
  },
  tileAvatar: { marginTop: 4, marginBottom: 8 },
  tileName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  tileHandle: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  removeBtn: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
  },
});
