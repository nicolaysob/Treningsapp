import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ProfileEditScreen } from "../screens/ProfileEditScreen";
import { TrainingSettingsScreen } from "../screens/TrainingSettingsScreen";
import { colors } from "../theme";

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProfileEdit: undefined;
  TrainingSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="TrainingSettings" component={TrainingSettingsScreen} />
    </Stack.Navigator>
  );
}
