import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { fetchCalendar, fetchHome, type CalendarData, type HomeData } from "../api";
import { useAuth } from "../context/AuthContext";
import { addDaysToKey, formatKeyNbShort, osloDateKey } from "../lib/date";
import { PmcChart } from "../components/PmcChart";
import { SegmentedControl } from "../components/SegmentedControl";
import { TsbGauge } from "../components/TsbGauge";
import type { AppTabParamList } from "../navigation/AppTabs";
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorText,
  HeroHeader,
  LoadingScreen,
  ProgressBar,
  RowItem,
  Screen,
} from "../components/ui";
import { colors } from "../theme";

const PMC_OPTIONS = [30, 90, 180, 365] as const;

const SPORT_LABELS: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const SPORT_ICONS: Record<string, string> = {
  RIDE: "🚴",
  RUN: "🏃",
  SWIM: "🏊",
  STRENGTH: "💪",
  OTHER: "⚡",
};

function applyOsloWorkouts(home: HomeData, calendar: CalendarData): HomeData {
  const todayKey = osloDateKey();
  const tomorrowKey = addDaysToKey(todayKey, 1);
  const todayDay = calendar.days.find((d) => d.key === todayKey);
  const tomorrowDay = calendar.days.find((d) => d.key === tomorrowKey);

  const mapPlanned = (day: CalendarData["days"][number] | undefined) =>
    day?.planned.map((p) => ({
      sport: p.sport,
      description: p.description,
      durationMin: p.durationMin,
    })) ?? [];

  return {
    ...home,
    todayWorkouts: mapPlanned(todayDay),
    tomorrowWorkouts: mapPlanned(tomorrowDay),
    tomorrowLabel: formatKeyNbShort(tomorrowKey),
  };
}

export function HomeScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pmcDays, setPmcDays] = useState<(typeof PMC_OPTIONS)[number]>(90);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [home, calendar] = await Promise.all([
        fetchHome(token, pmcDays),
        fetchCalendar(token),
      ]);
      setData(applyOsloWorkouts(home, calendar));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente data");
    }
  }, [token, pmcDays]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading && !data) return <LoadingScreen />;
  if (!data) {
    return (
      <Screen>
        {error ? <ErrorText text={error} /> : <EmptyState text="Kunne ikke laste hjem" />}
      </Screen>
    );
  }

  const firstName = data.userName?.split(" ")[0] ?? "deg";
  const weekGoal = data.weeklyTssGoal;
  const weekProgress =
    weekGoal && weekGoal > 0 ? Math.min(100, (data.weekTss / weekGoal) * 100) : null;

  const heroSubtitle = data.latestLoad
    ? `CTL ${data.latestLoad.ctl.toFixed(0)} · ATL ${data.latestLoad.atl.toFixed(0)} · ${Math.round(data.weekTss)} TSS`
    : "Synk Strava på nett";

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      {error && <ErrorText text={error} />}

      <HeroHeader
        label={data.greeting ?? "Hei"}
        title={firstName}
        subtitle={heroSubtitle}
        right={<TsbGauge tsb={data.latestLoad?.tsb ?? null} />}
      />

      {(weekGoal || data.raceName) && (
        <Card>
          <CardHeader title="Mål" />
          {weekGoal ? (
            <>
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Ukentlig TSS</Text>
                <Text style={styles.goalValue}>
                  {Math.round(data.weekTss)}
                  <Text style={styles.goalTarget}> / {weekGoal}</Text>
                </Text>
              </View>
              {weekProgress !== null && <ProgressBar percent={weekProgress} />}
            </>
          ) : null}
          {data.raceName && data.daysToRace !== null ? (
            <View style={[styles.raceRow, weekGoal ? styles.raceSpaced : null]}>
              <Text style={styles.raceDays}>{data.daysToRace}</Text>
              <View>
                <Text style={styles.raceLabel}>{data.daysToRace === 1 ? "dag igjen" : "dager igjen"}</Text>
                <Text style={styles.raceName}>{data.raceName}</Text>
              </View>
            </View>
          ) : null}
        </Card>
      )}

      <Card style={styles.pmcCard}>
        <CardHeader title="Treningsbelastning" subtitle="Performance Management Chart" />
        <SegmentedControl
          options={[...PMC_OPTIONS]}
          value={pmcDays}
          onChange={setPmcDays}
          formatLabel={(d) => `${d}d`}
        />
        {!data.pmcChart?.length ? (
          <EmptyState text="Koble Strava på nett for å se PMC-grafen" />
        ) : (
          <PmcChart data={data.pmcChart} />
        )}
      </Card>

      <Card>
        <CardHeader
          title="Økter"
          action={
            <Pressable onPress={() => navigation.navigate("Kalender")}>
              <Text style={styles.link}>Kalender →</Text>
            </Pressable>
          }
        />
        {!data.todayWorkouts?.length && !data.tomorrowWorkouts?.length ? (
          <EmptyState text="Ingen økter i dag eller i morgen" />
        ) : (
          <>
            <Text style={styles.subLabel}>Dagens økter</Text>
            {data.todayWorkouts?.length ? (
              data.todayWorkouts.map((w, i) => (
                <RowItem
                  key={`t-${i}`}
                  icon={SPORT_ICONS[w.sport] ?? "⚡"}
                  title={SPORT_LABELS[w.sport] ?? w.sport}
                  subtitle={w.description}
                  right={`${w.durationMin}m`}
                />
              ))
            ) : (
              <Text style={styles.emptyDay}>Ingen økter</Text>
            )}
            <Text style={[styles.subLabel, styles.subLabelSpaced]}>
              I morgen · {data.tomorrowLabel}
            </Text>
            {data.tomorrowWorkouts?.length ? (
              data.tomorrowWorkouts.map((w, i) => (
                <RowItem
                  key={`m-${i}`}
                  icon={SPORT_ICONS[w.sport] ?? "⚡"}
                  title={SPORT_LABELS[w.sport] ?? w.sport}
                  subtitle={w.description}
                  right={`${w.durationMin}m`}
                />
              ))
            ) : (
              <Text style={styles.emptyDay}>Ingen økter</Text>
            )}
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pmcCard: { gap: 12 },
  goalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  goalLabel: { color: colors.textDim, fontSize: 14 },
  goalValue: { color: colors.text, fontSize: 16, fontWeight: "800" },
  goalTarget: { color: colors.textDim, fontWeight: "400" },
  raceRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  raceSpaced: { marginTop: 14 },
  raceDays: { color: colors.accent, fontSize: 36, fontWeight: "800" },
  raceLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
  raceName: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  link: { color: colors.accentSoft, fontSize: 12, fontWeight: "700" },
  subLabel: { color: colors.textDim, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
  subLabelSpaced: { marginTop: 12 },
  emptyDay: { color: colors.textDim, fontSize: 14, paddingVertical: 4 },
});
