export interface TrainingInsightInput {
  ctl: number;
  atl: number;
  tsb: number;
}

export type InsightTone = "fresh" | "balanced" | "building" | "risk";

export interface TrainingInsight {
  headline: string;
  detail: string;
  tone: InsightTone;
}

/**
 * Rule-based training status summary from standard sports-science
 * interpretations of CTL (fitness), ATL (fatigue), TSB (form), and the
 * acute:chronic workload ratio (ATL/CTL) as an injury-risk signal.
 */
export function getTrainingInsight({ ctl, atl, tsb }: TrainingInsightInput): TrainingInsight {
  const acwr = ctl > 1 ? atl / ctl : null;

  let headline: string;
  let detail: string;
  let tone: InsightTone;

  if (ctl < 10) {
    headline = "Bygger grunnform";
    detail =
      "Du er tidlig i oppbyggingen. Fokuser på jevn, moderat trening for å bygge en treningsbase.";
    tone = "building";
  } else if (tsb > 25) {
    headline = "Veldig uthvilt";
    detail =
      "Formen er skyhøy, men CTL kan synke om du hviler for lenge. Vurder å trappe opp igjen.";
    tone = "fresh";
  } else if (tsb > 5) {
    headline = "Frisk og klar";
    detail =
      "God balanse mellom trening og restitusjon. Fint tidspunkt for harde økter eller konkurranse.";
    tone = "fresh";
  } else if (tsb > -10) {
    headline = "Balansert belastning";
    detail = "Du holder en sunn balanse mellom påkjenning og restitusjon. Fortsett som normalt.";
    tone = "balanced";
  } else if (tsb > -30) {
    headline = "Bygger form under press";
    detail = "Du trener hardt og kroppen er sliten. Følg med på søvn og restitusjon fremover.";
    tone = "building";
  } else {
    headline = "Høy risiko for overbelastning";
    detail =
      "Treningsbelastningen er høy over tid. Vurder en lettere uke eller hviledager for å unngå skade eller sykdom.";
    tone = "risk";
  }

  if (acwr !== null && acwr > 1.5) {
    detail += " Belastningen har økt raskt siste dagene — ekstra skaderisiko ved brå økning.";
    if (tone === "fresh" || tone === "balanced") tone = "building";
  }

  return { headline, detail, tone };
}
