/**
 * MOCK SESSION — for frontend development only.
 * The cookie is NOT signed or encrypted. Replace with your backend's
 * token (e.g. a JWT issued by the API) before going to production.
 */

import { ROLES, type Role, type Session } from "@/types/auth";

export { ROLES };
export type * from "@/types/auth";

export const SESSION_COOKIE = "dd_session";

export function encodeSession(session: Session): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (ROLES.includes(parsed?.role)) {
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
