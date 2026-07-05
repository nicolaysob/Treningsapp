import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { CalendarDay } from "../api";
import { createPlannedWorkout, deletePlannedWorkout } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Chip, Input } from "./ui";
import { formatKeyNbWeekday } from "../lib/date";
import { colors, radii, spacing } from "../theme";

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORTS = ["RIDE", "RUN", "SWIM", "STRENGTH", "OTHER"] as const;

export function DaySheet({
  day,
  onClose,
  onChanged,
}: {
  day: CalendarDay;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { token } = useAuth();
  const [sport, setSport] = useState<(typeof SPORTS)[number]>("RIDE");
  const [desc, setDesc] = useState("");
  const [min, setMin] = useState("60");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const durationMin = parseInt(min, 10);
    if (!desc.trim() || !Number.isFinite(durationMin)) return;
    setSaving(true);
    try {
      await createPlannedWorkout(token, {
        date: day.key,
        sport,
        description: desc.trim(),
        durationMin,
      });
      onChanged();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deletePlannedWorkout(token, id);
    onChanged();
    onClose();
  }

  const dateLabel = formatKeyNbWeekday(day.key);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{dateLabel}</Text>
        <ScrollView contentContainerStyle={styles.content}>
          {day.activities.map((a) => (
            <View key={a.id} style={styles.row}>
              <Text style={styles.rowTitle}>✓ {SPORT_LABELS[a.sport] ?? a.sport}</Text>
              <Text style={styles.rowMeta}>Strava · {Math.round(a.durationSec / 60)} min</Text>
            </View>
          ))}
          {day.planned.map((p) => (
            <View key={p.id} style={styles.row}>
              <Text style={styles.rowTitle}>📋 {SPORT_LABELS[p.sport] ?? p.sport}</Text>
              <Text style={styles.rowMeta}>
                {p.description} · {p.durationMin} min
              </Text>
              <Button label="Slett" variant="danger" onPress={() => void handleDelete(p.id)} />
            </View>
          ))}

          <Text style={styles.formTitle}>Legg til planlagt økt</Text>
          <View style={styles.chips}>
            {SPORTS.map((s) => (
              <Chip key={s} label={SPORT_LABELS[s]} active={sport === s} onPress={() => setSport(s)} />
            ))}
          </View>
          <Input value={desc} onChangeText={setDesc} placeholder="Beskrivelse" />
          <Input value={min} onChangeText={setMin} placeholder="Minutter" keyboardType="number-pad" />
          <Button label="Lagre" onPress={() => void handleAdd()} loading={saving} disabled={saving} />
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: "#111113",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: "80%",
    paddingBottom: spacing.screen,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 10,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: spacing.screen,
    marginBottom: 8,
  },
  content: { padding: spacing.screen, gap: 10 },
  row: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 4,
  },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: colors.textDim, fontSize: 13 },
  formTitle: { color: colors.textDim, fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
