import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { clearToken } from "../auth";
import { colors, spacing } from "../theme";

export function SettingsScreen() {
  const { logout } = useAuth();

  async function handleLogout() {
    await clearToken();
    logout();
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.title}>Mer</Text>
        <Text style={styles.subtitle}>
          Innstillinger, Strava-synk og profil kommer her. Bruk nettappen for full tilgang foreløpig.
        </Text>
      </View>
      <Pressable style={styles.logoutBtn} onPress={() => void handleLogout()}>
        <Text style={styles.logoutText}>Logg ut</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screen,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 280,
  },
  logoutBtn: {
    marginHorizontal: spacing.screen,
    marginBottom: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "700",
  },
});
