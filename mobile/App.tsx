import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { loadToken } from "./src/auth";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    void loadToken()
      .then(setToken)
      .finally(() => setBooting(false));
  }, []);

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#ff6b2b" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!token) {
    return (
      <>
        <LoginScreen onLoggedIn={setToken} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <HomeScreen token={token} onLogout={() => setToken(null)} />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050506",
  },
});
