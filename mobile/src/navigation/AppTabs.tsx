import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { HomeScreen } from "../screens/HomeScreen";
import { CalendarScreen } from "../screens/CalendarScreen";
import { CoachScreen } from "../screens/CoachScreen";
import { LeaderboardScreen } from "../screens/LeaderboardScreen";
import { FriendsScreen } from "../screens/FriendsScreen";
import { SettingsStack } from "./SettingsStack";
import { FloatingTabBar } from "./FloatingTabBar";
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
    border: "transparent",
    text: colors.text,
    primary: colors.accent,
  },
};

export function AppTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Hjem" component={HomeScreen} />
        <Tab.Screen name="Kalender" component={CalendarScreen} />
        <Tab.Screen name="Coach" component={CoachScreen} />
        <Tab.Screen name="Duell" component={LeaderboardScreen} />
        <Tab.Screen name="Venner" component={FriendsScreen} />
        <Tab.Screen name="Mer" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
