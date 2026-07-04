import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, spacing } from "../../theme";

export function LegalSheet({
  title,
  body,
  visible,
  onClose,
}: {
  title: string;
  body: string;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.wrap, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Lukk</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.text}>{body}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function ConsentRow({
  checked,
  onToggle,
  onPrivacy,
  onTerms,
}: {
  checked: boolean;
  onToggle: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
}) {
  return (
    <View style={styles.consent}>
      <Pressable style={[styles.box, checked && styles.boxOn]} onPress={onToggle}>
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>
      <Text style={styles.consentText}>
        Jeg godtar{" "}
        <Text style={styles.link} onPress={onTerms}>vilkårene</Text>
        {" "}og{" "}
        <Text style={styles.link} onPress={onPrivacy}>personvernerklæringen</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screen },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  close: { color: colors.accentSoft, fontSize: 15, fontWeight: "700" },
  body: { paddingBottom: 24 },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 24 },

  consent: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  check: { color: "#fff", fontSize: 13, fontWeight: "900" },
  consentText: { flex: 1, color: colors.textDim, fontSize: 13, lineHeight: 20 },
  link: { color: colors.accentSoft, fontWeight: "700", textDecorationLine: "underline" },
});
