import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  SESSION_COOKIE,
  cookieOptions,
  decodeSession,
  encodeSession,
  type Role,
  type Session,
  type TokenPair,
} from "./session-core";

export * from "./session-core";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  if (!store.get(REFRESH_COOKIE) && !store.get(ACCESS_COOKIE)) return null;
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

/**
 * The session for a role-only area. The proxy already redirects visitors who don't belong;
 * this is the server-side check data loaders rely on.
 */
export async function requireSession(role: Role): Promise<Session> {
  // Signed-in pages are per request (they also use the current time), so they are never
  // part of a prerendered or prefetched shell.
  await connection();
  const session = await getSession();
  if (!session) redirect(`/login/${role}`);
  if (session.role !== role) redirect(`/${session.role}/dashboard`);
  return session;
}

/** Stores the backend tokens. Only callable from server actions and route handlers. */
export async function setTokens(tokens: TokenPair) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_MAX_AGE));
  store.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), cookieOptions(REFRESH_MAX_AGE));
}

export async function clearAuth() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(SESSION_COOKIE);
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
