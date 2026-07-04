import { View, Pressable, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii } from "../theme";
import type { AppTabParamList } from "../navigation/AppTabs";

const TABS: Array<{
  name: keyof AppTabParamList;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}> = [
  { name: "Hjem", icon: "home-outline", iconActive: "home" },
  { name: "Kalender", icon: "calendar-outline", iconActive: "calendar" },
  { name: "Coach", icon: "sparkles-outline", iconActive: "sparkles" },
  { name: "Duell", icon: "trophy-outline", iconActive: "trophy" },
  { name: "Venner", icon: "people-outline", iconActive: "people" },
  { name: "Mer", icon: "settings-outline", iconActive: "settings" },
];

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.island}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          const focused = state.index === index;
          const color = focused ? colors.accent : colors.textDim;

          return (
            <Pressable
              key={route.key}
              style={[styles.item, focused && styles.itemActive]}
              onPress={() => navigation.navigate(route.name)}
            >
              <Ionicons
                name={focused ? (tab?.iconActive ?? "ellipse") : (tab?.icon ?? "ellipse")}
                size={22}
                color={color}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },
  island: {
    flexDirection: "row",
    backgroundColor: colors.glass,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 6,
    borderRadius: radii.lg,
  },
  itemActive: {
    backgroundColor: colors.accentGlow,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textDim,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.accent,
  },
});
