import { describe, expect, it } from "vitest";
import {
  bestEffortsToCandidates,
  mapStravaEffortDistance,
} from "@/lib/peak-efforts/strava-best-efforts";
import { countsForBestTimes, isOutdoorCycling } from "@/lib/strava/sport-type";

describe("mapStravaEffortDistance", () => {
  it("maps Strava 5k effort to 5000m bucket", () => {
    expect(mapStravaEffortDistance(5000, "RUN")).toBe(5000);
  });

  it("maps Strava 20k cycling effort", () => {
    expect(mapStravaEffortDistance(20000, "RIDE")).toBe(20000);
  });

  it("ignores non-standard distances", () => {
    expect(mapStravaEffortDistance(12345, "RIDE")).toBeNull();
  });
});

describe("bestEffortsToCandidates", () => {
  it("imports Strava best efforts with moving time", () => {
    const candidates = bestEffortsToCandidates("RUN", [
      {
        name: "5K",
        distance: 5000,
        elapsed_time: 1600,
        moving_time: 1500,
        start_date: "2025-06-01T10:00:00Z",
        pr_rank: 1,
      },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].value).toBe(1500);
    expect(candidates[0].distanceM).toBe(5000);
  });
});

describe("countsForBestTimes", () => {
  it("rejects indoor cycling", () => {
    expect(countsForBestTimes("RIDE", { sport_type: "VirtualRide", trainer: false })).toBe(
      false,
    );
  });

  it("rejects trainer rides", () => {
    expect(countsForBestTimes("RIDE", { sport_type: "Ride", trainer: true })).toBe(false);
  });

  it("accepts outdoor rides", () => {
    expect(countsForBestTimes("RIDE", { sport_type: "Ride", trainer: false })).toBe(true);
  });
});

describe("isOutdoorCycling", () => {
  it("rejects virtual rides", () => {
    expect(isOutdoorCycling({ sport_type: "VirtualRide" })).toBe(false);
  });
});
