import {
  classifyOltZone,
  emptyOltZoneSeconds,
  type OltZone,
} from "@/lib/training-load/olt-zones";

export type ZoneSeconds = Record<OltZone, number>;

export function computeZoneSecondsFromHrStream(
  heartrate: number[],
  time: number[],
  hrMaxBpm: number,
): ZoneSeconds {
  const totals = emptyOltZoneSeconds();
  const len = Math.min(heartrate.length, time.length);
  if (len < 2) return totals;

  for (let i = 0; i < len - 1; i++) {
    const hr = heartrate[i];
    const dt = Math.max(1, time[i + 1] - time[i]);
    const zone = classifyOltZone(hr, hrMaxBpm);
    totals[zone] += dt;
  }

  return totals;
}

interface StravaStreamsByKey {
  heartrate?: { data: number[] };
  time?: { data: number[] };
}

export function parseStravaHrStream(data: StravaStreamsByKey): {
  heartrate: number[];
  time: number[];
} | null {
  const heartrate = data.heartrate?.data;
  if (!heartrate || heartrate.length === 0) return null;

  const time = data.time?.data;
  if (!time || time.length === 0) {
    return {
      heartrate,
      time: heartrate.map((_, index) => index),
    };
  }

  return { heartrate, time };
}

export function peakHrFromStream(heartrate: number[]): number | null {
  const valid = heartrate.filter((hr) => hr >= 40);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}
