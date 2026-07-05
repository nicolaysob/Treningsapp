import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import { fetchCoach, type CoachData } from "../api";
import { useAuth } from "../context/AuthContext";
import { ZoneDistributionChart } from "../components/ZoneDistributionChart";
import {
  CoachCard,
  EmptyState,
  ErrorText,
  HeroHeader,
  LoadingScreen,
  RowItem,
  Screen,
  Section,
} from "../components/ui";
import { colors } from "../theme";

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

  if (loading && !data) return <LoadingScreen />;

  const report = data?.report;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void (setRefreshing(true), load().finally(() => setRefreshing(false)))}>
      <HeroHeader title="Coach" subtitle="Treningsanalyse og anbefalinger" />
      {error && <ErrorText text={error} />}

      {!data?.hasData || !report ? (
        <EmptyState
          text={
            data?.setup.needsHrMaxSetup
              ? "Sett makspuls på nett for å aktivere coach."
              : "Ikke nok data. Koble Strava på nett og synk."
          }
        />
      ) : (
        <>
          <CoachCard
            tone={report.summary.tone as "fresh" | "balanced" | "building" | "risk"}
            readiness={report.summary.readiness}
            title={report.summary.headline}
            body={report.summary.detail}
          />

          {data.zoneDistribution && data.hrMaxBpm ? (
            <ZoneDistributionChart distribution={data.zoneDistribution} hrMaxBpm={data.hrMaxBpm} />
          ) : null}

          {report.metrics.length > 0 && (
            <Section title="Nøkkeltall">
              {report.metrics.map((m, i) => (
                <RowItem
                  key={m.label}
                  title={m.label}
                  subtitle={m.hint}
                  right={m.value}
                  divider={i < report.metrics.length - 1}
                />
              ))}
            </Section>
          )}

          <Section title="Denne uken">
            <RowItem title="Økter" right={String(report.weekly.sessions)} divider />
            <RowItem title="Harde økter" right={String(report.weekly.hardSessions)} divider />
            <RowItem title="TSS" right={String(report.weekly.totalTss)} divider />
            <RowItem title="Streak" right={`${report.weekly.trainingDaysStreak} dager`} />
          </Section>

          {report.sports.length > 0 && (
            <Section title="Sport">
              {report.sports.map((s, i) => (
                <RowItem
                  key={s.label}
                  title={s.label}
                  subtitle={`${s.sharePct}% av uken`}
                  right={`${s.tss} TSS`}
                  divider={i < report.sports.length - 1}
                />
              ))}
            </Section>
          )}

          {report.dayPlan.length > 0 && (
            <Section title="Dagsplan">
              {report.dayPlan.map((d, i) => (
                <RowItem
                  key={d.label}
                  title={d.label}
                  subtitle={d.recommendation}
                  right={d.intensity}
                  divider={i < report.dayPlan.length - 1}
                />
              ))}
            </Section>
          )}

          {report.tips.length > 0 && (
            <Section title="Tips">
              {report.tips.map((tip) => (
                <Text key={tip} style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21 }}>
                  · {tip}
                </Text>
              ))}
            </Section>
          )}
        </>
      )}
    </Screen>
  );
}
