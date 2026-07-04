import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserAvatar } from "../UserAvatar";
import { colors, radii } from "../../theme";

type User = { name: string | null; username: string | null };

export function IncomingSpotlight({
  requests,
  onAccept,
  onDecline,
}: {
  requests: Array<{ id: string; user: User }>;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  if (!requests.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>⚡ Vil duelle</Text>
        <View style={styles.count}>
          <Text style={styles.countText}>{requests.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {requests.map((r) => {
          const display = r.user.name ?? r.user.username ?? "Ukjent";
          const first = display.split(" ")[0];
          return (
            <LinearGradient
              key={r.id}
              colors={["#1a120e", "#120c08", "#0a0a0c"]}
              style={styles.card}
            >
              <View style={styles.cardStripe} />
              <Text style={styles.cardKicker}>Ny utfordrer</Text>
              <View style={styles.cardAvatar}>
                <UserAvatar name={r.user.name} username={r.user.username} size="xl" highlight />
              </View>
              <Text style={styles.cardName}>{first}</Text>
              {r.user.username ? (
                <Text style={styles.cardHandle}>@{r.user.username}</Text>
              ) : null}
              <Text style={styles.cardBody}>Vil bli med i troppen din og konkurrere hver uke.</Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.accept} onPress={() => onAccept(r.id)}>
                  <Text style={styles.acceptText}>Ta imot ⚔️</Text>
                </Pressable>
                <Pressable style={styles.decline} onPress={() => onDecline(r.id)}>
                  <Text style={styles.declineText}>Ignorer</Text>
                </Pressable>
              </View>
            </LinearGradient>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function OutgoingStrip({
  requests,
  onCancel,
}: {
  requests: Array<{ id: string; user: User }>;
  onCancel: (id: string) => void;
}) {
  if (!requests.length) return null;

  return (
    <View style={styles.outWrap}>
      <Text style={styles.outTitle}>Ute på feltet</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outScroll}>
        {requests.map((r) => (
          <Pressable key={r.id} style={styles.outChip} onPress={() => onCancel(r.id)}>
            <UserAvatar name={r.user.name} username={r.user.username} size="sm" />
            <View>
              <Text style={styles.outName} numberOfLines={1}>
                {r.user.name?.split(" ")[0] ?? r.user.username ?? "?"}
              </Text>
              <Text style={styles.outHint}>Venter · trykk for å angre</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function EmptyArena() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>⚔️</Text>
      <Text style={styles.emptyTitle}>Arenaen er tom</Text>
      <Text style={styles.emptyBody}>
        Send en utfordring ovenfor. Når de sier ja, dukker de opp her — og i ukentlig duell.
      </Text>
      <View style={styles.emptySteps}>
        <Step n="1" text="Søk brukernavn" />
        <Step n="2" text="Send utfordring" />
        <Step n="3" text="Kjemp om TSS" />
      </View>
    </View>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepN}>{n}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900" },
  count: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  scroll: { gap: 12, paddingRight: 4 },
  card: {
    width: 260,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.25)",
    padding: 18,
    overflow: "hidden",
  },
  cardStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
  },
  cardKicker: {
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardAvatar: { alignSelf: "center", marginVertical: 14 },
  cardName: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  cardHandle: { color: colors.textDim, fontSize: 13, textAlign: "center", marginTop: 2 },
  cardBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  cardActions: { gap: 8 },
  accept: {
    backgroundColor: colors.green,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptText: { color: "#042f1a", fontSize: 14, fontWeight: "900" },
  decline: { alignItems: "center", paddingVertical: 6 },
  declineText: { color: colors.textDim, fontSize: 12, fontWeight: "700" },

  outWrap: { gap: 8 },
  outTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  outScroll: { gap: 8 },
  outChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingRight: 16,
  },
  outName: { color: colors.textMuted, fontSize: 13, fontWeight: "800", maxWidth: 100 },
  outHint: { color: colors.textDim, fontSize: 10, marginTop: 1 },

  empty: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.15)",
    backgroundColor: "rgba(255,107,43,0.04)",
    gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: "900" },
  emptyBody: { color: colors.textDim, fontSize: 14, textAlign: "center", lineHeight: 21 },
  emptySteps: { flexDirection: "row", gap: 8, marginTop: 12 },
  step: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 90,
    gap: 4,
  },
  stepN: { color: colors.accent, fontSize: 16, fontWeight: "900" },
  stepText: { color: colors.textDim, fontSize: 10, fontWeight: "700", textAlign: "center" },
});
