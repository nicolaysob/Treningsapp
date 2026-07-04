import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchSettings, triggerSync, type SettingsData } from "../api";
import { useAuth } from "../context/AuthContext";
import { clearToken } from "../auth";
import { ActionButton, RowCard, ScreenHeader, Section } from "../components/ui";
import { colors, spacing } from "../theme";

export function SettingsScreen() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetchSettings(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente innstillinger");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      await triggerSync(token);
      setMessage("Synk startet. Vent 1–2 min og dra ned for å oppdatere.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Synk feilet");
    } finally {
      setSyncing(false);
    }
  }

  async function handleLogout() {
    await clearToken();
    logout();
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
      <ScreenHeader title="Mer" subtitle="Konto og synk" />
      {error && <Text style={styles.error}>{error}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}

      <Section title="Konto">
        <RowCard title="Navn" right={data?.profile.name ?? "—"} />
        <RowCard title="Brukernavn" right={`@${data?.profile.username ?? "?"}`} />
      </Section>

      <Section title="Strava">
        <RowCard
          title="Tilkobling"
          right={data?.stravaConnected ? "Koblet" : "Ikke koblet"}
          subtitle={
            data?.stravaConnected
              ? "Kobling gjøres på nett. Synk fungerer her."
              : "Koble Strava på nett først"
          }
        />
        <ActionButton
          label={syncing ? "Synker…" : "Synk nå"}
          onPress={() => void handleSync()}
          disabled={syncing || !data?.stravaConnected}
        />
      </Section>

      <Section title="Trening">
        <RowCard
          title="Terskler"
          right={data?.training.isActive ? "Aktiv" : "Mangler"}
          subtitle={
            data?.training.method
              ? `Metode: ${data.training.method}`
              : "Sett FTP/tempo/puls på nett"
          }
        />
        <RowCard
          title="TSS-dekning"
          right={`${Math.round((data?.training.tssCoverage ?? 0) * 100)}%`}
        />
        {data?.training.weeklyTssGoal ? (
          <RowCard title="Ukemål TSS" right={String(data.training.weeklyTssGoal)} />
        ) : null}
        {data?.training.raceName ? (
          <RowCard title="Race" subtitle={data.training.raceName} />
        ) : null}
      </Section>

      <ActionButton label="Logg ut" variant="ghost" onPress={() => void handleLogout()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 32, gap: spacing.gap },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  error: { color: "#f87171", fontSize: 14 },
  message: { color: colors.green, fontSize: 14 },
});
