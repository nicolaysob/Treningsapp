import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { loadToken } from "./src/auth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { AppTabs } from "./src/navigation/AppTabs";
import { AuthProvider } from "./src/context/AuthContext";
import { colors } from "./src/theme";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    void loadToken()
      .then(setToken)
      .finally(() => setBooting(false));
  }, []);

  return (
    <SafeAreaProvider>
      {booting ? (
        <View style={styles.boot}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : !token ? (
        <LoginScreen onLoggedIn={setToken} />
      ) : (
        <AuthProvider token={token} logout={() => setToken(null)}>
          <AppTabs />
        </AuthProvider>
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
});
