import { describe, expect, it } from "vitest";
import { nextAtl, nextCtl, tsb, tsbColor } from "@/lib/training-load/pmc";

describe("nextCtl / nextAtl", () => {
  it("converges toward a constant daily TSS over time", () => {
    let ctl = 0;
    for (let i = 0; i < 1000; i++) {
      ctl = nextCtl(ctl, 80);
    }
    expect(ctl).toBeCloseTo(80, 1);
  });

  it("decays toward zero with no training", () => {
    let ctl = 80;
    for (let i = 0; i < 1000; i++) {
      ctl = nextCtl(ctl, 0);
    }
    expect(ctl).toBeCloseTo(0, 1);
  });

  it("ATL reacts faster than CTL to a TSS spike", () => {
    const ctlAfterOneDay = nextCtl(50, 150);
    const atlAfterOneDay = nextAtl(50, 150);
    expect(atlAfterOneDay).toBeGreaterThan(ctlAfterOneDay);
  });
});

describe("tsb", () => {
  it("is the difference between CTL and ATL", () => {
    expect(tsb(80, 60)).toBe(20);
    expect(tsb(60, 80)).toBe(-20);
  });
});

describe("tsbColor", () => {
  it("classifies fresh, neutral, and fatigued form", () => {
    expect(tsbColor(10)).toBe("fresh");
    expect(tsbColor(0)).toBe("neutral");
    expect(tsbColor(-15)).toBe("fatigued");
  });
});
