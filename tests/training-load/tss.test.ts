import { describe, expect, it } from "vitest";
import {
  computeActivityTss,
  computeHrTss,
  computePowerTss,
  computeRunningTss,
} from "@/lib/training-load/tss";

describe("computePowerTss", () => {
  it("returns 100 for a 1-hour ride exactly at FTP", () => {
    const result = computePowerTss({ durationSec: 3600, npWatts: 200, ftpWatts: 200 });
    expect(result).toBeCloseTo(100, 5);
  });

  it("scales with duration", () => {
    const result = computePowerTss({ durationSec: 1800, npWatts: 200, ftpWatts: 200 });
    expect(result).toBeCloseTo(50, 5);
  });

  it("scales quadratically with intensity", () => {
    const result = computePowerTss({ durationSec: 3600, npWatts: 400, ftpWatts: 200 });
    expect(result).toBeCloseTo(400, 5);
  });
});

describe("computeHrTss", () => {
  it("returns 100 for a 1-hour effort exactly at HR threshold", () => {
    const result = computeHrTss({ durationSec: 3600, avgHr: 160, hrThresholdBpm: 160 });
    expect(result).toBeCloseTo(100, 5);
  });
});

describe("computeRunningTss", () => {
  it("returns 100 for a 1-hour run exactly at threshold pace", () => {
    const result = computeRunningTss({
      durationSec: 3600,
      avgPaceSecPerKm: 240,
      thresholdPaceSecPerKm: 240,
    });
    expect(result).toBeCloseTo(100, 5);
  });

  it("gives higher TSS for a faster-than-threshold pace", () => {
    const result = computeRunningTss({
      durationSec: 3600,
      avgPaceSecPerKm: 200,
      thresholdPaceSecPerKm: 240,
    });
    expect(result).toBeGreaterThan(100);
  });
});

describe("computeActivityTss", () => {
  const thresholds = { ftpWatts: 200, thresholdPaceSecPerKm: 240, hrThresholdBpm: 160 };

  it("prefers power for rides when FTP and watts are available", () => {
    const { tss, method } = computeActivityTss(
      {
        sport: "RIDE",
        durationSec: 3600,
        npWatts: 200,
        avgWatts: 190,
        avgHr: null,
        avgPaceSecPerKm: null,
      },
      thresholds,
    );
    expect(method).toBe("power");
    expect(tss).toBeCloseTo(100, 5);
  });

  it("falls back to HR for rides without power data", () => {
    const { tss, method } = computeActivityTss(
      {
        sport: "RIDE",
        durationSec: 3600,
        npWatts: null,
        avgWatts: null,
        avgHr: 160,
        avgPaceSecPerKm: null,
      },
      thresholds,
    );
    expect(method).toBe("hr");
    expect(tss).toBeCloseTo(100, 5);
  });

  it("prefers pace for runs when threshold pace is available", () => {
    const { tss, method } = computeActivityTss(
      {
        sport: "RUN",
        durationSec: 3600,
        npWatts: null,
        avgWatts: null,
        avgHr: null,
        avgPaceSecPerKm: 240,
      },
      thresholds,
    );
    expect(method).toBe("pace");
    expect(tss).toBeCloseTo(100, 5);
  });

  it("returns null when no relevant threshold is set", () => {
    const { tss, method } = computeActivityTss(
      {
        sport: "RIDE",
        durationSec: 3600,
        npWatts: 200,
        avgWatts: 200,
        avgHr: null,
        avgPaceSecPerKm: null,
      },
      { ftpWatts: null, thresholdPaceSecPerKm: null, hrThresholdBpm: null },
    );
    expect(tss).toBeNull();
    expect(method).toBeNull();
  });
});
