import { cookies } from "next/headers";
import { SESSION_COOKIE, decodeSession, type Session } from "./session-core";

export * from "./session-core";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
