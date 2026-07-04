import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Starts a custom (non-NextAuth-managed) Strava OAuth flow to link a Strava
 * account to the currently signed-in app user. Kept separate from the app's
 * own login (Credentials) so connecting/disconnecting Strava never creates
 * or switches the active user account.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  const params = new URLSearchParams({
    client_id: process.env.AUTH_STRAVA_ID ?? "",
    redirect_uri: new URL("/api/strava/callback", request.nextUrl.origin).toString(),
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params.toString()}`);
}
