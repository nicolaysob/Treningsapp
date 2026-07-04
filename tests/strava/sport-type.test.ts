import { describe, expect, it } from "vitest";
import { isOutdoorCycling } from "@/lib/strava/sport-type";

describe("isOutdoorCycling", () => {
  it("rejects virtual rides", () => {
    expect(isOutdoorCycling({ sport_type: "VirtualRide" })).toBe(false);
  });

  it("accepts outdoor rides", () => {
    expect(isOutdoorCycling({ sport_type: "Ride" })).toBe(true);
    expect(isOutdoorCycling({ sport_type: "GravelRide" })).toBe(true);
  });

  it("accepts activities without sport_type metadata", () => {
    expect(isOutdoorCycling(null)).toBe(true);
  });
});
