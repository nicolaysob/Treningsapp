import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { login } from "../api";
import { saveToken } from "../auth";
import { saveConsentAccepted } from "../consent";
import { PRIVACY_TEXT, TERMS_TEXT } from "../legal";
import { AmbientBackground } from "../components/AmbientBackground";
import { ConsentRow, LegalSheet } from "../components/legal/LegalSheet";
import { Button, ErrorText, Input } from "../components/ui";
import { colors, radii, shadow } from "../theme";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = consent && username.trim() && password;

  async function handleLogin() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(username.trim(), password);
      await saveConsentAccepted();
      await saveToken(token);
      onLoggedIn(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Innlogging feilet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AmbientBackground>
        <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="pulse" size={26} color={colors.accent} />
            </View>
            <Text style={styles.title}>Treningsapp</Text>
            <Text style={styles.subtitle}>Logg inn for å fortsette</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Brukernavn"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
            <Input
              placeholder="Passord"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <ConsentRow
              checked={consent}
              onToggle={() => setConsent((v) => !v)}
              onPrivacy={() => setShowPrivacy(true)}
              onTerms={() => setShowTerms(true)}
            />

            {error && <ErrorText text={error} />}

            <Button
              label="Logg inn"
              onPress={() => void handleLogin()}
              disabled={loading || !canSubmit}
              loading={loading}
            />
          </View>

          <Text style={styles.footer}>
            Har du ikke konto? Opprett på nett først.
          </Text>
        </View>
      </AmbientBackground>

      <LegalSheet title="Vilkår for bruk" body={TERMS_TEXT} visible={showTerms} onClose={() => setShowTerms(false)} />
      <LegalSheet title="Personvern" body={PRIVACY_TEXT} visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 28,
  },
  brand: { alignItems: "center" },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.8 },
  subtitle: { marginTop: 6, fontSize: 15, color: colors.textDim },

  form: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
    ...shadow.card,
  },
  footer: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
