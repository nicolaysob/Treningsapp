import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  acceptFriendRequest,
  fetchFriends,
  removeFriendship,
  sendFriendRequest,
  type FriendsData,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { ActionButton, RowCard, ScreenHeader, Section } from "../components/ui";
import { colors, spacing } from "../theme";

const FRIEND_ERRORS: Record<string, string> = {
  notfound: "Fant ingen bruker med det brukernavnet.",
  self: "Du kan ikke legge til deg selv.",
  exists: "Forespørsel finnes allerede, eller dere er venner.",
};

export function FriendsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<FriendsData | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetchFriends(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente venner");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function handleSend() {
    if (!username.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendFriendRequest(token, username.trim());
      setUsername("");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Feil";
      setError(FRIEND_ERRORS[msg] ?? msg);
    } finally {
      setSending(false);
    }
  }

  async function handleAccept(id: string) {
    await acceptFriendRequest(token, id);
    await load();
  }

  async function handleRemove(id: string) {
    await removeFriendship(token, id);
    await load();
  }

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))} tintColor={colors.accent} />
      }
    >
      <ScreenHeader
        title="Venner"
        subtitle={`${data?.stats.friendCount ?? 0} venner · ${data?.stats.pendingCount ?? 0} ventende`}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Section title="Legg til venn">
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Brukernavn"
          autoCapitalize="none"
          placeholderTextColor={colors.textDim}
        />
        <ActionButton
          label={sending ? "Sender…" : "Send forespørsel"}
          onPress={() => void handleSend()}
          disabled={sending || !username.trim()}
        />
      </Section>

      {!!data?.incoming.length && (
        <Section title="Innkommende">
          {data.incoming.map((r) => (
            <View key={r.id} style={styles.actionRow}>
              <RowCard
                title={r.user.name ?? r.user.username ?? "Ukjent"}
                subtitle={`@${r.user.username ?? "?"}`}
              />
              <View style={styles.btnRow}>
                <ActionButton label="Godta" onPress={() => void handleAccept(r.id)} />
                <ActionButton label="Avslå" variant="danger" onPress={() => void handleRemove(r.id)} />
              </View>
            </View>
          ))}
        </Section>
      )}

      {!!data?.outgoing.length && (
        <Section title="Sendt">
          {data.outgoing.map((r) => (
            <View key={r.id} style={styles.actionRow}>
              <RowCard title={r.user.name ?? r.user.username ?? "Ukjent"} subtitle="Venter…" />
              <ActionButton label="Angre" variant="ghost" onPress={() => void handleRemove(r.id)} />
            </View>
          ))}
        </Section>
      )}

      <Section title="Gjengen">
        {!data?.friends.length ? (
          <Text style={styles.empty}>Ingen venner ennå</Text>
        ) : (
          data.friends.map(({ friendshipId, user }) => (
            <View key={friendshipId} style={styles.actionRow}>
              <RowCard title={user.name ?? "Ukjent"} subtitle={`@${user.username ?? "?"}`} />
              <ActionButton
                label="Fjern"
                variant="danger"
                onPress={() => void handleRemove(friendshipId)}
              />
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 32, gap: spacing.gap },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 15,
  },
  actionRow: { gap: 8 },
  btnRow: { flexDirection: "row", gap: 8 },
  empty: { color: colors.textDim, fontSize: 14 },
  error: { color: "#f87171", fontSize: 14 },
});
