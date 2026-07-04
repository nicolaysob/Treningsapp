import { describe, expect, it } from "vitest";
import { createInsightContext, getTrainingInsight } from "@/lib/training-load/insight";

describe("getTrainingInsight", () => {
  it("flags early base-building when CTL is very low", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 5, atl: 5, tsb: 0 }));
    expect(result.tone).toBe("building");
    expect(result.headline).toMatch(/grunnform/i);
  });

  it("flags very fresh form when TSB is very high", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 10, tsb: 40 }));
    expect(result.tone).toBe("fresh");
    expect(result.headline).toMatch(/uthvilt/i);
  });

  it("flags fresh-and-ready for moderately positive TSB", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 40, tsb: 10 }));
    expect(result.tone).toBe("fresh");
  });

  it("flags balanced load for TSB near zero", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 52, tsb: -2 }));
    expect(result.tone).toBe("balanced");
  });

  it("flags building-under-pressure for moderately negative TSB", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 65, tsb: -15 }));
    expect(result.tone).toBe("building");
  });

  it("flags high overload risk for very negative TSB", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 90, tsb: -40 }));
    expect(result.tone).toBe("risk");
    expect(result.headline).toMatch(/risiko/i);
  });

  it("escalates tone when ACWR spikes even with balanced TSB", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 40, atl: 65, tsb: -2 }));
    expect(result.tone).toBe("building");
    expect(result.detail).toMatch(/skaderisiko|belastning/i);
    expect(result.signals.some((s) => s.label.startsWith("ACWR"))).toBe(true);
  });

  it("prioritizes race week over generic form advice", () => {
    const result = getTrainingInsight(
      createInsightContext({
        ctl: 50,
        atl: 52,
        tsb: -2,
        raceName: "Oslo Maraton",
        daysToRace: 5,
      }),
    );
    expect(result.headline).toMatch(/race/i);
    expect(result.signals.some((s) => s.label.includes("Race"))).toBe(true);
  });

  it("warns when behind weekly TSS goal late in the week", () => {
    const result = getTrainingInsight(
      createInsightContext({
        ctl: 45,
        atl: 48,
        tsb: -3,
        weekTss: 80,
        weeklyTssGoal: 400,
        dayOfWeek: 5,
      }),
    );
    expect(result.tips.join(" ")).toMatch(/TSS/i);
    expect(result.signals.some((s) => s.label.includes("mål"))).toBe(true);
  });

  it("detects long training pause", () => {
    const today = new Date();
    const eightDaysAgo = new Date(today);
    eightDaysAgo.setUTCDate(eightDaysAgo.getUTCDate() - 8);

    const result = getTrainingInsight(
      createInsightContext({
        ctl: 40,
        atl: 20,
        tsb: 20,
        recentActivities: [
          {
            date: eightDaysAgo.toISOString().slice(0, 10),
            sport: "RUN",
            tss: 60,
            durationSec: 3600,
          },
        ],
      }),
    );
    expect(result.signals.some((s) => s.label.includes("uten økt"))).toBe(true);
  });

  it("returns readiness score between 0 and 100", () => {
    const result = getTrainingInsight(createInsightContext({ ctl: 50, atl: 52, tsb: -2 }));
    expect(result.readiness).toBeGreaterThanOrEqual(0);
    expect(result.readiness).toBeLessThanOrEqual(100);
  });
});
