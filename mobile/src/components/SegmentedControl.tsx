import { ScrollView, Pressable, StyleSheet, Text } from "react-native";
import { colors, radii } from "../theme";

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  formatLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={String(opt)}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {formatLabel ? formatLabel(opt) : String(opt)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  chipActive: { backgroundColor: colors.accent },
  text: { color: colors.textDim, fontSize: 12, fontWeight: "700" },
  textActive: { color: "#fff" },
});
