import { NextResponse, type NextRequest } from "next/server";
import { ROLES, SESSION_COOKIE, decodeSession, homeFor } from "@/lib/session-core";

// Optimistic role-based routing. Each role can only reach its own area.
// (Next.js 16 renamed `middleware.ts` to `proxy.ts`.)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  const area = ROLES.find((r) => pathname === `/${r}` || pathname.startsWith(`/${r}/`));

  if (area) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login/${area}`, request.url));
    }
    if (session.role !== area || pathname === `/${area}`) {
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
  matcher: [
    "/",
    "/login/:path*",
    "/signup/:path*",
    "/patient/:path*",
    "/doctor/:path*",
    "/admin/:path*",
  ],
};
