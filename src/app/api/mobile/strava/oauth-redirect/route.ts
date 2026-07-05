import { NextRequest, NextResponse } from "next/server";
import {
  appendQueryParam,
  isAllowedMobileReturnTo,
} from "@/lib/strava/link-account";

function fallbackHtml(message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Treningsapp</title></head><body style="font-family:system-ui,sans-serif;background:#0c0c0f;color:#f4f4f5;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center"><div><h1 style="font-size:20px;margin:0 0 8px">Strava</h1><p style="color:#a1a1aa;line-height:1.5">${message}</p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const returnTo = request.nextUrl.searchParams.get("state");

  if (!returnTo || !isAllowedMobileReturnTo(returnTo)) {
    return fallbackHtml(
      error
        ? "Innloggingen feilet. Gå tilbake til appen og prøv igjen."
        : "Gå tilbake til Treningsapp og prøv Strava-kobling på nytt.",
    );
  }

  if (error || !code) {
    return NextResponse.redirect(appendQueryParam(returnTo, "error", "strava"));
  }

  return NextResponse.redirect(appendQueryParam(returnTo, "code", code));
}
