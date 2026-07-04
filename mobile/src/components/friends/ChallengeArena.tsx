import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../theme";

export function ChallengeArena({
  onSend,
  sending,
}: {
  onSend: (username: string) => Promise<void>;
  sending: boolean;
}) {
  const [username, setUsername] = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSend() {
    const clean = username.trim().replace(/^@/, "");
    if (!clean) return;
    await onSend(clean);
    setUsername("");
  }

  return (
    <LinearGradient
      colors={["#ff6b2b", "#e84d0e", "#7c1d06"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.shine} />
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Ionicons name="flash" size={22} color="#fff" />
        </View>
        <View style={styles.headText}>
          <Text style={styles.kicker}>Ukentlig duell</Text>
          <Text style={styles.headline}>Hvem er neste?</Text>
        </View>
      </View>

      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Text style={styles.at}>@</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="skriv brukernavn"
          placeholderTextColor="rgba(255,255,255,0.45)"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="send"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => void handleSend()}
        />
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
      </View>

      <Pressable
        style={[styles.cta, (!username.trim() || sending) && styles.ctaDisabled]}
        onPress={() => void handleSend()}
        disabled={!username.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator color="#7c1d06" />
        ) : (
          <>
            <Text style={styles.ctaText}>SEND UTFORDRING</Text>
            <Ionicons name="arrow-forward" size={18} color="#7c1d06" />
          </>
        )}
      </Pressable>

      <Text style={styles.hint}>De dukker opp i Duell-fanen når de sier ja</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    padding: 18,
    overflow: "hidden",
    gap: 12,
  },
  shine: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headText: { flex: 1 },
  kicker: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headline: { color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    gap: 6,
  },
  fieldFocused: { borderColor: "rgba(255,255,255,0.55)" },
  at: { color: "#fff", fontSize: 18, fontWeight: "900" },
  input: { flex: 1, color: "#fff", fontSize: 17, fontWeight: "600", paddingVertical: 14 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: radii.md,
    paddingVertical: 15,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: "#7c1d06", fontSize: 14, fontWeight: "900", letterSpacing: 0.8 },
  hint: { color: "rgba(255,255,255,0.65)", fontSize: 11, textAlign: "center", fontWeight: "600" },
});
