import { prisma } from "@/lib/db";

const STRAVA_TOKEN_URL = "https://www.strava.com/api/v3/oauth/token";
const REFRESH_MARGIN_SEC = 5 * 60;

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * Reads/refreshes the Strava access token directly from the Account row,
 * independent of any active NextAuth session — required so the background
 * sync job can run for users who aren't actively browsing.
 */
export async function ensureFreshToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "strava" },
  });

  if (!account?.access_token || !account.refresh_token) {
    throw new Error(`No Strava account linked for user ${userId}`);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at ?? 0;

  if (expiresAt - nowSec > REFRESH_MARGIN_SEC) {
    return account.access_token;
  }

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_STRAVA_ID ?? "",
      client_secret: process.env.AUTH_STRAVA_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to refresh Strava token: ${res.status} ${await res.text()}`,
    );
  }

  const json = (await res.json()) as StravaTokenResponse;

  // Strava rotates the refresh token on every use — must overwrite it.
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      expires_at: json.expires_at,
    },
  });

  return json.access_token;
}
