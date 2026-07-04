import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { login } from "../api";
import { saveToken } from "../auth";
import { saveConsentAccepted } from "../consent";
import { PRIVACY_TEXT, TERMS_TEXT } from "../legal";
import { ConsentRow, LegalSheet } from "../components/legal/LegalSheet";
import { Button, ErrorText, Input } from "../components/ui";
import { colors, radii } from "../theme";

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
      <LinearGradient
        colors={["#120a08", colors.bg, "#080a12"]}
        style={[styles.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.brandGlow} />

        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="barbell" size={28} color={colors.accentSoft} />
          </View>
          <Text style={styles.title}>Treningsapp</Text>
          <Text style={styles.subtitle}>Logg inn for å fortsette til kontoen din</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formLabel}>KONTO</Text>

          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.textDim} />
            <Input
              placeholder="Brukernavn"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textDim} />
            <Input
              placeholder="Passord"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.fieldInput}
            />
          </View>

          <ConsentRow
            checked={consent}
            onToggle={() => setConsent((v) => !v)}
            onPrivacy={() => setShowPrivacy(true)}
            onTerms={() => setShowTerms(true)}
          />

          {error && <ErrorText text={error} />}

          <Button
            label="Logg inn sikkert"
            onPress={() => void handleLogin()}
            disabled={loading || !canSubmit}
            loading={loading}
          />

          <View style={styles.secure}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textDim} />
            <Text style={styles.secureText}>
              Token lagres kryptert på enheten via Secure Store
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Har du ikke konto? Opprett på nett først, deretter logg inn her.
        </Text>
      </LinearGradient>

      <LegalSheet title="Vilkår for bruk" body={TERMS_TEXT} visible={showTerms} onClose={() => setShowTerms(false)} />
      <LegalSheet title="Personvern" body={PRIVACY_TEXT} visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    overflow: "hidden",
    justifyContent: "center",
  },
  brandGlow: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,107,43,0.1)",
  },
  brand: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,107,43,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 30, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  subtitle: { marginTop: 8, fontSize: 14, color: colors.textDim, textAlign: "center" },

  form: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  formLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
  },
  fieldInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  secure: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  secureText: { color: colors.textDim, fontSize: 11, fontWeight: "600" },
  footer: {
    marginTop: 20,
    color: colors.textDim,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
