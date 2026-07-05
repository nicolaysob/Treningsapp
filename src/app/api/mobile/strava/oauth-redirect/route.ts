import { NextRequest, NextResponse } from "next/server";

const APP_SCHEME = "treningsapp://strava/callback";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${APP_SCHEME}?error=strava`);
  }

  return NextResponse.redirect(`${APP_SCHEME}?code=${encodeURIComponent(code)}`);
}
