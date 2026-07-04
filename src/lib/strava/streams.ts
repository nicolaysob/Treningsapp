import { stravaRequest } from "./client";
import { buildMovingDistanceSamples, type DistanceSample } from "@/lib/peak-efforts/distance-window";

interface StravaStreamSet {
  time?: { data: number[] };
  distance?: { data: number[] };
  moving?: { data: boolean[] };
}

export interface ActivityStreams {
  distance: DistanceSample[];
}

export async function fetchActivityStreams(
  stravaActivityId: bigint,
  accessToken: string,
): Promise<ActivityStreams> {
  const { data } = await stravaRequest<StravaStreamSet>(
    `/activities/${stravaActivityId}/streams?keys=time,distance,moving&key_by_type=true`,
    accessToken,
  );

  const time = data.time?.data ?? [];
  const distance = data.distance?.data ?? [];
  const moving = data.moving?.data;

  return { distance: buildMovingDistanceSamples(time, distance, moving) };
}
