"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";
import { ApiError, friendlyMessage } from "@/lib/api/errors";
import { clearAuth, getRefreshToken, getSession, homeFor, safeNext, setSession, type Role } from "@/lib/session";
import { fail, run, str, type ActionResult } from "@/lib/actions";
import { completeMfa, getPractitioner, resolveSession, signIn, type SignInOutcome } from "@/services/identity";
import {
  createDoctorProfile,
  createPatientProfile,
  validateDoctor,
  validatePatient,
  type ProfileValues,
} from "./profiles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend's password policy so people see problems before submitting. */
function passwordProblem(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add a symbol such as ! or @.";
  return undefined;
}

function landing(outcome: Extract<SignInOutcome, { kind: "signed-in" }>, role: Role, next?: string) {
  if (outcome.needsProfile && role !== "admin") return `/onboarding/${role}`;
  return safeNext(next, role);
}

// ── Sign in ────────────────────────────────────────────────────────────────

export type LoginState = { error?: string; email?: string; challengeToken?: string };

export async function login(role: Role, next: string | undefined, _prev: LoginState, form: FormData): Promise<LoginState> {
  const email = str(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address.", email };
  if (!password) return { error: "Enter your password.", email };

  let destination: string;
  try {
    const outcome = await signIn(email, password, role);
    if (outcome.kind === "mfa") return { email, challengeToken: outcome.challengeToken };
    destination = landing(outcome, role, next);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_ADMIN") await clearAuth();
    if (!(error instanceof ApiError) || error.status >= 500) console.error("[login]", error);
    return { error: friendlyMessage(error), email };
  }
  redirect(destination);
}

export async function verifyMfa(role: Role, next: string | undefined, _prev: LoginState, form: FormData): Promise<LoginState> {
  const challengeToken = str(form, "challengeToken");
  const code = str(form, "code").replace(/\s/g, "");
  const email = str(form, "email");
  const useRecovery = !/^\d{6}$/.test(code);
  if (!code) return { error: "Enter the 6-digit code from your authenticator app.", email, challengeToken };

  let destination: string;
  try {
    const outcome = await completeMfa(challengeToken, useRecovery ? { recoveryCode: code } : { code }, role);
    if (outcome.kind !== "signed-in") return { error: "Please try again.", email, challengeToken };
    destination = landing(outcome, role, next);
  } catch (error) {
    const expired = error instanceof ApiError && error.status === 401;
    return {
      error: expired ? "This sign-in attempt expired. Enter your password again." : friendlyMessage(error),
      email,
      challengeToken: expired ? undefined : challengeToken,
    };
  }
  redirect(destination);
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // Revoke the backend session too, not just this browser's cookies.
    await api("/auth/logout", {
      method: "POST",
      auth: false,
      headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
    }).catch(() => undefined);
  }
  await clearAuth();
  redirect("/");
}

// ── Sign up: details + email code ──────────────────────────────────────────

export type SignupKind = "patient" | "doctor";
export type SignupPayload = { kind: SignupKind; email: string; password: string; profile: ProfileValues };

/** Step 1: validate everything, create the (unverified) account and email a code. */
export async function requestSignupCode(payload: SignupPayload): Promise<ActionResult<{ email: string }>> {
  const email = payload.email.trim().toLowerCase();
  const errors = payload.kind === "patient" ? validatePatient(payload.profile) : validateDoctor(payload.profile);
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  const weak = passwordProblem(payload.password);
  if (weak) errors.password = weak;
  if (Object.keys(errors).length > 0) return fail("Please fix the highlighted fields.", errors);

  return run(async () => {
    await api("/auth/register", { method: "POST", auth: false, body: { email, password: payload.password } });
    return { email };
  });
}

export async function resendCode(email: string, type: "REGISTER" | "RESET_PASSWORD" = "REGISTER") {
  return run(
    () => api("/auth/resend-otp", { method: "POST", auth: false, body: { email, type } }),
    "We've sent a new code.",
  );
}

