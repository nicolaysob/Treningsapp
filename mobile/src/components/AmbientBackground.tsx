import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

export function AmbientBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0a080c", colors.bg, "#060810"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, styles.orbAccent]} />
      <View style={[styles.orb, styles.orbBlue]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  orbAccent: {
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    backgroundColor: "rgba(255,107,53,0.12)",
  },
  orbBlue: {
    top: 280,
    left: -100,
    width: 200,
    height: 200,
    backgroundColor: "rgba(96,165,250,0.07)",
  },
});
