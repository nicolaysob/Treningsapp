import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { fetchSettings, updateProfile } from "../api";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "../components/UserAvatar";
import {
  Button,
  ErrorText,
  HeroHeader,
  Input,
  LoadingScreen,
  Screen,
  SuccessText,
} from "../components/ui";
import type { SettingsStackParamList } from "../navigation/SettingsStack";
import { colors, radii } from "../theme";

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function ProfileEditScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const data = await fetchSettings(token);
    setName(data.profile.name ?? "");
    setUsername(data.profile.username ?? "");
    setImage(data.profile.image);
    setImagePayload(undefined);
  }, [token]);

  useEffect(() => {
    void load()
      .catch((err) => setError(err instanceof Error ? err.message : "Kunne ikke hente profil"))
      .finally(() => setLoading(false));
  }, [load]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Tilgang nektet", "Gi tilgang til bilder i innstillinger for å velge profilbilde.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    const mime = result.assets[0].mimeType ?? "image/jpeg";
    const dataUrl = `data:${mime};base64,${result.assets[0].base64}`;
    if (dataUrl.length > 150_000) {
      setError("Bildet er for stort. Prøv et mindre bilde.");
      return;
    }

    setImage(dataUrl);
    setImagePayload(dataUrl);
    setError(null);
  }

  function useInitials() {
    setImage(null);
    setImagePayload("clear");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateProfile(token, {
        name,
        username,
        ...(imagePayload !== undefined ? { image: imagePayload } : {}),
      });
      setMessage("Profil lagret");
      setTimeout(() => navigation.goBack(), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke lagre");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <Screen>
      <HeroHeader
        title="Rediger profil"
        subtitle="Navn, brukernavn og profilbilde"
        right={
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
          </Pressable>
        }
      />

      {error && <ErrorText text={error} />}
      {message && <SuccessText text={message} />}

      <View style={styles.avatarBlock}>
        <Pressable onPress={() => void pickImage()}>
          <UserAvatar name={name} username={username} image={image} size="lg" highlight />
        </Pressable>
        <View style={styles.avatarActions}>
          <Pressable onPress={() => void pickImage()}>
            <Text style={styles.avatarLink}>Bytt bilde</Text>
          </Pressable>
          <Pressable onPress={useInitials}>
            <Text style={styles.avatarMuted}>Bruk initialer</Text>
          </Pressable>
        </View>
      </View>

      <FormField label="Navn">
        <Input value={name} onChangeText={setName} placeholder="Ditt navn" autoCapitalize="words" />
      </FormField>

      <FormField label="Brukernavn">
        <Input
          value={username}
          onChangeText={setUsername}
          placeholder="brukernavn"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </FormField>

      <Button label={saving ? "Lagrer…" : "Lagre profil"} onPress={() => void handleSave()} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBlock: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarActions: { gap: 8 },
  avatarLink: { color: colors.accentSoft, fontSize: 14, fontWeight: "700" },
  avatarMuted: { color: colors.textDim, fontSize: 13 },
  field: { gap: 8 },
  fieldLabel: { color: colors.textDim, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
});
