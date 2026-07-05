import { NextResponse } from "next/server";
import { getUserIdFromBearer } from "@/lib/auth-mobile";
import {
  buildStravaAuthorizeUrl,
  isAllowedMobileReturnTo,
  mobileStravaRedirectUri,
} from "@/lib/strava/link-account";

export async function GET(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");
  if (!returnTo || !isAllowedMobileReturnTo(returnTo)) {
    return NextResponse.json({ error: "Ugyldig retur-URL for appen" }, { status: 400 });
  }

  const origin = url.origin;
  const redirectUri = mobileStravaRedirectUri(origin);

  return NextResponse.json({
    url: buildStravaAuthorizeUrl(redirectUri, returnTo),
    redirectUri,
  });
}
