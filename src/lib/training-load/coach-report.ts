import { toDateKey } from "@/lib/date";
import {
  collectAllRuleHits,
  getTrainingInsight,
  type InsightTone,
  type SignalSeverity,
  type TrainingInsightContext,
} from "@/lib/training-load/insight";

const SPORT_NB: Record<string, string> = {
  RIDE: "Sykkel",
  RUN: "Løping",
  SWIM: "Svømming",
  STRENGTH: "Styrke",
  OTHER: "Annet",
};

const CATEGORY_NB: Record<string, string> = {
  race: "Race",
  form: "Form",
  trend: "Trend",
  consistency: "Konsistens",
  goal: "Mål",
  plan: "Plan",
};

export interface CoachMetric {
  label: string;
  value: string;
  hint: string;
  status: SignalSeverity;
}

export interface CoachTrend {
  label: string;
  value: string;
  direction: "up" | "down" | "flat";
}

export interface CoachSportRow {
  sport: string;
  label: string;
  sessions: number;
  tss: number;
  sharePct: number;
}

export interface CoachFinding {
  category: string;
  title: string;
  body: string;
  tone: InsightTone;
  signal?: string;
}

export interface CoachDayPlan {
  label: string;
  recommendation: string;
  intensity: "rest" | "easy" | "moderate" | "hard";
}

export interface CoachWeeklyStats {
  sessions: number;
  hardSessions: number;
  totalTss: number;
  prevWeekTss: number;
  weekDeltaPct: number | null;
  avgTssPerSession: number;
  trainingDaysStreak: number;
}

export interface CoachReport {
  summary: ReturnType<typeof getTrainingInsight>;
  metrics: CoachMetric[];
  trends: CoachTrend[];
  weekly: CoachWeeklyStats;
  sports: CoachSportRow[];
  findings: CoachFinding[];
  tips: string[];
  dayPlan: CoachDayPlan[];
}

function acwr(ctl: number, atl: number): number | null {
  return ctl > 1 ? atl / ctl : null;
}

function loadOnOrBefore(
  loads: TrainingInsightContext["dailyLoads"],
  daysAgo: number,
): (typeof loads)[number] | null {
  if (loads.length === 0) return null;
  const target = new Date();
  target.setUTCDate(target.getUTCDate() - daysAgo);
  const key = toDateKey(target);
  let best: (typeof loads)[number] | null = null;
  for (const row of loads) {
    if (row.date <= key) best = row;
    else break;
  }
  return best;
}

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function trendDirection(pct: number | null): "up" | "down" | "flat" {
  if (pct === null) return "flat";
  if (pct > 2) return "up";
  if (pct < -2) return "down";
  return "flat";
}

function sessionsInLastDays(ctx: TrainingInsightContext, days: number): number {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const key = toDateKey(cutoff);
  return new Set(ctx.recentActivities.filter((a) => a.date >= key).map((a) => a.date)).size;
}

function hardSessions(ctx: TrainingInsightContext, days: number): number {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const key = toDateKey(cutoff);
  return ctx.recentActivities.filter((a) => a.date >= key && a.tss >= 75).length;
}

