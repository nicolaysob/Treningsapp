import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchCoach, type CoachData } from "../api";
import { useAuth } from "../context/AuthContext";
import { RowCard, ScreenHeader, Section } from "../components/ui";
import { colors, spacing } from "../theme";

export function CoachScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetchCoach(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente coach");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const report = data?.report;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))} tintColor={colors.accent} />
      }
    >
      <ScreenHeader title="Coach" subtitle="Treningsanalyse og anbefalinger" />
      {error && <Text style={styles.error}>{error}</Text>}

      {!data?.hasData || !report ? (
        <Text style={styles.empty}>
          {data?.setup.needsHrMaxSetup
            ? "Sett makspuls på nett for å aktivere coach."
            : "Ikke nok data. Koble Strava på nett og synk."}
        </Text>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.readiness}>Readiness {report.summary.readiness}%</Text>
            <Text style={styles.headline}>{report.summary.headline}</Text>
            <Text style={styles.detail}>{report.summary.detail}</Text>
          </View>

          <Section title="Uke">
            <RowCard title="Økter" right={String(report.weekly.sessions)} />
            <RowCard title="Harde økter" right={String(report.weekly.hardSessions)} />
            <RowCard title="TSS" right={String(report.weekly.totalTss)} />
            <RowCard title="Streak" right={`${report.weekly.trainingDaysStreak} dager`} />
          </Section>

          {report.metrics.length > 0 && (
            <Section title="Nøkkeltall">
              {report.metrics.map((m) => (
                <RowCard key={m.label} title={m.label} subtitle={m.hint} right={m.value} />
              ))}
            </Section>
          )}

          {report.sports.length > 0 && (
            <Section title="Sport">
              {report.sports.map((s) => (
                <RowCard
                  key={s.label}
                  title={s.label}
                  subtitle={`${s.sharePct}% av uken`}
                  right={`${s.tss} TSS`}
                />
              ))}
            </Section>
          )}

          {report.dayPlan.length > 0 && (
            <Section title="Dagsplan">
              {report.dayPlan.map((d) => (
                <RowCard key={d.label} title={d.label} subtitle={d.recommendation} right={d.intensity} />
              ))}
            </Section>
          )}

          {report.findings.length > 0 && (
            <Section title="Funn">
              {report.findings.map((f) => (
                <RowCard key={f.title} title={f.title} subtitle={f.body} />
              ))}
            </Section>
          )}

          {report.tips.length > 0 && (
            <Section title="Tips">
              {report.tips.map((tip) => (
                <Text key={tip} style={styles.tip}>
                  · {tip}
                </Text>
              ))}
            </Section>
          )}

          {data.zoneDistribution && (
            <Section title="Sonetyper">
              <RowCard
                title="Rolig"
                right={`${Math.round(data.zoneDistribution.easyPercent)}%`}
              />
              <RowCard
                title="Hardt"
                right={`${Math.round(data.zoneDistribution.hardPercent)}%`}
              />
            </Section>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 32, gap: spacing.gap },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 6,
  },
  readiness: { color: colors.accentSoft, fontSize: 12, fontWeight: "700" },
  headline: { color: colors.text, fontSize: 20, fontWeight: "800" },
  detail: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  tip: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  empty: { color: colors.textDim, fontSize: 14 },
  error: { color: "#f87171", fontSize: 14 },
});
