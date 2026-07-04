import { Image, StyleSheet, Text, View } from "react-native";
import { avatarColor, displayInitial } from "../lib/avatar";

const SIZES = { sm: 36, md: 44, lg: 56, xl: 72 } as const;

export function UserAvatar({
  name,
  username,
  image,
  size = "md",
  highlight,
}: {
  name: string | null;
  username?: string | null;
  image?: string | null;
  size?: keyof typeof SIZES;
  highlight?: boolean;
}) {
  const dim = SIZES[size];
  const label = name ?? username ?? "?";
  const initial = displayInitial(name, username);
  const ring = highlight ? styles.highlight : null;

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={[
          styles.avatar,
          { width: dim, height: dim, borderRadius: dim / 2 },
          ring,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: avatarColor(label),
        },
        ring,
      ]}
    >
      <Text style={[styles.initial, { fontSize: dim * 0.36 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  highlight: {
    borderWidth: 2,
    borderColor: "rgba(255,107,43,0.5)",
  },
  initial: { color: "#fff", fontWeight: "800" },
});
