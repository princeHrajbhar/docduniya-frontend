import "server-only";

import { api, apiEnvelope, apiOrNull } from "@/lib/api/server";
import { ApiError } from "@/lib/api/errors";
import type {
  CurrentUser,
  DoctorProfile,
  LoginResult,
  Page,
  PatientSummary,
  Practitioner,
} from "@/lib/api/types";
import { readSetCookie, setSession, setTokens, type Role, type Session } from "@/lib/session";

export type SignInOutcome =
  | { kind: "signed-in"; session: Session; needsProfile: boolean; accessToken: string }
  | { kind: "mfa"; challengeToken: string };

/** Exchanges credentials for backend tokens and stores them as frontend cookies. */
export async function signIn(email: string, password: string, role: Role): Promise<SignInOutcome> {
  const res = await apiEnvelope<LoginResult>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  if (res.data.mfaRequired) return { kind: "mfa", challengeToken: res.data.challengeToken };
  return finishSignIn(res.data.accessToken, res.headers, role);
}

export async function completeMfa(
  challengeToken: string,
  code: { code?: string; recoveryCode?: string },
  role: Role,
): Promise<SignInOutcome> {
  const res = await apiEnvelope<{ accessToken: string }>("/auth/mfa/verify", {
    method: "POST",
    auth: false,
    body: { challengeToken, ...code },
  });
  return finishSignIn(res.data.accessToken, res.headers, role);
}

// ── Administrator portal: password, then a code emailed on every sign-in ──────

export type AdminCodeStep = { challengeToken: string; sentTo: string; expiresAt: string };

/** Password step. The backend emails a code; there is no session yet. */
export async function adminSignIn(email: string, password: string): Promise<AdminCodeStep> {
  const data = await api<AdminCodeStep>("/auth/admin/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  return { challengeToken: data.challengeToken, sentTo: data.sentTo, expiresAt: data.expiresAt };
}

/** Emails a fresh code for the same attempt; the previous code stops working. */
export async function resendAdminSignInCode(challengeToken: string) {
  return api<Omit<AdminCodeStep, "challengeToken">>("/auth/admin/resend-code", {
    method: "POST",
    auth: false,
    body: { challengeToken },
  });
}

/** Code step: signs in, or asks for the authenticator code when one is enrolled. */
export async function verifyAdminSignInCode(challengeToken: string, code: string): Promise<SignInOutcome> {
  const res = await apiEnvelope<LoginResult>("/auth/admin/verify", {
    method: "POST",
    auth: false,
    body: { challengeToken, code },
  });
  if (res.data.mfaRequired) return { kind: "mfa", challengeToken: res.data.challengeToken };
  return finishSignIn(res.data.accessToken, res.headers, "admin");
}

async function finishSignIn(accessToken: string, headers: Headers, role: Role): Promise<SignInOutcome> {
  const refreshToken = readSetCookie(headers, "refreshToken");
  if (!refreshToken) throw new ApiError(502, "NO_REFRESH_TOKEN", "Sign-in didn't complete. Please try again.");
  const { session, needsProfile } = await resolveSession(role, accessToken);
  await setTokens({ accessToken, refreshToken });
  await setSession(session);
  return { kind: "signed-in", session, needsProfile, accessToken };
}

/**
 * Backend accounts are role-neutral; "patient" and "doctor" are profiles attached to them
 * and "admin" means holding platform permissions. This maps an account onto the area the
 * person signed in for.
 */
export async function resolveSession(
  role: Role,
  token?: string,
): Promise<{ session: Session; needsProfile: boolean }> {
  const me = await api<CurrentUser>("/auth/me", { token, redirectOn401: false });
  const base = { userId: me.userId, email: me.email, name: me.email.split("@")[0] };

  if (role === "admin") {
    if (me.permissions.length === 0) {
      throw new ApiError(403, "NOT_ADMIN", "This account doesn't have administrator access.");
    }
    return { session: { ...base, role, permissions: me.permissions }, needsProfile: false };
  }

  if (role === "doctor") {
    const doctor = await apiOrNull<DoctorProfile>("/doctors/me", { token, redirectOn401: false });
    if (!doctor) return { session: { ...base, role }, needsProfile: true };
    return {
      session: { ...base, role, doctorId: doctor.id, name: doctor.publicName },
      needsProfile: false,
    };
  }

  const patients = await api<Page<PatientSummary>>("/me/patients", {
    token,
    query: { limit: 25 },
    redirectOn401: false,
  });
  const self = patients.items.at(-1) ?? patients.items[0];
  if (!self) return { session: { ...base, role }, needsProfile: true };
  return { session: { ...base, role, patientId: self.id, name: self.name.display }, needsProfile: false };
}

/** The doctor's practitioner identity, if one exists yet. */
export const getPractitioner = () => apiOrNull<Practitioner>("/practitioners/me");
