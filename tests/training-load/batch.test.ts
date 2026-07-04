import { describe, expect, it } from "vitest";
import { buildDailyLoadSeries } from "@/lib/training-load/batch";

function utcDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

describe("buildDailyLoadSeries", () => {
  it("computes CTL/ATL/TSB across consecutive days with rest days", () => {
    const dailyTssByKey = new Map<string, number>([
      ["2026-07-01", 100],
      ["2026-07-03", 50],
    ]);

    const series = buildDailyLoadSeries(
      dailyTssByKey,
      utcDay("2026-07-01"),
      utcDay("2026-07-03"),
    );

    expect(series).toHaveLength(3);
    expect(series[0].dailyTss).toBe(100);
    expect(series[1].dailyTss).toBe(0);
    expect(series[2].dailyTss).toBe(50);
    expect(series[0].ctl).toBeGreaterThan(0);
    expect(series[0].atl).toBeGreaterThan(0);
    expect(series[0].tsb).toBe(0);
    expect(series[2].ctl).toBeGreaterThan(series[1].ctl);
  });
});
