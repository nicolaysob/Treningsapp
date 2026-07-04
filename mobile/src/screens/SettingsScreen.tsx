import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { fetchSettings, triggerSync, type SettingsData } from "../api";
import { useAuth } from "../context/AuthContext";
import { clearToken } from "../auth";
import { PRIVACY_TEXT, TERMS_TEXT } from "../legal";
import { LegalSheet } from "../components/legal/LegalSheet";
import {
  AccountCard,
  SettingsLinkRow,
  SettingsSection,
} from "../components/settings/AccountCard";
import { API_URL } from "../config";
import {
  Button,
  ErrorText,
  HeroHeader,
  LoadingScreen,
  Screen,
  SuccessText,
} from "../components/ui";
import { colors } from "../theme";

const DIVIDER = () => <View style={styles.divider} />;

export function SettingsScreen() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
      setMessage("Synk startet — vent 1–2 min og dra ned for å oppdatere.");
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

  if (loading && !data) return <LoadingScreen />;

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const trainingLabel = data?.training.isActive
    ? `Aktiv · ${data.training.method ?? "satt"}`
    : data?.training.needsHrMaxSetup
      ? "Trenger makspuls"
      : "Ikke satt";

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      <HeroHeader title="Mer" subtitle="Konto, tilkoblinger og personvern" />

      {error && <ErrorText text={error} />}
      {message && <SuccessText text={message} />}

      <SettingsSection title="Konto" bare>
        <AccountCard
          name={data?.profile.name ?? null}
          username={data?.profile.username ?? null}
          image={data?.profile.image ?? null}
        />
      </SettingsSection>

      <SettingsSection title="Tilkoblinger">
        <SettingsLinkRow
          icon="bicycle-outline"
          title="Strava"
          subtitle={data?.stravaConnected ? "Tilkoblet — administrer på nett" : "Koble til via nettappen"}
          right={data?.stravaConnected ? "●" : undefined}
          onPress={() => void Linking.openURL(`${API_URL}/settings`)}
        />
        <DIVIDER />
        <View style={styles.syncBlock}>
          <View style={styles.syncText}>
            <Text style={styles.syncTitle}>Synkroniser nå</Text>
            <Text style={styles.syncSub}>Henter siste aktiviteter fra Strava</Text>
          </View>
          <Button
            label={syncing ? "Synker…" : "Synk"}
            onPress={() => void handleSync()}
            disabled={syncing || !data?.stravaConnected}
            loading={syncing}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Trening">
        <SettingsLinkRow
          icon="fitness-outline"
          title="Terskler og mål"
          subtitle={trainingLabel}
          onPress={() => void Linking.openURL(`${API_URL}/settings/training`)}
        />
        <DIVIDER />
        <SettingsLinkRow
          icon="analytics-outline"
          title="TSS-dekning"
          subtitle="Andel økter med beregnet belastning"
          right={`${Math.round((data?.training.tssCoverage ?? 0) * 100)}%`}
        />
        {data?.training.weeklyTssGoal ? (
          <>
            <DIVIDER />
            <SettingsLinkRow icon="flag-outline" title="Ukemål" right={`${data.training.weeklyTssGoal} TSS`} />
          </>
        ) : null}
        {data?.training.raceName ? (
          <>
            <DIVIDER />
            <SettingsLinkRow icon="trophy-outline" title="Race" subtitle={data.training.raceName} />
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Personvern og vilkår">
        <SettingsLinkRow icon="document-text-outline" title="Vilkår for bruk" onPress={() => setShowTerms(true)} />
        <DIVIDER />
        <SettingsLinkRow icon="lock-closed-outline" title="Personvernerklæring" onPress={() => setShowPrivacy(true)} />
        <DIVIDER />
        <View style={styles.legalNote}>
          <Text style={styles.legalNoteText}>
            Du godtok vilkår og personvern ved innlogging. Token lagres kryptert på enheten.
          </Text>
        </View>
      </SettingsSection>

      <SettingsSection title="App">
        <SettingsLinkRow icon="information-circle-outline" title="Versjon" right={version} />
        <DIVIDER />
        <SettingsLinkRow
          icon="globe-outline"
          title="Åpne nettappen"
          subtitle={API_URL.replace("https://", "")}
          onPress={() => void Linking.openURL(API_URL)}
        />
      </SettingsSection>

      <Button label="Logg ut" variant="danger" onPress={() => void handleLogout()} />

      <LegalSheet title="Vilkår for bruk" body={TERMS_TEXT} visible={showTerms} onClose={() => setShowTerms(false)} />
      <LegalSheet title="Personvern" body={PRIVACY_TEXT} visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: colors.cardBorder, marginHorizontal: 14 },
  syncBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  syncText: { flex: 1 },
  syncTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  syncSub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  legalNote: { padding: 14 },
  legalNoteText: { color: colors.textDim, fontSize: 12, lineHeight: 18 },
});
