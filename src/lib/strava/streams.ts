import { stravaRequest } from "./client";
import type { StreamSample } from "@/lib/peak-efforts/rolling-window";

interface StravaStreamSet {
  time?: { data: number[] };
  watts?: { data: number[] };
  velocity_smooth?: { data: number[] };
}

export interface ActivityStreams {
  watts: StreamSample[];
  speed: StreamSample[];
}

export async function fetchActivityStreams(
  stravaActivityId: bigint,
  accessToken: string,
): Promise<ActivityStreams> {
  const { data } = await stravaRequest<StravaStreamSet>(
    `/activities/${stravaActivityId}/streams?keys=time,watts,velocity_smooth&key_by_type=true`,
    accessToken,
  );

  const time = data.time?.data ?? [];

  const watts: StreamSample[] =
    data.watts?.data.map((v, i) => ({ t: time[i] ?? i, v })) ?? [];
  const speed: StreamSample[] =
    data.velocity_smooth?.data.map((v, i) => ({ t: time[i] ?? i, v })) ?? [];

  return { watts, speed };
}
