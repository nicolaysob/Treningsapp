import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { PlaceholderScreen } from "../components/PlaceholderScreen";
import { colors } from "../theme";

export type AppTabParamList = {
  Hjem: undefined;
  Kalender: undefined;
  Coach: undefined;
  Duell: undefined;
  Venner: undefined;
  Mer: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: "rgba(255,255,255,0.08)",
    text: colors.text,
    primary: colors.accent,
  },
};

const TAB_ICONS: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Hjem: "home-outline",
  Kalender: "calendar-outline",
  Coach: "sparkles-outline",
  Duell: "trophy-outline",
  Venner: "people-outline",
  Mer: "settings-outline",
};

export function AppTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "800" },
          tabBarStyle: {
            backgroundColor: "rgba(18,18,20,0.96)",
            borderTopColor: "rgba(255,255,255,0.08)",
            borderTopWidth: 1,
            height: 84,
            paddingTop: 8,
            paddingBottom: 24,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textDim,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Hjem" component={HomeScreen} options={{ headerShown: false }} />
        <Tab.Screen
          name="Kalender"
          options={{ title: "Kalender" }}
        >
          {() => (
            <PlaceholderScreen
              emoji="📅"
              title="Kalender"
              subtitle="Planlegg og se økter — kommer snart med samme data som nettappen."
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Coach"
          options={{ title: "Coach" }}
        >
          {() => (
            <PlaceholderScreen
              emoji="✨"
              title="Coach"
              subtitle="Full coach-rapport med ukeplan og soner — bygges i neste steg."
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Duell"
          options={{ title: "Duell" }}
        >
          {() => (
            <PlaceholderScreen
              emoji="🏆"
              title="Duell"
              subtitle="Ukentlig leaderboard mot venner — kommer snart."
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Venner"
          options={{ title: "Venner" }}
        >
          {() => (
            <PlaceholderScreen
              emoji="👥"
              title="Venner"
              subtitle="Legg til venner og se forespørsler — kommer snart."
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Mer" component={SettingsScreen} options={{ title: "Mer" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
