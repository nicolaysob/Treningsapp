import { describe, expect, it } from "vitest";
import { getCoachReport } from "@/lib/training-load/coach-report";
import { createInsightContext } from "@/lib/training-load/insight";

describe("getCoachReport", () => {
  it("builds a full report with metrics and day plan", () => {
    const report = getCoachReport(
      createInsightContext({ ctl: 50, atl: 52, tsb: -2, weekTss: 280, prevWeekTss: 240 }),
    );

    expect(report.metrics.length).toBeGreaterThanOrEqual(3);
    expect(report.dayPlan).toHaveLength(3);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.summary.readiness).toBeGreaterThanOrEqual(0);
  });

  it("includes sport breakdown when activities exist", () => {
    const report = getCoachReport(
      createInsightContext({
        ctl: 45,
        atl: 48,
        tsb: -3,
        recentActivities: [
          { date: "2026-07-03", sport: "RUN", tss: 80, durationSec: 3600 },
          { date: "2026-07-02", sport: "RUN", tss: 60, durationSec: 3000 },
          { date: "2026-07-01", sport: "RIDE", tss: 120, durationSec: 7200 },
        ],
      }),
    );

    expect(report.sports.length).toBe(2);
    expect(report.sports[0].label).toBe("Løping");
  });

  it("prioritizes race advice in findings when race is near", () => {
    const report = getCoachReport(
      createInsightContext({
        ctl: 55,
        atl: 40,
        tsb: 15,
        raceName: "Birken",
        daysToRace: 5,
      }),
    );

    expect(report.findings[0].title).toMatch(/race/i);
    expect(report.dayPlan.every((d) => d.intensity === "rest" || d.intensity === "easy")).toBe(true);
  });
});
