import { describe, expect, it } from "vitest";
import { classifyOltZone, formatOltZoneRange, OLT_ZONES } from "@/lib/training-load/olt-zones";

describe("classifyOltZone", () => {
  const hrMax = 190;

  it("classifies Olympiatoppen zones from % of makspuls", () => {
    expect(classifyOltZone(Math.round(hrMax * 0.6), hrMax)).toBe("z1");
    expect(classifyOltZone(Math.round(hrMax * 0.75), hrMax)).toBe("z2");
    expect(classifyOltZone(Math.round(hrMax * 0.84), hrMax)).toBe("z3");
    expect(classifyOltZone(Math.round(hrMax * 0.9), hrMax)).toBe("z4");
    expect(classifyOltZone(Math.round(hrMax * 0.95), hrMax)).toBe("z5");
  });

  it("covers five OLT zone definitions", () => {
    expect(OLT_ZONES).toHaveLength(5);
  });
});

describe("formatOltZoneRange", () => {
  it("formats zone range as percent of max HR", () => {
    expect(formatOltZoneRange(OLT_ZONES[0])).toBe("55–72% maks");
    expect(formatOltZoneRange(OLT_ZONES[4])).toBe("92–101% maks");
  });
});
