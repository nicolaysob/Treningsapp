import { describe, expect, it } from "vitest";
import { bestTimeForDistance } from "@/lib/peak-efforts/distance-window";
import { computeBestTimeCandidates } from "@/lib/peak-efforts/detect";

describe("bestTimeForDistance", () => {
  it("interpolates exact distance between GPS samples", () => {
    const samples = [
      { t: 0, d: 0 },
      { t: 200, d: 1000 },
      { t: 600, d: 3000 },
    ];

    const result = bestTimeForDistance(samples, 2000, "RUN");
    expect(result).toBeCloseTo(400, 5);
  });

  it("returns null when the activity is shorter than the target distance", () => {
    const samples = [
      { t: 0, d: 0 },
      { t: 100, d: 500 },
    ];

    expect(bestTimeForDistance(samples, 1000, "RUN")).toBeNull();
  });

  it("returns null for an empty stream", () => {
    expect(bestTimeForDistance([], 1000, "RUN")).toBeNull();
  });

  it("rejects implausible GPS spikes", () => {
    const samples = [
      { t: 0, d: 0 },
      { t: 1, d: 1000 },
      { t: 2, d: 3000 },
    ];

    expect(bestTimeForDistance(samples, 1000, "RUN")).toBeNull();
  });

  it("normalizes streams that do not start at zero", () => {
    const samples = [
      { t: 10, d: 100 },
      { t: 210, d: 1100 },
      { t: 610, d: 3100 },
    ];

    const result = bestTimeForDistance(samples, 2000, "RUN");
    expect(result).toBeCloseTo(400, 5);
  });
});

describe("computeBestTimeCandidates", () => {
  it("prefers activity moving time for near-exact race distances", () => {
    const candidates = computeBestTimeCandidates(
      "RUN",
      {
        distance: [
          { t: 0, d: 0 },
          { t: 1200, d: 5000 },
        ],
      },
      { distanceM: 5020, durationSec: 1500 },
    );

    const fiveK = candidates.find((c) => c.distanceM === 5000);
    expect(fiveK?.value).toBe(1500);
  });

  it("uses stream segments for efforts inside longer activities", () => {
    const candidates = computeBestTimeCandidates(
      "RUN",
      {
        distance: [
          { t: 0, d: 0 },
          { t: 1200, d: 5000 },
          { t: 3600, d: 12000 },
        ],
      },
      { distanceM: 12000, durationSec: 3600 },
    );

    const fiveK = candidates.find((c) => c.distanceM === 5000);
    const tenK = candidates.find((c) => c.distanceM === 10000);
    expect(fiveK?.value).toBeCloseTo(1200, 5);
    expect(tenK?.value).toBeGreaterThan(2000);
  });
});
