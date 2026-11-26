import "server-only";

import { unstable_rethrow } from "next/navigation";
import { ApiError, friendlyMessage } from "@/lib/api/errors";

/** What every server action returns to its client component. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; code?: string; fieldErrors?: Record<string, string> };

export const initialAction = { ok: true, data: undefined } as ActionResult<undefined>;

/**
 * Runs an action body and turns backend errors into a displayable result. Framework
 * signals (redirect, notFound) are rethrown so they keep working inside the body.
 */
export async function run<T>(work: () => Promise<T>, message?: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work(), message };
  } catch (error) {
    unstable_rethrow(error);
    // Unexpected and server-side failures are logged in the frontend terminal with their real cause.
    if (!(error instanceof ApiError) || error.status >= 500) console.error("[action]", error);
    return {
      ok: false,
      error: friendlyMessage(error),
      code: error instanceof ApiError ? error.code : undefined,
      fieldErrors: error instanceof ApiError ? error.fieldErrors : undefined,
    };
  }
}

export const fail = (error: string, fieldErrors?: Record<string, string>): ActionResult<never> => ({
  ok: false,
  error,
  fieldErrors,
});

export const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
