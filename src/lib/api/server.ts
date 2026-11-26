import "server-only";

import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/session-core";
import { ApiError, friendlyMessage } from "./errors";

type Query = Record<string, string | number | boolean | undefined | null>;

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** Send the signed-in user's access token. Default true. */
  auth?: boolean;
  /**
   * Every backend mutation requires an Idempotency-Key. One is generated per call unless
   * given, so pass a stable key when the same logical action may be retried.
   */
  idempotencyKey?: string;
  /** Redirect to sign-in when the backend rejects the session. Default true for auth calls. */
  redirectOn401?: boolean;
  /** Extra headers, e.g. a refresh cookie for /auth endpoints. */
  headers?: Record<string, string>;
  /** Forward the visitor's IP and user agent. Default true; false for cached public reads. */
  forwardClient?: boolean;
  /** Use this access token instead of the cookie (right after sign-in, before cookies apply). */
  token?: string;
};

export type Envelope<T> = {
  data: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; pages: number };
  headers: Headers;
};

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const newIdempotencyKey = () => crypto.randomUUID().replaceAll("-", "");

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

/** Full response envelope, for endpoints that return pagination or a message. */
export async function apiEnvelope<T>(path: string, options: ApiOptions = {}): Promise<Envelope<T>> {
  const method = options.method ?? "GET";
  const auth = options.auth ?? true;
  const requestHeaders: Record<string, string> = { Accept: "application/json", ...options.headers };

  if (options.body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (MUTATING.has(method)) requestHeaders["Idempotency-Key"] = options.idempotencyKey ?? newIdempotencyKey();

  // Pass the visitor's address and browser on, so backend rate limits and session lists
  // describe the real client rather than this server. Cached public reads opt out, since
  // request headers can't be read inside a `use cache` scope.
  if (options.forwardClient !== false) {
    const incoming = await headers();
    const forwardedFor = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
    if (forwardedFor) requestHeaders["X-Forwarded-For"] = forwardedFor;
    const userAgent = incoming.get("user-agent");
    if (userAgent) requestHeaders["User-Agent"] = userAgent;
  }

  if (auth) {
    const token = options.token ?? (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), {
      method,
      headers: requestHeaders,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "API_UNREACHABLE", "We couldn't reach DocDuniya's servers. Check your connection and try again.");
  }

  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    // Non-JSON (e.g. a proxy error page): fall through to the status-based error below.
  }

  if (!res.ok || json.success === false) {
    const error = new ApiError(
      res.status,
      typeof json.code === "string" ? json.code : `HTTP_${res.status}`,
      typeof json.message === "string" ? json.message : res.statusText || "Request failed",
      json.errors,
    );
    if (res.status === 401 && auth && (options.redirectOn401 ?? true)) {
      // The session was revoked or expired beyond refresh: clear it and ask to sign in again.
      redirect("/session-expired");
    }
    throw error;
  }

  return {
    data: json.data as T,
    message: typeof json.message === "string" ? json.message : undefined,
    pagination: json.pagination as Envelope<T>["pagination"],
    headers: res.headers,
  };
}

/** Calls the backend and returns the unwrapped `data`. Throws ApiError on failure. */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  return (await apiEnvelope<T>(path, options)).data;
}

/** Like `api`, but resolves to `null` for 404 instead of throwing. */
export async function apiOrNull<T>(path: string, options: ApiOptions = {}): Promise<T | null> {
  try {
    return await api<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type Attempt<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Awaits a backend call and returns a result instead of throwing, so pages can render an
 * error state without building JSX inside try/catch. Framework signals (the 401 redirect,
 * notFound) still propagate.
 */
export async function attempt<T>(work: Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, data: await work };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, error: friendlyMessage(error) };
  }
}
