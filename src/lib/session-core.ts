/**
 * Session primitives shared by the proxy (request time) and server code.
 * Nothing here imports `next/headers`, so it is safe to use from `proxy.ts`.
 *
 * Three httpOnly cookies live on the frontend's own domain:
 *   dd_at       backend access token (JWT, ~15 min), sent as `Authorization: Bearer`
 *   dd_rt       backend refresh token (7 days, rotated on every refresh)
 *   dd_session  a small profile used for routing and UI (role, name, linked profile ids)
 *
 * dd_session is a hint, not an authority: every API call is authorized by the backend with
 * the access token, so editing the cookie can at most show a broken page, never other data.
 */

import { ROLES, type Role, type Session } from "@/types/auth";

export { ROLES };
export type * from "@/types/auth";

export const SESSION_COOKIE = "dd_session";
export const ACCESS_COOKIE = "dd_at";
export const REFRESH_COOKIE = "dd_rt";

/** Refresh a little before the backend's 15-minute access token expires. */
export const ACCESS_MAX_AGE = 13 * 60;
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

export function encodeSession(session: Session): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (ROLES.includes(parsed?.role) && typeof parsed.userId === "string") {
      return parsed as Session;
    }
  } catch {
    // malformed cookie
  }
  return null;
}

/** Where each role lands after signing in. */
export function homeFor(role: Role) {
  return `/${role}/dashboard`;
}

/** Only same-site relative paths may be used as a post-login destination. */
export function safeNext(next: unknown, role: Role): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return homeFor(role);
  }
  const area = ROLES.find((r) => next === `/${r}` || next.startsWith(`/${r}/`));
  return area && area !== role ? homeFor(role) : next;
}

export function apiBaseUrl() {
  return (process.env.API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
}

/** Pulls `name=value` out of the backend's Set-Cookie headers. */
export function readSetCookie(headers: Headers, name: string): string | undefined {
  for (const line of headers.getSetCookie()) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0 && pair.slice(0, eq).trim() === name) {
      const value = decodeURIComponent(pair.slice(eq + 1).trim());
      return value || undefined;
    }
  }
  return undefined;
}

export type TokenPair = { accessToken: string; refreshToken: string };

/*
 * The backend rotates refresh tokens and revokes the whole session when an old token is
 * replayed. Several requests can reach the proxy at once after the access token lapses
 * (a page load plus its prefetches), so refreshes are shared: concurrent callers with the
 * same refresh token await one network call, and late callers within a short window reuse
 * its result instead of replaying the now-rotated token.
 */
const inflight = new Map<string, Promise<TokenPair | null>>();
const recent = new Map<string, { tokens: TokenPair; at: number }>();
const REUSE_WINDOW_MS = 30_000;

export function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  const cached = recent.get(refreshToken);
  if (cached && Date.now() - cached.at < REUSE_WINDOW_MS) return Promise.resolve(cached.tokens);

  const pending = inflight.get(refreshToken);
  if (pending) return pending;

  const work = (async () => {
    try {
      const res = await fetch(`${apiBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { data?: { accessToken?: string } };
      const accessToken = body.data?.accessToken;
      const rotated = readSetCookie(res.headers, "refreshToken");
      if (!accessToken || !rotated) return null;
      const tokens = { accessToken, refreshToken: rotated };
      recent.set(refreshToken, { tokens, at: Date.now() });
      for (const [key, entry] of recent) {
        if (Date.now() - entry.at > REUSE_WINDOW_MS) recent.delete(key);
      }
      return tokens;
    } catch {
      return null;
    } finally {
      inflight.delete(refreshToken);
    }
  })();
  inflight.set(refreshToken, work);
  return work;
}
