import { describe, expect, it } from "vitest";
import { bestRollingAverage } from "@/lib/peak-efforts/rolling-window";

function uniformStream(values: number[]): { t: number; v: number }[] {
  return values.map((v, i) => ({ t: i, v }));
}

describe("bestRollingAverage", () => {
  it("finds the best constant-power window", () => {
    const samples = uniformStream([100, 100, 100, 300, 300, 300, 100, 100]);
    const result = bestRollingAverage(samples, 3);
    expect(result).toBeCloseTo(300, 5);
  });

  it("returns null when the stream is shorter than the window", () => {
    const samples = uniformStream([100, 100, 100]);
    const result = bestRollingAverage(samples, 10);
    expect(result).toBeNull();
  });

  it("returns null for an empty stream", () => {
    expect(bestRollingAverage([], 5)).toBeNull();
  });

  it("handles a known best 5s window amid noise", () => {
    // Best 5-consecutive-second average is 400,400,400,400,400 = 400.
    const samples = uniformStream([
      100, 150, 200, 400, 400, 400, 400, 400, 150, 100, 100,
    ]);
    const result = bestRollingAverage(samples, 5);
    expect(result).toBeCloseTo(400, 5);
  });

  it("handles non-uniform sample intervals via time-weighted windowing", () => {
    // Gap between t=1 and t=10: a 3s window can't validly form inside the gap.
    const samples = [
      { t: 0, v: 100 },
      { t: 1, v: 100 },
      { t: 10, v: 500 },
      { t: 11, v: 500 },
      { t: 12, v: 500 },
      { t: 13, v: 500 },
    ];
    const result = bestRollingAverage(samples, 3);
    expect(result).toBeCloseTo(500, 5);
  });
});
