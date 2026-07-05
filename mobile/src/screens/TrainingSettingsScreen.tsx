import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchSettings,
  saveHrMaxQuick,
  updateTrainingGoals,
  updateTrainingThresholds,
  type SettingsData,
} from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  ErrorText,
  HeroHeader,
  Input,
  LoadingScreen,
  Screen,
  Section,
  SuccessText,
} from "../components/ui";
import { formatSecondsToPace, parseOptionalInt, parsePaceToSeconds } from "../lib/pace";
import type { SettingsStackParamList } from "../navigation/SettingsStack";
import { colors, radii } from "../theme";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function TrainingSettingsScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [savingGoals, setSavingGoals] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [weeklyTssGoal, setWeeklyTssGoal] = useState("");
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [ftpWatts, setFtpWatts] = useState("");
  const [thresholdPace, setThresholdPace] = useState("");
  const [hrThresholdBpm, setHrThresholdBpm] = useState("");
  const [hrMaxBpm, setHrMaxBpm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const applyData = useCallback((settings: SettingsData) => {
    setData(settings);
    setWeeklyTssGoal(settings.training.weeklyTssGoal?.toString() ?? "");
    setRaceName(settings.training.raceName ?? "");
    setRaceDate(settings.training.raceDate?.slice(0, 10) ?? "");
    setFtpWatts(settings.training.ftpWatts?.toString() ?? "");
    setThresholdPace(
      settings.training.thresholdPaceSecPerKm
        ? formatSecondsToPace(settings.training.thresholdPaceSecPerKm)
        : "",
    );
    setHrThresholdBpm(settings.training.hrThresholdBpm?.toString() ?? "");
    setHrMaxBpm(settings.training.hrMaxBpm?.toString() ?? "");
  }, []);

  useEffect(() => {
    void fetchSettings(token)
      .then(applyData)
      .catch((err) => setError(err instanceof Error ? err.message : "Kunne ikke hente innstillinger"))
      .finally(() => setLoading(false));
  }, [token, applyData]);

  async function handleSaveGoals() {
    setSavingGoals(true);
    setError(null);
    setMessage(null);
    try {
      await updateTrainingGoals(token, {
        weeklyTssGoal: parseOptionalInt(weeklyTssGoal),
        raceName: raceName.trim() || null,
        raceDate: raceDate.trim() || null,
      });
      setMessage("Mål lagret");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke lagre mål");
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleSaveThresholds() {
    setSavingThresholds(true);
    setError(null);
    setMessage(null);
    try {
      if (thresholdPace.trim() && !parsePaceToSeconds(thresholdPace)) {
        throw new Error("Tempo må være på format min:sek (f.eks. 4:30)");
      }
      await updateTrainingThresholds(token, {
        ftpWatts: parseOptionalInt(ftpWatts),
        thresholdPaceMinPerKm: thresholdPace.trim() || null,
        hrThresholdBpm: parseOptionalInt(hrThresholdBpm),
        hrMaxBpm: parseOptionalInt(hrMaxBpm),
      });
      setMessage("Terskler lagret");
      const refreshed = await fetchSettings(token);
      applyData(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke lagre terskler");
    } finally {
      setSavingThresholds(false);
    }
  }

  async function handleQuickHr() {
    const value = parseOptionalInt(hrMaxBpm);
    if (!value) {
      setError("Skriv inn makspuls først");
      return;
    }
    setError(null);
    try {
      await saveHrMaxQuick(token, value);
      setMessage("Makspuls lagret");
      const refreshed = await fetchSettings(token);
      applyData(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke lagre makspuls");
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <HeroHeader
        title="Terskler og mål"
        subtitle="Brukes til TSS, soner og coach"
        right={
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
          </Pressable>
        }
      />

      {error && <ErrorText text={error} />}
      {message && <SuccessText text={message} />}

      {data?.training.needsHrMaxSetup ? (
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>Sett makspuls</Text>
          <Text style={styles.alertBody}>
            Coach og pulssoner trenger makspuls for å fungere optimalt.
          </Text>
          <Button label="Lagre makspuls nå" variant="ghost" onPress={() => void handleQuickHr()} />
        </View>
      ) : null}

      <Section title="Ukemål og race">
        <FormField label="Ukemål TSS">
          <Input
            value={weeklyTssGoal}
            onChangeText={setWeeklyTssGoal}
            placeholder="f.eks. 400"
            keyboardType="number-pad"
          />
        </FormField>
        <FormField label="Race-navn">
          <Input value={raceName} onChangeText={setRaceName} placeholder="f.eks. Oslo Maraton" />
        </FormField>
        <FormField label="Race-dato (YYYY-MM-DD)">
          <Input
            value={raceDate}
            onChangeText={setRaceDate}
            placeholder="2026-09-20"
            autoCapitalize="none"
          />
        </FormField>
        <Button
          label={savingGoals ? "Lagrer…" : "Lagre mål"}
          onPress={() => void handleSaveGoals()}
          loading={savingGoals}
        />
      </Section>

      <Section title="Terskler">
        <FormField label="FTP (watt)">
          <Input value={ftpWatts} onChangeText={setFtpWatts} keyboardType="number-pad" placeholder="250" />
        </FormField>
        <FormField label="Terskeltempo (min:sek / km)">
          <Input value={thresholdPace} onChangeText={setThresholdPace} placeholder="4:30" />
        </FormField>
        <FormField label="Terskelpuls (bpm)">
          <Input
            value={hrThresholdBpm}
            onChangeText={setHrThresholdBpm}
            keyboardType="number-pad"
            placeholder="165"
          />
        </FormField>
        <FormField label="Makspuls (bpm)">
          <Input value={hrMaxBpm} onChangeText={setHrMaxBpm} keyboardType="number-pad" placeholder="190" />
        </FormField>
        <Button
          label={savingThresholds ? "Lagrer…" : "Lagre terskler"}
          onPress={() => void handleSaveThresholds()}
          loading={savingThresholds}
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  field: { gap: 8 },
  fieldLabel: { color: colors.textDim, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  alert: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
    padding: 14,
    gap: 8,
  },
  alertTitle: { color: "#fcd34d", fontSize: 15, fontWeight: "800" },
  alertBody: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
