import { describe, expect, it } from "vitest";
import { bestTimeForDistance } from "@/lib/peak-efforts/distance-window";

function linearDistanceStream(
  points: { t: number; d: number }[],
): { t: number; d: number }[] {
  return points;
}

describe("bestTimeForDistance", () => {
  it("finds the fastest segment over a target distance", () => {
    const samples = linearDistanceStream([
      { t: 0, d: 0 },
      { t: 100, d: 500 },
      { t: 200, d: 1000 },
      { t: 350, d: 1500 },
      { t: 500, d: 2000 },
    ]);

    const result = bestTimeForDistance(samples, 1000);
    expect(result).toBe(200);
  });

  it("returns null when the activity is shorter than the target distance", () => {
    const samples = linearDistanceStream([
      { t: 0, d: 0 },
      { t: 100, d: 500 },
    ]);

    expect(bestTimeForDistance(samples, 1000)).toBeNull();
  });

  it("returns null for an empty stream", () => {
    expect(bestTimeForDistance([], 1000)).toBeNull();
  });

  it("picks the faster of two possible windows", () => {
    const samples = linearDistanceStream([
      { t: 0, d: 0 },
      { t: 300, d: 1000 },
      { t: 500, d: 1200 },
      { t: 700, d: 2200 },
    ]);

    const result = bestTimeForDistance(samples, 1000);
    expect(result).toBe(200);
  });
});
