import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  ROLES,
  SESSION_COOKIE,
  cookieOptions,
  decodeSession,
  ADMIN_LOGIN_PATH,
  homeFor,
  loginPathFor,
  refreshTokens,
  type TokenPair,
} from "@/lib/session-core";

/**
 * Runs before every page and server action:
 *  1. Keeps the backend session alive: when the short-lived access token has lapsed but a
 *     refresh token remains, it rotates both and hands the new access token to this request.
 *  2. Optimistic role routing: each role reaches only its own area. The backend still
 *     authorizes every call; this only spares people pages they can't use.
 * (Next.js 16 renamed `middleware.ts` to `proxy.ts`.)
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  let tokens: TokenPair | null = null;
  let signedOut = !access && !refresh;
  if (!access && refresh) {
    tokens = await refreshTokens(refresh);
    if (tokens) {
      // Let the server components rendering this request see the fresh token.
      request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
      request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    } else {
      signedOut = true;
      request.cookies.delete(REFRESH_COOKIE);
      request.cookies.delete(SESSION_COOKIE);
    }
  }

  const session = signedOut ? null : decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const area = ROLES.find((r) => pathname === `/${r}` || pathname.startsWith(`/${r}/`));

  let response: NextResponse;
  if (area && !session) {
    const login = new URL(loginPathFor(area), request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(login);
  } else if (area && session && (session.role !== area || pathname === `/${area}`)) {
    response = NextResponse.redirect(new URL(homeFor(session.role), request.url));
  } else if (
    session &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname === ADMIN_LOGIN_PATH)
  ) {
    response = NextResponse.redirect(new URL(homeFor(session.role), request.url));
  } else if (pathname.startsWith("/onboarding") && signedOut) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else {
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (tokens) {
    response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_MAX_AGE));
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
  } else if (signedOut && (refresh || request.cookies.has(SESSION_COOKIE))) {
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export const config = {
  // Everything except static assets and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt)$).*)"],
};