/** Step 2: verify the code, sign in and create the patient or doctor profile. */
export async function completeSignup(payload: SignupPayload, otp: string): Promise<ActionResult<undefined>> {
  const email = payload.email.trim().toLowerCase();
  if (!/^\d{6}$/.test(otp)) return fail("Enter the 6-digit code from your email.");

  const verified = await run(() => api("/auth/verify-otp", { method: "POST", auth: false, body: { email, otp } }));
  if (!verified.ok) return verified;

  let destination = homeFor(payload.kind);
  try {
    const outcome = await signIn(email, payload.password, payload.kind);
    if (outcome.kind !== "signed-in") return fail("Your email is verified. Please sign in to continue.");
    try {
      // Cookies set during this action are not readable until the next request,
      // so the fresh access token is passed explicitly.
      const token = outcome.accessToken;
      if (payload.kind === "patient") await createPatientProfile(payload.profile, email, token);
      else await createDoctorProfile(payload.profile, email, { token });
      const { session } = await resolveSession(payload.kind, token);
      await setSession(session);
    } catch (error) {
      // The account exists and is signed in; let onboarding retry the profile step.
      console.error("[signup] profile creation failed", error);
      destination = `/onboarding/${payload.kind}?retry=1`;
    }
  } catch (error) {
    return fail(friendlyMessage(error, "Your email is verified, but we couldn't sign you in. Please sign in."));
  }
  redirect(destination);
}

// ── Onboarding: signed-in account without a profile yet ────────────────────

export async function completeOnboarding(kind: SignupKind, profile: ProfileValues): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session) redirect(`/login/${kind}`);
  const errors = kind === "patient" ? validatePatient(profile) : validateDoctor(profile);
  if (Object.keys(errors).length > 0) return fail("Please fix the highlighted fields.", errors);

  const result = await run(async () => {
    if (kind === "patient") await createPatientProfile(profile, session.email);
    else await createDoctorProfile(profile, session.email, { practitionerExists: Boolean(await getPractitioner()) });
    const { session: next } = await resolveSession(kind);
    await setSession(next);
  });
  if (!result.ok) return result;
  redirect(homeFor(kind));
}

// ── Passwords ──────────────────────────────────────────────────────────────

export async function forgotPassword(_prev: ActionResult<undefined> | null, form: FormData) {
  const email = str(form, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");
  const result = await run(() => api<undefined>("/auth/forgot-password", { method: "POST", auth: false, body: { email } }));
  // The backend answers the same way whether or not the account exists; so do we.
  return result.ok
    ? { ok: true as const, data: undefined, message: `If an account exists for ${email}, a reset link is on its way.` }
    : result;
}

export async function resetPassword(_prev: ActionResult<undefined> | null, form: FormData) {
  const token = str(form, "token");
  const email = str(form, "email").toLowerCase();
  const newPassword = String(form.get("password") ?? "");
  const confirm = String(form.get("confirmPassword") ?? "");
  const weak = passwordProblem(newPassword);
  if (weak) return fail(weak, { password: weak });
  if (newPassword !== confirm) return fail("Passwords don't match.", { confirmPassword: "Passwords don't match." });

  const result = await run(() =>
    api<undefined>("/auth/reset-password", { method: "POST", auth: false, body: { token, email, newPassword } }),
  );
  if (!result.ok) return result;
  await clearAuth();
  redirect("/login?reset=1");
}

export async function changePassword(_prev: ActionResult<undefined> | null, form: FormData) {
  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  const weak = passwordProblem(newPassword);
  if (weak) return fail(weak, { newPassword: weak });
  if (newPassword !== confirmPassword)
    return fail("Passwords don't match.", { confirmPassword: "Passwords don't match." });
  return run(
    () => api<undefined>("/auth/change-password", { method: "POST", body: { currentPassword, newPassword, confirmPassword } }),
    "Password updated. Other devices have been signed out.",
  );
}
