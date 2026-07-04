import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabParamList } from "../navigation/AppTabs";
import { colors, radii } from "../theme";

export function CoachTeaser({
  readiness,
  headline,
}: {
  readiness: number | null;
  headline: string | null;
}) {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();

  return (
    <Pressable style={styles.wrap} onPress={() => navigation.navigate("Coach")}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>✦</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Treningscoach</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {headline ?? "Åpne coach"}
        </Text>
      </View>
      {readiness !== null && (
        <View style={styles.score}>
          <Text style={styles.scoreValue}>{readiness}</Text>
          <Text style={styles.scoreLabel}>form</Text>
        </View>
      )}
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,107,43,0.22)",
    backgroundColor: colors.card,
    padding: 14,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,43,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: colors.accentSoft, fontSize: 18 },
  body: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  subtitle: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  score: { alignItems: "center" },
  scoreValue: { color: colors.accentSoft, fontSize: 20, fontWeight: "800" },
  scoreLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  arrow: { color: colors.accentSoft, fontSize: 18, fontWeight: "700" },
});
