import { describe, expect, it } from "vitest";
import { getTrainingInsight } from "@/lib/training-load/insight";

describe("getTrainingInsight", () => {
  it("flags early base-building when CTL is very low", () => {
    const result = getTrainingInsight({ ctl: 5, atl: 5, tsb: 0 });
    expect(result.tone).toBe("building");
    expect(result.headline).toMatch(/grunnform/i);
  });

  it("flags very fresh form when TSB is very high", () => {
    const result = getTrainingInsight({ ctl: 50, atl: 10, tsb: 40 });
    expect(result.tone).toBe("fresh");
    expect(result.headline).toMatch(/uthvilt/i);
  });

  it("flags fresh-and-ready for moderately positive TSB", () => {
    const result = getTrainingInsight({ ctl: 50, atl: 40, tsb: 10 });
    expect(result.tone).toBe("fresh");
  });

  it("flags balanced load for TSB near zero", () => {
    const result = getTrainingInsight({ ctl: 50, atl: 52, tsb: -2 });
    expect(result.tone).toBe("balanced");
  });

  it("flags building-under-pressure for moderately negative TSB", () => {
    const result = getTrainingInsight({ ctl: 50, atl: 65, tsb: -15 });
    expect(result.tone).toBe("building");
  });

  it("flags high overload risk for very negative TSB", () => {
    const result = getTrainingInsight({ ctl: 50, atl: 90, tsb: -40 });
    expect(result.tone).toBe("risk");
    expect(result.headline).toMatch(/risiko/i);
  });

  it("escalates tone when ACWR spikes even with balanced TSB", () => {
    const result = getTrainingInsight({ ctl: 40, atl: 65, tsb: -2 });
    expect(result.tone).toBe("building");
    expect(result.detail).toMatch(/skaderisiko/i);
  });
});
