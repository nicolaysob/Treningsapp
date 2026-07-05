import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadow } from "../../theme";

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
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Ionicons name="flash" size={18} color={colors.accent} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.kicker}>Ukentlig duell</Text>
          <Text style={styles.headline}>Inviter en rival</Text>
        </View>
      </View>

      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Text style={styles.at}>@</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="brukernavn"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="send"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => void handleSend()}
        />
        <Ionicons name="search" size={16} color={colors.textDim} />
      </View>

      <Pressable
        style={[styles.cta, (!username.trim() || sending) && styles.ctaDisabled]}
        onPress={() => void handleSend()}
        disabled={!username.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Send utfordring</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  headText: { flex: 1 },
  kicker: {
    color: colors.accentSoft,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headline: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    gap: 6,
  },
  fieldFocused: { borderColor: "rgba(255,107,53,0.4)" },
  at: { color: colors.textDim, fontSize: 16, fontWeight: "700" },
  input: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "500", paddingVertical: 12 },
  cta: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 13,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
