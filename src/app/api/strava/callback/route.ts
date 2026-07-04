import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface StravaTokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error || !code) {
    return NextResponse.redirect(new URL("/settings?error=strava", request.nextUrl.origin));
  }

  const redirectUri = new URL("/api/strava/callback", request.nextUrl.origin).toString();

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
    return NextResponse.redirect(new URL("/settings?error=strava", request.nextUrl.origin));
  }

  const tokenData = (await tokenRes.json()) as StravaTokenExchangeResponse;
  const stravaAthleteId = BigInt(tokenData.athlete.id);

  // Guard: this Strava athlete must not already be linked to a different user.
  const existingUserWithAthlete = await prisma.user.findUnique({
    where: { stravaAthleteId },
    select: { id: true },
  });
  if (existingUserWithAthlete && existingUserWithAthlete.id !== session.user.id) {
    return NextResponse.redirect(new URL("/settings?error=strava_taken", request.nextUrl.origin));
  }

  await prisma.$transaction([
    prisma.account.deleteMany({
      where: { userId: session.user.id, provider: "strava" },
    }),
    prisma.account.create({
      data: {
        userId: session.user.id,
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
      where: { id: session.user.id },
      data: {
        stravaAthleteId,
        image: session.user.image ?? tokenData.athlete.profile,
      },
    }),
  ]);

  return NextResponse.redirect(new URL("/settings", request.nextUrl.origin));
}
