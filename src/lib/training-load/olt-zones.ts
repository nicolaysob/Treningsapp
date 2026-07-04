/** Olympiatoppen I-skala (2024) — % av HFmaks */
export type OltZone = "z1" | "z2" | "z3" | "z4" | "z5" | "unknown";

export interface OltZoneDef {
  zone: OltZone;
  label: string;
  minRatio: number;
  maxRatio: number;
}

export const OLT_ZONES: OltZoneDef[] = [
  { zone: "z1", label: "Sone 1", minRatio: 0.55, maxRatio: 0.72 },
  { zone: "z2", label: "Sone 2", minRatio: 0.72, maxRatio: 0.82 },
  { zone: "z3", label: "Sone 3", minRatio: 0.82, maxRatio: 0.87 },
  { zone: "z4", label: "Sone 4", minRatio: 0.87, maxRatio: 0.92 },
  { zone: "z5", label: "Sone 5", minRatio: 0.92, maxRatio: 1.01 },
];

export function classifyOltZone(hr: number, hrMaxBpm: number): OltZone {
  if (!hr || hr < 40 || hrMaxBpm <= 0) return "unknown";

  const ratio = hr / hrMaxBpm;
  if (ratio < OLT_ZONES[0].minRatio) return "z1";

  for (const def of OLT_ZONES) {
    if (ratio >= def.minRatio && ratio < def.maxRatio) return def.zone;
  }

  return "z5";
}

export function formatOltZoneRange(def: OltZoneDef): string {
  const min = Math.round(def.minRatio * 100);
  const max = Math.round(def.maxRatio * 100);
  return `${min}–${max}% maks`;
}

export function getOltZoneDef(zone: OltZone): OltZoneDef | undefined {
  return OLT_ZONES.find((z) => z.zone === zone);
}

export function emptyOltZoneSeconds(): Record<OltZone, number> {
  return { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0, unknown: 0 };
}
