"use server";

import { redirect } from "next/navigation";
import { ApiError, friendlyMessage } from "@/lib/api/errors";
import { str } from "@/lib/actions";
import { clearAuth, safeNext } from "@/lib/session";
import {
  adminSignIn,
  completeMfa,
  resendAdminSignInCode,
  verifyAdminSignInCode,
} from "@/services/identity";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Administrator portal sign-in, one step at a time:
 *   password → code emailed to the administrator → (authenticator code, if enrolled) → console.
 * Patients and doctors cannot pass the first step; the backend answers as for a wrong password.
 */
export type AdminLoginState = {
  step: "password" | "code" | "authenticator";
  email?: string;
  /** Short-lived, single-use token for the current step. Useless without the emailed code. */
  challengeToken?: string;
  sentTo?: string;
  expiresAt?: string;
  /** When the latest code was sent (ISO), for the resend countdown. */
  sentAt?: string;
  error?: string;
  notice?: string;
};

const start = (email: string | undefined, error?: string): AdminLoginState => ({ step: "password", email, error });

/** Codes the backend uses when the attempt itself is over and the password must be re-entered. */
const attemptOver = (error: unknown) =>
  error instanceof ApiError && (error.code === "TOKEN_INVALID" || error.code === "OTP_MAX_ATTEMPTS");

export async function adminLoginStep(
  next: string | undefined,
  prev: AdminLoginState,
  form: FormData,
): Promise<AdminLoginState> {
  const intent = str(form, "intent");

  if (intent === "restart") return start(prev.email);

  if (intent === "password") {
    const email = str(form, "email").toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!EMAIL_RE.test(email)) return start(email, "Enter a valid email address.");
    if (!password) return start(email, "Enter your password.");
    try {
      const step = await adminSignIn(email, password);
      return { step: "code", email, ...step, sentAt: new Date().toISOString() };
    } catch (error) {
      if (!(error instanceof ApiError) || error.status >= 500) console.error("[admin login]", error);
      return start(email, friendlyMessage(error));
    }
  }

  if (!prev.challengeToken) return start(prev.email, "This sign-in attempt expired. Sign in again.");

  if (intent === "resend") {
    try {
      const sent = await resendAdminSignInCode(prev.challengeToken);
      return {
        ...prev,
        ...sent,
        sentAt: new Date().toISOString(),
        error: undefined,
        notice: `We sent a new code to ${sent.sentTo}.`,
      };
    } catch (error) {
      if (attemptOver(error)) return start(prev.email, "This sign-in attempt expired. Sign in again.");
      return { ...prev, notice: undefined, error: friendlyMessage(error) };
    }
  }

  let destination: string;
  try {
    if (intent === "code") {
      const code = str(form, "code").replace(/\s/g, "");
      if (!/^\d{6}$/.test(code)) return { ...prev, notice: undefined, error: "Enter the 6-digit code from the email." };
      const outcome = await verifyAdminSignInCode(prev.challengeToken, code);
      if (outcome.kind === "mfa")
        return { step: "authenticator", email: prev.email, challengeToken: outcome.challengeToken };
      destination = safeNext(next, "admin");
    } else if (intent === "authenticator") {
      const code = str(form, "code").replace(/\s/g, "");
      if (!code) return { ...prev, error: "Enter the 6-digit code from your authenticator app." };
      const outcome = await completeMfa(
        prev.challengeToken,
        /^\d{6}$/.test(code) ? { code } : { recoveryCode: code },
        "admin",
      );
      if (outcome.kind !== "signed-in") return start(prev.email, "Please sign in again.");
      destination = safeNext(next, "admin");
    } else {
      return start(prev.email);
    }
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_ADMIN") {
      await clearAuth();
      return start(prev.email, friendlyMessage(error));
    }
    if (attemptOver(error)) return start(prev.email, "This sign-in attempt expired. Sign in again.");
    // A wrong code keeps the step; the backend says how many attempts are left.
    const message =
      error instanceof ApiError && error.code === "OTP_INVALID"
        ? error.message
        : error instanceof ApiError && error.code === "INVALID_CREDENTIALS"
          ? "That code isn't right. Use the current code from your authenticator app."
          : friendlyMessage(error);
    return { ...prev, notice: undefined, error: message };
  }
  redirect(destination);
}
