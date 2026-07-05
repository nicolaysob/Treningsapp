import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import {
  buildStravaAuthorizeUrl,
  mobileStravaRedirectUri,
} from "@/lib/strava/link-account";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const redirectUri = mobileStravaRedirectUri(origin);

  return NextResponse.json({
    url: buildStravaAuthorizeUrl(redirectUri),
    redirectUri,
  });
}
