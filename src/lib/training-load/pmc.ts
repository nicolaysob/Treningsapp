const CTL_DAYS = 42;
const ATL_DAYS = 7;

export function nextCtl(prevCtl: number, todayTss: number): number {
  return prevCtl + (todayTss - prevCtl) * (1 - Math.exp(-1 / CTL_DAYS));
}

export function nextAtl(prevAtl: number, todayTss: number): number {
  return prevAtl + (todayTss - prevAtl) * (1 - Math.exp(-1 / ATL_DAYS));
}

/** TSB(today) = CTL(yesterday) - ATL(yesterday). */
export function tsb(prevCtl: number, prevAtl: number): number {
  return prevCtl - prevAtl;
}

export type TsbStatus = "fresh" | "neutral" | "fatigued";

export function tsbColor(tsbValue: number): TsbStatus {
  if (tsbValue > 5) return "fresh";
  if (tsbValue < -10) return "fatigued";
  return "neutral";
}
