import { View, Pressable, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadow } from "../theme";
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
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.island}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          const focused = state.index === index;
          const color = focused ? "#fff" : colors.textDim;

          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={() => navigation.navigate(route.name)}
            >
              {focused ? <View style={styles.activePill} /> : null}
              <Ionicons
                name={focused ? (tab?.iconActive ?? "ellipse") : (tab?.icon ?? "ellipse")}
                size={20}
                color={color}
                style={styles.icon}
              />
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
    left: 20,
    right: 20,
    bottom: 0,
  },
  island: {
    flexDirection: "row",
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...shadow.float,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    margin: 2,
  },
  icon: { zIndex: 1 },
});
