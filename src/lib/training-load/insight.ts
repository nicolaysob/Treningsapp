import { toDateKey } from "@/lib/date";

export type InsightTone = "fresh" | "balanced" | "building" | "risk";

export type SignalSeverity = "positive" | "neutral" | "caution" | "warning";

export interface DailyLoadPoint {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
  dailyTss: number;
}

export interface RecentActivityPoint {
  date: string;
  sport: string;
  tss: number;
  durationSec: number;
}

export interface TrainingInsightContext {
  ctl: number;
  atl: number;
  tsb: number;
  dailyLoads: DailyLoadPoint[];
  recentActivities: RecentActivityPoint[];
  weekTss: number;
  prevWeekTss: number;
  weeklyTssGoal: number | null;
  raceName: string | null;
  daysToRace: number | null;
  plannedWorkoutsNext7Days: number;
  /** 0 = Sunday … 6 = Saturday (UTC) */
  dayOfWeek: number;
}

export interface InsightSignal {
  label: string;
  severity: SignalSeverity;
}

export interface TrainingInsight {
  headline: string;
  detail: string;
  tone: InsightTone;
  signals: InsightSignal[];
  tips: string[];
  readiness: number;
}

interface RuleHit {
  priority: number;
  tone: InsightTone;
  headline: string;
  detail: string;
  signal?: InsightSignal;
  tip?: string;
}

const HARD_TSS = 75;
const VERY_HARD_TSS = 120;

const SPORT_NB: Record<string, string> = {
  RIDE: "sykkel",
  RUN: "løping",
  SWIM: "svømming",
  STRENGTH: "styrke",
  OTHER: "trening",
};

function acwr(ctl: number, atl: number): number | null {
  return ctl > 1 ? atl / ctl : null;
}

