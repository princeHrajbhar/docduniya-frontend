import "server-only";

import { requireSession } from "@/lib/session";

/** The signed-in admin and whether they hold a platform permission. */
export async function adminContext(permission?: string) {
  const session = await requireSession("admin");
  const permissions = session.permissions ?? [];
  return { session, allowed: !permission || permissions.includes(permission), permissions };
}
