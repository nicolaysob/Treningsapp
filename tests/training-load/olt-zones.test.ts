import { describe, expect, it } from "vitest";
import { classifyOltZone, OLT_ZONES } from "@/lib/training-load/olt-zones";

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