function streakDays(ctx: TrainingInsightContext): number {
  const dates = [...new Set(ctx.recentActivities.map((a) => a.date))].sort().reverse();
  if (dates.length === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(12, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const key = toDateKey(cursor);
    if (dates.includes(key)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (streak === 0 && i === 0) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function categorizeHit(headline: string): string {
  if (/race|taper/i.test(headline)) return "race";
  if (/CTL|ATL|TSS|belastning|form|uthvilt|frisk/i.test(headline)) return "form";
  if (/uke|streak|økt|sport|hvile|pause|frekvens|hard/i.test(headline)) return "consistency";
  if (/mål/i.test(headline)) return "goal";
  if (/plan|kalender/i.test(headline)) return "plan";
  return "trend";
}

function buildMetrics(ctx: TrainingInsightContext): CoachMetric[] {
  const ratio = acwr(ctx.ctl, ctx.atl);
  const tsbStatus: SignalSeverity =
    ctx.tsb > 5 ? "positive" : ctx.tsb > -10 ? "neutral" : ctx.tsb > -30 ? "caution" : "warning";

  const metrics: CoachMetric[] = [
    {
      label: "Fitness (CTL)",
      value: ctx.ctl.toFixed(0),
      hint: "Langsiktig treningskapasitet. Høyere = mer grunnform.",
      status: ctx.ctl >= 30 ? "positive" : ctx.ctl >= 15 ? "neutral" : "caution",
    },
    {
      label: "Fatigue (ATL)",
      value: ctx.atl.toFixed(0),
      hint: "Korttidsbelastning siste ~7 dager. Faller raskt med hvile.",
      status: ctx.atl > ctx.ctl * 1.3 ? "caution" : "neutral",
    },
    {
      label: "Form (TSB)",
      value: `${ctx.tsb > 0 ? "+" : ""}${ctx.tsb.toFixed(0)}`,
      hint: "CTL − ATL. Positiv = uthvilt, negativ = sliten.",
      status: tsbStatus,
    },
  ];

  if (ratio !== null) {
    metrics.push({
      label: "ACWR",
      value: ratio.toFixed(2),
      hint: "ATL ÷ CTL. Over 1.5 = økt skaderisiko ved brå økning.",
      status: ratio > 1.5 ? "warning" : ratio > 1.2 ? "caution" : "positive",
    });
  }

  return metrics;
}

function buildTrends(ctx: TrainingInsightContext): CoachTrend[] {
  const load7 = loadOnOrBefore(ctx.dailyLoads, 7);
  const load28 = loadOnOrBefore(ctx.dailyLoads, 28);
  const trends: CoachTrend[] = [];

  const ctl7 = pctChange(ctx.ctl, load7?.ctl ?? 0);
  const ctl28 = pctChange(ctx.ctl, load28?.ctl ?? 0);
  const atl7 = pctChange(ctx.atl, load7?.atl ?? 0);
  const weekTss = pctChange(ctx.weekTss, ctx.prevWeekTss);

  if (ctl7 !== null) {
    trends.push({
      label: "CTL siste 7d",
      value: `${ctl7 > 0 ? "+" : ""}${ctl7.toFixed(0)}%`,
      direction: trendDirection(ctl7),
    });
  }
  if (ctl28 !== null) {
    trends.push({
      label: "CTL siste 28d",
      value: `${ctl28 > 0 ? "+" : ""}${ctl28.toFixed(0)}%`,
      direction: trendDirection(ctl28),
    });
  }
  if (atl7 !== null) {
    trends.push({
      label: "ATL siste 7d",
      value: `${atl7 > 0 ? "+" : ""}${atl7.toFixed(0)}%`,
      direction: trendDirection(atl7),
    });
  }
  if (weekTss !== null && ctx.prevWeekTss > 0) {
    trends.push({
      label: "TSS denne uke",
      value: `${weekTss > 0 ? "+" : ""}${weekTss.toFixed(0)}%`,
      direction: trendDirection(weekTss),
    });
  }

  return trends;
}

function buildSports(ctx: TrainingInsightContext): CoachSportRow[] {
  const totals = new Map<string, { sessions: number; tss: number }>();
  for (const a of ctx.recentActivities) {
    const cur = totals.get(a.sport) ?? { sessions: 0, tss: 0 };
    cur.sessions++;
    cur.tss += a.tss;
    totals.set(a.sport, cur);
  }

  const totalTss = [...totals.values()].reduce((s, v) => s + v.tss, 0);
  return [...totals.entries()]
    .map(([sport, data]) => ({
      sport,
      label: SPORT_NB[sport] ?? sport,
      sessions: data.sessions,
      tss: Math.round(data.tss),
      sharePct: totalTss > 0 ? Math.round((data.tss / totalTss) * 100) : 0,
    }))
    .sort((a, b) => b.tss - a.tss);
}

function buildDayPlan(ctx: TrainingInsightContext): CoachDayPlan[] {
  const ratio = acwr(ctx.ctl, ctx.atl);
  const labels = ["I dag", "I morgen", "Om 2 dager"];

  const intensities: CoachDayPlan["intensity"][] = ["rest", "easy", "moderate", "hard"];

  function pickIntensity(index: number): CoachDayPlan["intensity"] {
    if (ctx.daysToRace !== null && ctx.daysToRace <= 7) {
      return index === 0 ? "easy" : "rest";
    }
    if (ctx.tsb < -30) return "rest";
    if (ctx.tsb < -15) return index === 0 ? "easy" : "rest";
    if (ctx.tsb > 15) return index === 0 ? "hard" : index === 1 ? "moderate" : "easy";
    if (ctx.tsb > 0) return index === 0 ? "moderate" : index === 1 ? "hard" : "easy";
    if (ratio !== null && ratio > 1.5) return index === 0 ? "rest" : "easy";
    return intensities[Math.min(index + 1, 3)] ?? "moderate";
  }

  const text: Record<CoachDayPlan["intensity"], string> = {
    rest: "Hvile eller 20–30 min lett bevegelse",
    easy: "Rolig økt, sone 1–2, lav TSS",
    moderate: "Moderat økt med struktur, middels TSS",
    hard: "Kvalitetsøkt — intervall, tempo eller langtur med intensitet",
  };

  return labels.map((label, i) => {
    const intensity = pickIntensity(i);
    return { label, recommendation: text[intensity], intensity };
  });
}

function buildFindings(ctx: TrainingInsightContext): CoachFinding[] {
  return collectAllRuleHits(ctx).map((hit) => ({
    category: CATEGORY_NB[categorizeHit(hit.headline)] ?? "Analyse",
    title: hit.headline,
    body: hit.detail,
    tone: hit.tone,
    signal: hit.signal?.label,
  }));
}

function buildAllTips(ctx: TrainingInsightContext): string[] {
  const tips: string[] = [];
  const seen = new Set<string>();
  for (const hit of collectAllRuleHits(ctx)) {
    if (hit.tip && !seen.has(hit.tip)) {
      seen.add(hit.tip);
      tips.push(hit.tip);
    }
  }

  if (tips.length === 0 && ctx.ctl < 10) {
    tips.push("Bygg gradvis med 3–4 økter per uke de neste ukene.");
  }
  if (ctx.weeklyTssGoal && ctx.weekTss < ctx.weeklyTssGoal * 0.5) {
    tips.push(`Ukentlig mål er ${ctx.weeklyTssGoal} TSS — planlegg økter i kalenderen.`);
  }
  if (ctx.plannedWorkoutsNext7Days === 0) {
    tips.push("Legg inn planlagte økter i kalenderen for bedre struktur.");
  }

  return tips.slice(0, 10);
}

export function getCoachReport(ctx: TrainingInsightContext): CoachReport {
  const sessions = sessionsInLastDays(ctx, 7);
  const summary = getTrainingInsight(ctx);

  return {
    summary,
    metrics: buildMetrics(ctx),
    trends: buildTrends(ctx),
    weekly: {
      sessions,
      hardSessions: hardSessions(ctx, 7),
      totalTss: Math.round(ctx.weekTss),
      prevWeekTss: Math.round(ctx.prevWeekTss),
      weekDeltaPct: pctChange(ctx.weekTss, ctx.prevWeekTss),
      avgTssPerSession: sessions > 0 ? Math.round(ctx.weekTss / sessions) : 0,
      trainingDaysStreak: streakDays(ctx),
    },
    sports: buildSports(ctx),
    findings: buildFindings(ctx),
    tips: buildAllTips(ctx),
    dayPlan: buildDayPlan(ctx),
  };
}
