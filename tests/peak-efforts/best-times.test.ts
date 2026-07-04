import { describe, expect, it } from "vitest";
import {
  activityMatchesTarget,
  normalizedTimeSec,
  pickBestTimesFromActivities,
} from "@/lib/peak-efforts/best-times";
import { computeBestTimeCandidates } from "@/lib/peak-efforts/detect";

describe("activityMatchesTarget", () => {
  it("matches a 5k race within tolerance", () => {
    expect(activityMatchesTarget(5020, 5000)).toBe(true);
  });

  it("rejects clearly different distances", () => {
    expect(activityMatchesTarget(8000, 5000)).toBe(false);
  });
});

describe("normalizedTimeSec", () => {
  it("scales time to the target distance", () => {
    expect(normalizedTimeSec(1500, 5020, 5000)).toBeCloseTo(1494, 0);
  });
});

describe("pickBestTimesFromActivities", () => {
  it("picks the fastest normalized 5k", () => {
    const records = pickBestTimesFromActivities("RUN", [
      { durationSec: 1500, distanceM: 5020, date: new Date("2025-01-01") },
      { durationSec: 1600, distanceM: 5010, date: new Date("2025-02-01") },
    ]);

    const fiveK = records.find((r) => r.distanceM === 5000);
    expect(fiveK?.timeSec).toBeCloseTo(1494, 0);
    expect(fiveK?.achievedAt).toEqual(new Date("2025-01-01"));
  });

  it("ignores activities outside distance tolerance", () => {
    const records = pickBestTimesFromActivities("RUN", [
      { durationSec: 3600, distanceM: 12000, date: new Date("2025-01-01") },
    ]);

    expect(records.find((r) => r.distanceM === 5000)?.timeSec).toBeNull();
  });
});

describe("computeBestTimeCandidates", () => {
  it("creates candidates from matching activities only", () => {
    const candidates = computeBestTimeCandidates("RUN", {
      distanceM: 5020,
      durationSec: 1500,
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0].distanceM).toBe(5000);
    expect(candidates[0].value).toBeCloseTo(1494, 0);
  });
});
