const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export class StravaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function isRateLimitNear(res: Response): boolean {
  const usage = res.headers.get("x-ratelimit-usage");
  const limit = res.headers.get("x-ratelimit-limit");
  if (!usage || !limit) return false;

  const [usage15, usageDay] = usage.split(",").map(Number);
  const [limit15, limitDay] = limit.split(",").map(Number);

  return usage15 / limit15 > 0.9 || usageDay / limitDay > 0.9;
}

export interface StravaResponse<T> {
  data: T;
  rateLimitNearLimit: boolean;
}

export async function stravaRequest<T>(
  path: string,
  accessToken: string,
): Promise<StravaResponse<T>> {
  const res = await fetch(`${STRAVA_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 429) {
    throw new StravaApiError("Strava rate limit exceeded", 429);
  }
  if (!res.ok) {
    throw new StravaApiError(
      `Strava API error ${res.status}: ${await res.text()}`,
      res.status,
    );
  }

  const rateLimitNearLimit = isRateLimitNear(res);
  const data = (await res.json()) as T;
  return { data, rateLimitNearLimit };
}
