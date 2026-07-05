import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { UserAvatar } from "../UserAvatar";
import { colors, radii, shadow } from "../../theme";

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
        <Text style={styles.title}>Vil duelle</Text>
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
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardKicker}>Ny utfordrer</Text>
              <View style={styles.cardAvatar}>
                <UserAvatar name={r.user.name} username={r.user.username} size="xl" highlight />
              </View>
              <Text style={styles.cardName}>{first}</Text>
              {r.user.username ? (
                <Text style={styles.cardHandle}>@{r.user.username}</Text>
              ) : null}
              <Text style={styles.cardBody}>Vil bli med i troppen og konkurrere hver uke.</Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.accept} onPress={() => onAccept(r.id)}>
                  <Text style={styles.acceptText}>Ta imot</Text>
                </Pressable>
                <Pressable style={styles.decline} onPress={() => onDecline(r.id)}>
                  <Text style={styles.declineText}>Ignorer</Text>
                </Pressable>
              </View>
            </View>
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
      <Text style={styles.outTitle}>Venter på svar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outScroll}>
        {requests.map((r) => (
          <Pressable key={r.id} style={styles.outChip} onPress={() => onCancel(r.id)}>
            <UserAvatar name={r.user.name} username={r.user.username} size="sm" />
            <View>
              <Text style={styles.outName} numberOfLines={1}>
                {r.user.name?.split(" ")[0] ?? r.user.username ?? "?"}
              </Text>
              <Text style={styles.outHint}>Trykk for å angre</Text>
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
      <Text style={styles.emptyTitle}>Ingen rivaler ennå</Text>
      <Text style={styles.emptyBody}>
        Send en utfordring ovenfor. Når de sier ja, dukker de opp her og i Duell-fanen.
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
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  count: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  scroll: { gap: 10, paddingRight: 4 },
  card: {
    width: 240,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    ...shadow.card,
  },
  cardKicker: {
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardAvatar: { alignSelf: "center", marginVertical: 12 },
  cardName: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
  cardHandle: { color: colors.textDim, fontSize: 12, textAlign: "center", marginTop: 2 },
  cardBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  cardActions: { gap: 6 },
  accept: {
    backgroundColor: colors.green,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  acceptText: { color: "#042f1a", fontSize: 14, fontWeight: "700" },
  decline: { alignItems: "center", paddingVertical: 4 },
  declineText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },

  outWrap: { gap: 8 },
  outTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  outScroll: { gap: 8 },
  outChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingRight: 16,
  },
  outName: { color: colors.textMuted, fontSize: 13, fontWeight: "700", maxWidth: 100 },
  outHint: { color: colors.textDim, fontSize: 10, marginTop: 1 },

  empty: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    gap: 8,
  },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  emptyBody: { color: colors.textDim, fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptySteps: { flexDirection: "row", gap: 8, marginTop: 10 },
  step: {
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minWidth: 84,
    gap: 4,
  },
  stepN: { color: colors.accent, fontSize: 14, fontWeight: "800" },
  stepText: { color: colors.textDim, fontSize: 10, fontWeight: "600", textAlign: "center" },
});
