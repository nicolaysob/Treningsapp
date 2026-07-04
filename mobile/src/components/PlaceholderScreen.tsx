import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export function PlaceholderScreen({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screen,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 280,
  },
});
