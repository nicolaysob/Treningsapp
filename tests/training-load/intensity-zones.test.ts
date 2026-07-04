import { describe, expect, it } from "vitest";
import { buildWeeklyZoneDistribution } from "@/lib/training-load/intensity-zones";
import { estimateHrMaxFromActivities } from "@/lib/training-load/estimate-hr-max";
import {
  computeZoneSecondsFromHrStream,
  parseStravaHrStream,
} from "@/lib/strava/hr-stream-zones";

describe("computeZoneSecondsFromHrStream", () => {
  it("weights each sample by time delta into OLT zones", () => {
    const hrMax = 190;
    const result = computeZoneSecondsFromHrStream(
      [114, 171, 171],
      [0, 60, 180],
      hrMax,
    );

    expect(result.z1).toBe(60);
    expect(result.z4).toBe(120);
  });
});

describe("parseStravaHrStream", () => {
  it("returns null without heartrate stream", () => {
    expect(parseStravaHrStream({})).toBeNull();
  });
});

describe("buildWeeklyZoneDistribution", () => {
  it("aggregates five OLT zones for polarized 80/20", () => {
    const result = buildWeeklyZoneDistribution(
      [
        {
          durationSec: 3600,
          zoneS1Sec: 2400,
          zoneS2Sec: 600,
          zoneS3Sec: 300,
          zoneS4Sec: 200,
          zoneS5Sec: 100,
        },
      ],
      "2026-06-30",
      "6. jul",
    );

    expect(result.easyPercent).toBeCloseTo(83.3, 0);
    expect(result.hardPercent).toBeCloseTo(8.3, 0);
    expect(result.zones).toHaveLength(5);
  });
});

describe("estimateHrMaxFromActivities", () => {
  it("estimates above highest average HR", () => {
    expect(
      estimateHrMaxFromActivities([
        { avgHr: 165, durationSec: 3600 },
        { avgHr: 172, durationSec: 2400 },
      ]),
    ).toBe(180);
  });
});
