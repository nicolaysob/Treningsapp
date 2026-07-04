import { stravaRequest } from "./client";

export interface StravaBestEffort {
  name: string;
  distance: number;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  pr_rank: number | null;
}

export interface StravaActivityDetail {
  id: number;
  sport_type: string;
  type: string;
  trainer: boolean;
  best_efforts?: StravaBestEffort[];
}

export async function fetchActivityDetail(
  stravaActivityId: bigint,
  accessToken: string,
): Promise<StravaActivityDetail> {
  const { data } = await stravaRequest<StravaActivityDetail>(
    `/activities/${stravaActivityId}`,
    accessToken,
  );
  return data;
}
