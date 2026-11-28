import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE, decodeSession, loginPathFor } from "@/lib/session-core";

/**
 * Reached when the backend rejects a session (revoked elsewhere, password changed, account
 * disabled). Server components can't clear cookies, so they redirect here to do it.
 */
export function GET(request: NextRequest) {
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const login = new URL(session ? loginPathFor(session.role) : "/login", request.url);
  login.searchParams.set("expired", "1");
  const response = NextResponse.redirect(login);
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) response.cookies.delete(name);
  return response;
}