function loadOnOrBefore(loads: DailyLoadPoint[], daysAgo: number): DailyLoadPoint | null {
  if (loads.length === 0) return null;
  const target = new Date();
  target.setUTCDate(target.getUTCDate() - daysAgo);
  const key = toDateKey(target);
  let best: DailyLoadPoint | null = null;
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

function daysSinceLastActivity(activities: RecentActivityPoint[]): number | null {
  if (activities.length === 0) return null;
  const latest = activities.reduce((max, a) => (a.date > max ? a.date : max), activities[0].date);
  const latestDate = new Date(`${latest}T12:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  return Math.floor((today.getTime() - latestDate.getTime()) / (24 * 60 * 60 * 1000));
}

function sessionsInLastDays(activities: RecentActivityPoint[], days: number): number {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const key = toDateKey(cutoff);
  const dates = new Set(activities.filter((a) => a.date >= key).map((a) => a.date));
  return dates.size;
}

function consecutiveTrainingDays(activities: RecentActivityPoint[]): number {
  const dates = [...new Set(activities.map((a) => a.date))].sort().reverse();
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
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function hardSessionsInLastDays(activities: RecentActivityPoint[], days: number): number {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const key = toDateKey(cutoff);
  return activities.filter((a) => a.date >= key && a.tss >= HARD_TSS).length;
}

function dominantSport(activities: RecentActivityPoint[], days: number): string | null {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const key = toDateKey(cutoff);
  const counts = new Map<string, number>();
  for (const a of activities) {
    if (a.date < key) continue;
    counts.set(a.sport, (counts.get(a.sport) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [sport, count] of counts) {
    if (count > bestCount) {
      best = sport;
      bestCount = count;
    }
  }
  return bestCount >= 4 ? best : null;
}

function longestRecentStreakSameSport(activities: RecentActivityPoint[]): number {
  const byDate = [...activities].sort((a, b) => a.date.localeCompare(b.date));
  let max = 0;
  let current = 0;
  let prevSport: string | null = null;

  for (const a of byDate) {
    if (a.sport === prevSport) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
      prevSport = a.sport;
    }
  }
  return max;
}

function evaluateFormRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];
  const ratio = acwr(ctx.ctl, ctx.atl);

  if (ctx.ctl < 10) {
    hits.push({
      priority: 40,
      tone: "building",
      headline: "Bygger grunnform",
      detail:
        "Du er tidlig i oppbyggingen. Prioriter jevn, moderat belastning og god søvn for å etablere en solid base.",
      signal: { label: "Lav treningsbase", severity: "neutral" },
      tip: "Sikt mot 3–4 økter i uken med moderat intensitet de neste ukene.",
    });
  } else if (ctx.tsb > 25) {
    hits.push({
      priority: 55,
      tone: "fresh",
      headline: "Veldig uthvilt",
      detail:
        "Formen er svært god. CTL kan falle om hvilen fortsetter — vurder å ta grep om du vil holde fitness oppe.",
      signal: { label: `TSB +${ctx.tsb.toFixed(0)}`, severity: "positive" },
      tip: "God dag for intervaller, konkurranse eller en lang økt med kvalitet.",
    });
  } else if (ctx.tsb > 5) {
    hits.push({
      priority: 50,
      tone: "fresh",
      headline: "Frisk og klar",
      detail:
        "God balanse mellom trening og restitusjon. Kroppen tåler hardere økter og raske markeder.",
      signal: { label: `TSB +${ctx.tsb.toFixed(0)}`, severity: "positive" },
    });
  } else if (ctx.tsb > -10) {
    hits.push({
      priority: 45,
      tone: "balanced",
      headline: "Balansert belastning",
      detail: "Du holder en sunn balanse mellom påkjenning og restitusjon. Fortsett med planen din.",
      signal: { label: "Stabil form", severity: "neutral" },
    });
  } else if (ctx.tsb > -30) {
    hits.push({
      priority: 48,
      tone: "building",
      headline: "Bygger form under press",
      detail:
        "Du trener hardt og kroppen bærer mer tretthet enn vanlig. Restitusjon blir viktig de neste dagene.",
      signal: { label: `TSB ${ctx.tsb.toFixed(0)}`, severity: "caution" },
      tip: "Legg inn en roligere dag eller lavere intensitet innen 48 timer.",
    });
  } else {
    hits.push({
      priority: 90,
      tone: "risk",
      headline: "Høy risiko for overbelastning",
      detail:
        "Belastningen er høy over tid. En lettere uke eller ekstra hviledager kan hindre skade og sykdom.",
      signal: { label: "Overbelastning", severity: "warning" },
      tip: "Kutt volum eller intensitet 30–50 % de neste 3–5 dagene.",
    });
  }

  if (ratio !== null && ratio > 1.8) {
    hits.push({
      priority: 85,
      tone: "risk",
      headline: "Brå belastningsøkning",
      detail:
        "Korttidsbelastning (ATL) er svært høy i forhold til fitness (CTL). Dette er en klassisk skaderisikofaktor.",
      signal: { label: `ACWR ${ratio.toFixed(2)}`, severity: "warning" },
      tip: "Øk ukentlig TSS gradvis — ikke mer enn ca. 10 % per uke over tid.",
    });
  } else if (ratio !== null && ratio > 1.5) {
    hits.push({
      priority: 70,
      tone: "building",
      headline: "Høy akutt belastning",
      detail:
        "Du har økt belastningen raskt siste uken. Følg med på restitusjon og unngå å stable harde dager.",
      signal: { label: `ACWR ${ratio.toFixed(2)}`, severity: "caution" },
      tip: "Bytt ut én hard økt med rolig distanse eller hvile de neste dagene.",
    });
  }

  return hits;
}

function evaluateTrendRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];
  const load7 = loadOnOrBefore(ctx.dailyLoads, 7);
  const load28 = loadOnOrBefore(ctx.dailyLoads, 28);

  const ctl7 = pctChange(ctx.ctl, load7?.ctl ?? 0);
  const ctl28 = pctChange(ctx.ctl, load28?.ctl ?? 0);
  const atl7 = pctChange(ctx.atl, load7?.atl ?? 0);

  if (ctl28 !== null && ctl28 >= 12) {
    hits.push({
      priority: 35,
      tone: "building",
      headline: "Sterk formutvikling",
      detail: `Fitness (CTL) har økt ${ctl28.toFixed(0)} % siste 4 uker — et tydelig oppbyggingsblokk.`,
      signal: { label: `CTL +${ctl28.toFixed(0)}%`, severity: "positive" },
    });
  } else if (ctl7 !== null && ctl7 >= 6) {
    hits.push({
      priority: 30,
      tone: "building",
      headline: "Fitness på vei opp",
      detail: `CTL har steget ${ctl7.toFixed(0)} % siste uken. Kroppen responderer godt på belastningen.`,
      signal: { label: "CTL stiger", severity: "positive" },
    });
  } else if (ctl28 !== null && ctl28 <= -8) {
    hits.push({
      priority: 65,
      tone: "fresh",
      headline: "Fitness synker",
      detail:
        "CTL har falt merkbart siste uker, ofte etter hvile, sykdom eller lite trening. Planlegg gradvis oppbygging.",
      signal: { label: `CTL ${ctl28.toFixed(0)}%`, severity: "caution" },
      tip: "Kom tilbake med kortere og roligere økter før du øker volum igjen.",
    });
  }

  if (atl7 !== null && atl7 >= 20) {
    hits.push({
      priority: 55,
      tone: "building",
      headline: "Tretthet øker raskt",
      detail: `Fatigue (ATL) er opp ${atl7.toFixed(0)} % siste 7 dager — kroppen jobber hardt med å absorbere belastning.`,
      signal: { label: "ATL stiger", severity: "caution" },
    });
  }

  if (ctx.prevWeekTss > 0) {
    const weekRamp = pctChange(ctx.weekTss, ctx.prevWeekTss);
    if (weekRamp !== null && weekRamp > 35 && ctx.weekTss > 200) {
      hits.push({
        priority: 75,
        tone: "building",
        headline: "Stor uke-til-uke økning",
        detail: `Ukentlig TSS er opp ${weekRamp.toFixed(0)} % fra forrige uke. Vær ekstra forsiktig med skaderisiko.`,
        signal: { label: "TSS-hopp", severity: "warning" },
        tip: "La neste uke være 10–20 % lettere for å konsolidere belastningen.",
      });
    } else if (weekRamp !== null && weekRamp < -40 && ctx.prevWeekTss > 150) {
      hits.push({
        priority: 25,
        tone: "fresh",
        headline: "Lettere uke",
        detail: "Du har trappet ned volumet fra forrige uke — bra for restitusjon eller taper.",
        signal: { label: "Avlastning", severity: "positive" },
      });
    }
  }

  return hits;
}

function evaluateConsistencyRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];
  const idle = daysSinceLastActivity(ctx.recentActivities);
  const sessions7 = sessionsInLastDays(ctx.recentActivities, 7);
  const streak = consecutiveTrainingDays(ctx.recentActivities);
  const hard7 = hardSessionsInLastDays(ctx.recentActivities, 7);

  if (idle !== null && idle >= 7 && ctx.ctl >= 15) {
    hits.push({
      priority: 80,
      tone: "fresh",
      headline: "Lang pause fra trening",
      detail: `Det er ${idle} dager siden siste økt. CTL vil begynne å falle uten ny belastning.`,
      signal: { label: `${idle}d uten økt`, severity: "caution" },
      tip: "Start med 45–60 min rolig økt for å reaktivere systemet.",
    });
  } else if (idle !== null && idle >= 4 && ctx.ctl >= 25) {
    hits.push({
      priority: 45,
      tone: "balanced",
      headline: "Hviledager hoper seg opp",
      detail: `${idle} dager uten trening. En lett økt holder flyten uten å øke belastningen mye.`,
      signal: { label: "Hvileperiode", severity: "neutral" },
      tip: "20–40 min lett bevegelse kan hjelpe restitusjon uten å tære på formen.",
    });
  }

  if (sessions7 === 0 && ctx.dayOfWeek >= 4 && ctx.ctl >= 12) {
    hits.push({
      priority: 72,
      tone: "building",
      headline: "Ingen økter denne uken",
      detail: "Du er midt i uken uten registrert trening. Ukemål og fitness kan påvirkes.",
      signal: { label: "0 økter/uke", severity: "caution" },
      tip: "Planlegg minst to økter de neste dagene hvis kroppen føles klar.",
    });
  } else if (sessions7 >= 6) {
    hits.push({
      priority: 50,
      tone: "building",
      headline: "Høy treningsfrekvens",
      detail: `${sessions7} treningsdager siste 7 dager — mye for de fleste å absorbere uten ekstra hvile.`,
      signal: { label: `${sessions7}d/uke`, severity: "caution" },
      tip: "Sørg for minst én full hviledag og én dag med veldig lav intensitet.",
    });
  }

  if (streak >= 5) {
    hits.push({
      priority: 60,
      tone: "building",
      headline: "Lang treningsstreak",
      detail: `${streak} dager på rad med trening. Kroppen får lite rom til å bygge seg opp mellom økter.`,
      signal: { label: `${streak}d streak`, severity: "caution" },
      tip: "Bryt streaken med hvile eller aktiv restitusjon i dag.",
    });
  }

  if (hard7 >= 4) {
    hits.push({
      priority: 68,
      tone: "risk",
      headline: "Mange harde dager",
      detail: `${hard7} harde økter (TSS ≥ ${HARD_TSS}) siste uken. Dette tærer raskt på restitusjonskapasiteten.`,
      signal: { label: `${hard7} harde økter`, severity: "warning" },
      tip: "Bytt én planlagt hard økt til sone 1/2 de neste 48 timene.",
    });
  } else if (hard7 === 0 && sessions7 >= 3 && ctx.ctl > 20) {
    hits.push({
      priority: 20,
      tone: "balanced",
      headline: "Mest rolig trening",
      detail: "Ingen harde økter siste uke — fint for base, men legg inn kvalitet for å utvikle toppform.",
      signal: { label: "Lav intensitet", severity: "neutral" },
      tip: "Én strukturert hard økt per uke gir god fremgang uten å overbelaste.",
    });
  }

  const mono = dominantSport(ctx.recentActivities, 7);
  if (mono) {
    const sport = SPORT_NB[mono] ?? "samme sport";
    hits.push({
      priority: 22,
      tone: "balanced",
      headline: "Ensidig belastning",
      detail: `Mesteparten av øktene siste uken er ${sport}. Variasjon kan redusere slitasje og skaderisiko.`,
      signal: { label: "Lite variasjon", severity: "neutral" },
      tip: "Bytt én økt med annen sport eller styrke for bedre balanse.",
    });
  }

  const sameSportStreak = longestRecentStreakSameSport(
    ctx.recentActivities.filter((a) => {
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - 10);
      return a.date >= toDateKey(cutoff);
    }),
  );
  if (sameSportStreak >= 5) {
    hits.push({
      priority: 28,
      tone: "balanced",
      headline: "Repeterende samme sport",
      detail: `${sameSportStreak} økter på rad i samme sport — vurder å bryte mønsteret.`,
      signal: { label: "Monotoni", severity: "neutral" },
    });
  }

  return hits;
}

function evaluateGoalRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];
  const goal = ctx.weeklyTssGoal;
  if (!goal || goal <= 0) return hits;

  const progress = (ctx.weekTss / goal) * 100;
  const daysLeft = 6 - (ctx.dayOfWeek === 0 ? 6 : ctx.dayOfWeek - 1);
  const expectedByNow = ((7 - daysLeft) / 7) * goal;

  if (progress >= 115) {
    hits.push({
      priority: 42,
      tone: ctx.tsb < -15 ? "building" : "balanced",
      headline: "Over ukemålet",
      detail: `${ctx.weekTss.toFixed(0)} TSS mot mål ${goal} — du har passert ukesmålet.`,
      signal: { label: `${progress.toFixed(0)}% av mål`, severity: ctx.tsb < -15 ? "caution" : "positive" },
      tip:
        ctx.tsb < -15
          ? "Du er over mål, men sliten — prioriter kvalitet fremfor mer volum."
          : "Bra uke! Vurder å avslutte kontrollert hvis du skal spare energi til helgen.",
    });
  } else if (ctx.weekTss < expectedByNow * 0.55 && ctx.dayOfWeek >= 4) {
    hits.push({
      priority: 58,
      tone: "building",
      headline: "Bak på ukemål",
      detail: `Du har ${ctx.weekTss.toFixed(0)} TSS av ${goal} og få dager igjen i uken.`,
      signal: { label: "Under mål", severity: "caution" },
      tip: `Trenger ca. ${Math.max(0, goal - ctx.weekTss).toFixed(0)} TSS til — fordel på ${Math.min(daysLeft, 3)} økter, ikke alt på én dag.`,
    });
  } else if (progress >= 70 && progress < 100 && daysLeft <= 2) {
    hits.push({
      priority: 32,
      tone: "balanced",
      headline: "Nærmer deg ukemål",
      detail: `${progress.toFixed(0)} % av ukentlig TSS-mål er fullført med helg igjen.`,
      signal: { label: "På sporet", severity: "positive" },
    });
  }

  return hits;
}

function evaluateRaceRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];
  const days = ctx.daysToRace;
  if (days === null || days < 0 || !ctx.raceName) return hits;

  if (days <= 3) {
    hits.push({
      priority: 95,
      tone: "fresh",
      headline: "Racedag nærmer seg",
      detail: `${ctx.raceName} om ${days === 0 ? "i dag" : days === 1 ? "1 dag" : `${days} dager`}. Fokus på hvile, søvn og lett bevegelse.`,
      signal: { label: "Race-modus", severity: "positive" },
      tip: "Ingen harde økter nå — korte, skarpe markører maks 2 dager før start om du er vant til det.",
    });
  } else if (days <= 7) {
    hits.push({
      priority: 88,
      tone: "fresh",
      headline: "Raceuke",
      detail: `${ctx.raceName} om ${days} dager. Reduser volum, behold litt skarphet, prioriter søvn.`,
      signal: { label: `Race om ${days}d`, severity: "positive" },
      tip: "Kutt treningsvolum 40–60 % denne uken. TSB bør trende opp mot start.",
    });
  } else if (days <= 14) {
    hits.push({
      priority: 62,
      tone: "balanced",
      headline: "Taper-fase nærmer seg",
      detail: `${ctx.raceName} om ${days} dager. Begynn å redusere akkumulert tretthet gradvis.`,
      signal: { label: "Pre-taper", severity: "neutral" },
      tip: "Siste harde blokk nå — deretter trapp ned volum uke for uke.",
    });
  } else if (days <= 28 && ctx.tsb < -20) {
    hits.push({
      priority: 52,
      tone: "building",
      headline: "Trenger friskere form til race",
      detail: `${ctx.raceName} om ${days} dager, men TSB er lav (${ctx.tsb.toFixed(0)}). Planlegg restitusjonsuke snart.`,
      signal: { label: "Race på gang", severity: "caution" },
      tip: "Bygg inn en lettere uke innen 2–3 uker før konkurransen.",
    });
  }

  return hits;
}

function evaluatePlanningRules(ctx: TrainingInsightContext): RuleHit[] {
  const hits: RuleHit[] = [];

  if (ctx.plannedWorkoutsNext7Days >= 4 && ctx.tsb < -20) {
    hits.push({
      priority: 64,
      tone: "building",
      headline: "Ambisiøs ukeplan",
      detail: `${ctx.plannedWorkoutsNext7Days} planlagte økter fremover mens kroppen allerede er sliten.`,
      signal: { label: "Full kalender", severity: "caution" },
      tip: "Vurder å flytte eller forkorte 1–2 planlagte økter i kalenderen.",
    });
  } else if (ctx.plannedWorkoutsNext7Days === 0 && ctx.ctl > 20 && (daysSinceLastActivity(ctx.recentActivities) ?? 99) <= 2) {
    hits.push({
      priority: 18,
      tone: "balanced",
      headline: "Ingen planlagte økter",
      detail: "Du trener jevn, men har ingenting i kalenderen fremover.",
      signal: { label: "Tom kalender", severity: "neutral" },
      tip: "Legg inn 2–3 økter i kalenderen for bedre struktur og progresjon.",
    });
  }

  const veryHard = ctx.recentActivities.filter((a) => a.tss >= VERY_HARD_TSS).length;
  if (veryHard >= 2 && ctx.tsb < -10) {
    hits.push({
      priority: 58,
      tone: "building",
      headline: "Tunge økter i det siste",
      detail: `${veryHard} svært harde økter (TSS ≥ ${VERY_HARD_TSS}) nylig — kroppen trenger tid til å absorbere dem.`,
      signal: { label: "Tunge økter", severity: "caution" },
    });
  }

  return hits;
}

function computeReadiness(ctx: TrainingInsightContext, signals: InsightSignal[]): number {
  let score = 50 + ctx.tsb * 1.2;

  if (ctx.ctl >= 30) score += 5;
  if (ctx.ctl < 10) score -= 5;

  const ratio = acwr(ctx.ctl, ctx.atl);
  if (ratio !== null) {
    if (ratio > 1.5) score -= 15;
    else if (ratio < 0.8) score += 5;
  }

  const idle = daysSinceLastActivity(ctx.recentActivities);
  if (idle !== null && idle >= 5) score -= 8;

  for (const s of signals) {
    if (s.severity === "warning") score -= 8;
    else if (s.severity === "caution") score -= 3;
    else if (s.severity === "positive") score += 4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function mergeInsight(hits: RuleHit[]): TrainingInsight {
  const sorted = [...hits].sort((a, b) => b.priority - a.priority);
  const primary = sorted[0];

  const warningCount = hits.filter((h) => h.tone === "risk" || h.signal?.severity === "warning").length;
  let tone = primary.tone;
  if (warningCount >= 2 && tone !== "risk") tone = "building";
  if (warningCount >= 3) tone = "risk";

  const secondary = sorted.find((h) => h !== primary && h.priority >= 50);
  let detail = primary.detail;
  if (secondary && secondary.detail !== primary.detail) {
    detail = `${primary.detail} ${secondary.detail}`;
  }

  const signals: InsightSignal[] = [];
  const seenSignals = new Set<string>();
  for (const hit of sorted) {
    if (hit.signal && !seenSignals.has(hit.signal.label)) {
      seenSignals.add(hit.signal.label);
      signals.push(hit.signal);
    }
    if (signals.length >= 6) break;
  }

  const tips: string[] = [];
  const seenTips = new Set<string>();
  for (const hit of sorted) {
    if (hit.tip && !seenTips.has(hit.tip)) {
      seenTips.add(hit.tip);
      tips.push(hit.tip);
    }
    if (tips.length >= 4) break;
  }

  return {
    headline: primary.headline,
    detail,
    tone,
    signals,
    tips,
    readiness: 0,
  };
}

/** All rule hits for full coach report (no cap). */
export function collectAllRuleHits(ctx: TrainingInsightContext): RuleHit[] {
  return [
    ...evaluateRaceRules(ctx),
    ...evaluateFormRules(ctx),
    ...evaluateTrendRules(ctx),
    ...evaluateConsistencyRules(ctx),
    ...evaluateGoalRules(ctx),
    ...evaluatePlanningRules(ctx),
  ].sort((a, b) => b.priority - a.priority);
}

/** Rule-based coaching summary — no external AI, runs entirely on your training data. */
export function getTrainingInsight(ctx: TrainingInsightContext): TrainingInsight {
  const hits = collectAllRuleHits(ctx);

  if (hits.length === 0) {
    return {
      headline: "Ingen analyse ennå",
      detail: "Synk Strava og tren noen dager for å få personlige råd.",
      tone: "balanced",
      signals: [],
      tips: ["Koble til Strava under Konto i Mer-menyen."],
      readiness: 50,
    };
  }

  const result = mergeInsight(hits);
  result.readiness = computeReadiness(ctx, result.signals);
  return result;
}

/** Minimal context helper for tests and simple call sites. */
export function createInsightContext(
  partial: Partial<TrainingInsightContext> & Pick<TrainingInsightContext, "ctl" | "atl" | "tsb">,
): TrainingInsightContext {
  return {
    dailyLoads: [],
    recentActivities: [],
    weekTss: 0,
    prevWeekTss: 0,
    weeklyTssGoal: null,
    raceName: null,
    daysToRace: null,
    plannedWorkoutsNext7Days: 0,
    dayOfWeek: 1,
    ...partial,
  };
}
