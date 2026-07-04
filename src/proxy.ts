import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

/**
 * Lightweight, DB-free redirect guard: only checks for the presence of a
 * session cookie so it can run in the Edge/proxy runtime (Prisma's node-postgres
 * driver adapter cannot). Real session validation (auth()) happens in each
 * page/route as the source of truth — this just avoids flashing protected
 * pages before that check runs.
 */
export default function proxy(req: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));

  if (!hasSessionCookie && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js).*)",
  ],
};
