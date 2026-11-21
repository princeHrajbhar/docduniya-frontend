import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession, homeFor } from "@/lib/session-core";

// Optimistic role-based routing. Each role can only reach its own area.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  const area = pathname.startsWith("/doctor")
    ? "doctor"
    : pathname.startsWith("/patient")
      ? "patient"
      : null;

  if (area) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login/${area}`, request.url));
    }
    if (session.role !== area) {
      return NextResponse.redirect(new URL(homeFor(session.role), request.url));
    }
  }

  // Signed-in users skip the landing and login pages.
  if (session && (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login/:path*", "/signup/:path*", "/patient/:path*", "/doctor/:path*"],
};
