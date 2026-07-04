import { stravaRequest } from "./client";
import type { DistanceSample } from "@/lib/peak-efforts/distance-window";

interface StravaStreamSet {
  time?: { data: number[] };
  distance?: { data: number[] };
}

export interface ActivityStreams {
  distance: DistanceSample[];
}

export async function fetchActivityStreams(
  stravaActivityId: bigint,
  accessToken: string,
): Promise<ActivityStreams> {
  const { data } = await stravaRequest<StravaStreamSet>(
    `/activities/${stravaActivityId}/streams?keys=time,distance&key_by_type=true`,
    accessToken,
  );

  const time = data.time?.data ?? [];
  const distance = data.distance?.data ?? [];

  const samples: DistanceSample[] = time.map((t, i) => ({
    t,
    d: distance[i] ?? 0,
  }));

  return { distance: samples };
}
