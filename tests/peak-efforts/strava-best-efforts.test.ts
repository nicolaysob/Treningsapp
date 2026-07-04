import { describe, expect, it } from "vitest";
import {
  bestEffortsToCandidates,
  mapStravaEffortDistance,
  activitySummaryToCandidates,
} from "@/lib/peak-efforts/strava-best-efforts";
import { mergeBestTimeRecords, pickBestTimesFromActivities } from "@/lib/peak-efforts/best-times";
import { countsForBestTimes, isOutdoorCycling } from "@/lib/strava/sport-type";

describe("mapStravaEffortDistance", () => {
  it("maps Strava 5k effort to 5000m bucket", () => {
    expect(mapStravaEffortDistance(5000, "RUN")).toBe(5000);
  });

  it("maps Strava 20k cycling effort", () => {
    expect(mapStravaEffortDistance(20000, "RIDE")).toBe(20000);
  });
});

describe("bestEffortsToCandidates", () => {
  it("imports Strava best efforts with elapsed time", () => {
    const candidates = bestEffortsToCandidates("RUN", [
      {
        name: "5K",
        distance: 5000,
        elapsed_time: 1500,
        moving_time: 1600,
        start_date: "2025-06-01T10:00:00Z",
        pr_rank: 1,
      },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].value).toBe(1500);
  });
});

describe("activitySummaryToCandidates", () => {
  it("creates fallback from whole activity distance", () => {
    const candidates = activitySummaryToCandidates(
      "RIDE",
      50200,
      7200,
      new Date("2025-06-01"),
    );

    expect(candidates.find((c) => c.distanceM === 50000)).toBeDefined();
  });
});

describe("pickBestTimesFromActivities", () => {
  it("shows times from synced activities immediately", () => {
    const records = pickBestTimesFromActivities("RIDE", [
      { durationSec: 3600, distanceM: 10200, date: new Date("2025-06-01") },
    ]);

    expect(records.find((r) => r.distanceM === 10000)?.timeSec).not.toBeNull();
  });
});

describe("mergeBestTimeRecords", () => {
  it("picks the faster time across sources", () => {
    const merged = mergeBestTimeRecords(
      [5000],
      [{ distanceM: 5000, label: "5 km", timeSec: 1500, achievedAt: new Date(), actualDistanceM: 5020 }],
      [{ distanceM: 5000, label: "5 km", timeSec: 1400, achievedAt: new Date(), actualDistanceM: 5000 }],
    );

    expect(merged[0].timeSec).toBe(1400);
  });
});

describe("countsForBestTimes", () => {
  it("rejects indoor cycling", () => {
    expect(countsForBestTimes("RIDE", { sport_type: "VirtualRide", trainer: false })).toBe(false);
  });
});

describe("isOutdoorCycling", () => {
  it("rejects virtual rides", () => {
    expect(isOutdoorCycling({ sport_type: "VirtualRide" })).toBe(false);
  });
});
