import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import { linkStravaAccount, mobileStravaRedirectUri } from "@/lib/strava/link-account";

export async function POST(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { code?: string };
  const code = body.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "Mangler autorisasjonskode" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const redirectUri = mobileStravaRedirectUri(origin);
  const result = await linkStravaAccount(userId, code, redirectUri);

  if (!result.ok) {
    const message =
      result.error === "strava_taken"
        ? "Denne Strava-kontoen er allerede koblet til en annen bruker"
        : "Kunne ikke koble til Strava";
    return NextResponse.json({ error: message, code: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
