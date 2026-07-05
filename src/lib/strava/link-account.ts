import { prisma } from "@/lib/db";

interface StravaTokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    profile: string;
  };
}

export type StravaLinkError = "token_exchange_failed" | "strava_taken";

export async function linkStravaAccount(
  userId: string,
  code: string,
  redirectUri: string,
  fallbackImage?: string | null,
): Promise<{ ok: true } | { ok: false; error: StravaLinkError }> {
  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_STRAVA_ID ?? "",
      client_secret: process.env.AUTH_STRAVA_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Strava token exchange failed", await tokenRes.text());
    return { ok: false, error: "token_exchange_failed" };
  }

  const tokenData = (await tokenRes.json()) as StravaTokenExchangeResponse;
  const stravaAthleteId = BigInt(tokenData.athlete.id);

  const existingUserWithAthlete = await prisma.user.findUnique({
    where: { stravaAthleteId },
    select: { id: true },
  });
  if (existingUserWithAthlete && existingUserWithAthlete.id !== userId) {
    return { ok: false, error: "strava_taken" };
  }

  await prisma.$transaction([
    prisma.account.deleteMany({
      where: { userId, provider: "strava" },
    }),
    prisma.account.create({
      data: {
        userId,
        type: "oauth",
        provider: "strava",
        providerAccountId: String(tokenData.athlete.id),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        token_type: "bearer",
        scope: "read,activity:read_all",
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        stravaAthleteId,
        image: fallbackImage ?? tokenData.athlete.profile,
      },
    }),
  ]);

  return { ok: true };
}

export async function disconnectStravaAccount(userId: string): Promise<void> {
  await prisma.account.deleteMany({
    where: { userId, provider: "strava" },
  });
}

export function mobileStravaRedirectUri(origin: string): string {
  return new URL("/api/mobile/strava/oauth-redirect", origin).toString();
}

export function buildStravaAuthorizeUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.AUTH_STRAVA_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });
  if (state) params.set("state", state);
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export function isAllowedMobileReturnTo(returnTo: string): boolean {
  return returnTo.startsWith("exp://") || returnTo.startsWith("treningsapp://");
}

export function appendQueryParam(url: string, key: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}
