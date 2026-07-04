import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  acceptFriendRequest,
  fetchFriends,
  removeFriendship,
  sendFriendRequest,
  type FriendsData,
} from "../api";
import { useAuth } from "../context/AuthContext";
import { ChallengeArena } from "../components/friends/ChallengeArena";
import {
  EmptyArena,
  IncomingSpotlight,
  OutgoingStrip,
} from "../components/friends/IncomingSpotlight";
import { RivalTile, SquadHero } from "../components/friends/SquadHero";
import { ErrorText, LoadingScreen, Screen, SuccessText } from "../components/ui";
import { colors } from "../theme";

const FRIEND_ERRORS: Record<string, string> = {
  notfound: "Fant ingen bruker med det brukernavnet.",
  self: "Du kan ikke utfordre deg selv.",
  exists: "Forespørsel finnes allerede, eller dere er allerede i gjengen.",
};

export function FriendsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3500);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSend(username: string) {
    setSending(true);
    setError(null);
    try {
      await sendFriendRequest(token, username);
      setSuccess(`⚡ Utfordring sendt til @${username}`);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Feil";
      setError(FRIEND_ERRORS[msg] ?? msg);
    } finally {
      setSending(false);
    }
  }

  if (loading && !data) return <LoadingScreen />;

  const friends = data?.friends ?? [];
  const friendUsers = friends.map((f) => f.user);
  const pendingCount = data?.stats.pendingCount ?? 0;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      <SquadHero friends={friendUsers} pendingCount={pendingCount} />

      <ChallengeArena onSend={handleSend} sending={sending} />

      {error && <ErrorText text={error} />}
      {success && <SuccessText text={success} />}

      {!!data?.incoming?.length && (
        <IncomingSpotlight
          requests={data.incoming}
          onAccept={(id) => void acceptFriendRequest(token, id).then(load)}
          onDecline={(id) => void removeFriendship(token, id).then(load)}
        />
      )}

      {!!data?.outgoing?.length && (
        <OutgoingStrip
          requests={data.outgoing}
          onCancel={(id) => void removeFriendship(token, id).then(load)}
        />
      )}

      <View style={styles.roster}>
        <Text style={styles.rosterTitle}>Rivaler</Text>
        {!friends.length ? (
          <EmptyArena />
        ) : (
          <View style={styles.grid}>
            {friends.map(({ friendshipId, user }, index) => (
              <RivalTile
                key={friendshipId}
                user={user}
                rank={index + 1}
                onRemove={() => void removeFriendship(token, friendshipId).then(load)}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roster: { gap: 12 },
  rosterTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
