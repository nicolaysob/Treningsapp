import { OLT_ZONES, type OltZone } from "@/lib/training-load/olt-zones";

export interface ActivityForZone {
  durationSec: number;
  zoneS1Sec?: number | null;
  zoneS2Sec?: number | null;
  zoneS3Sec?: number | null;
  zoneS4Sec?: number | null;
  zoneS5Sec?: number | null;
}

export interface ZoneDuration {
  zone: OltZone;
  label: string;
  durationSec: number;
  percent: number;
}

export interface WeeklyZoneDistribution {
  weekStart: string;
  weekEnd: string;
  totalDurationSec: number;
  classifiedDurationSec: number;
  zones: ZoneDuration[];
  easyPercent: number;
  hardPercent: number;
  targetEasyPercent: number;
  targetHardPercent: number;
}

function hasStreamZones(activity: ActivityForZone): boolean {
  return (
    activity.zoneS1Sec !== null &&
    activity.zoneS1Sec !== undefined &&
    activity.zoneS2Sec !== null &&
    activity.zoneS2Sec !== undefined &&
    activity.zoneS3Sec !== null &&
    activity.zoneS3Sec !== undefined &&
    activity.zoneS4Sec !== null &&
    activity.zoneS4Sec !== undefined &&
    activity.zoneS5Sec !== null &&
    activity.zoneS5Sec !== undefined
  );
}

export function buildWeeklyZoneDistribution(
  activities: ActivityForZone[],
  weekStartKey: string,
  weekEndKey: string,
): WeeklyZoneDistribution {
  const totals = new Map<OltZone, number>([
    ["z1", 0],
    ["z2", 0],
    ["z3", 0],
    ["z4", 0],
    ["z5", 0],
    ["unknown", 0],
  ]);

  for (const activity of activities) {
    if (hasStreamZones(activity)) {
      totals.set("z1", (totals.get("z1") ?? 0) + (activity.zoneS1Sec ?? 0));
      totals.set("z2", (totals.get("z2") ?? 0) + (activity.zoneS2Sec ?? 0));
      totals.set("z3", (totals.get("z3") ?? 0) + (activity.zoneS3Sec ?? 0));
      totals.set("z4", (totals.get("z4") ?? 0) + (activity.zoneS4Sec ?? 0));
      totals.set("z5", (totals.get("z5") ?? 0) + (activity.zoneS5Sec ?? 0));
    } else if (activity.durationSec > 0) {
      totals.set("unknown", (totals.get("unknown") ?? 0) + activity.durationSec);
    }
  }

  const totalDurationSec = [...totals.values()].reduce((sum, sec) => sum + sec, 0);
  const classifiedDurationSec = totalDurationSec - (totals.get("unknown") ?? 0);

  const zones: ZoneDuration[] = OLT_ZONES.map((def) => {
    const durationSec = totals.get(def.zone) ?? 0;
    const base = classifiedDurationSec > 0 ? classifiedDurationSec : totalDurationSec;
    const percent = base > 0 ? (durationSec / base) * 100 : 0;
    return { zone: def.zone, label: def.label, durationSec, percent };
  });

  const z1 = zones.find((z) => z.zone === "z1")?.percent ?? 0;
  const z2 = zones.find((z) => z.zone === "z2")?.percent ?? 0;
  const z4 = zones.find((z) => z.zone === "z4")?.percent ?? 0;
  const z5 = zones.find((z) => z.zone === "z5")?.percent ?? 0;

  return {
    weekStart: weekStartKey,
    weekEnd: weekEndKey,
    totalDurationSec,
    classifiedDurationSec,
    zones,
    easyPercent: z1 + z2,
    hardPercent: z4 + z5,
    targetEasyPercent: 80,
    targetHardPercent: 20,
  };
}

export function formatDurationShort(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}t ${minutes}m`;
  return `${minutes}m`;
}
