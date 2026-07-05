import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
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
    <View style={styles.track}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={String(opt)}
              onPress={() => onChange(opt)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.text, active && styles.textActive]}>
                {formatLabel ? formatLabel(opt) : String(opt)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 4,
  },
  row: { flexDirection: "row", gap: 4 },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  text: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  textActive: { color: "#fff", fontWeight: "700" },
});
