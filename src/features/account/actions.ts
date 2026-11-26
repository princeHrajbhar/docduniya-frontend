"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";
import { fail, run } from "@/lib/actions";
import { clearAuth } from "@/lib/session";

const CODE = /^\d{6}$/;

export async function revokeSession(sessionId: string) {
  return run(() => api(`/auth/sessions/${sessionId}`, { method: "DELETE" }), "Device signed out.");
}

export async function signOutEverywhere() {
  await api("/auth/logout-all", { method: "POST" }).catch(() => undefined);
  await clearAuth();
  redirect("/login");
}

export async function startMfaEnrollment() {
  return run(() => api<{ secret: string; otpauthUri: string }>("/auth/mfa/totp/enroll", { method: "POST" }));
}

export async function activateMfa(code: string) {
  if (!CODE.test(code)) return fail("Enter the 6-digit code from your app.");
  return run(() => api<{ activated: boolean; recoveryCodes: string[] }>("/auth/mfa/totp/activate", { method: "POST", body: { code } }));
}

export async function regenerateRecoveryCodes(code: string) {
  if (!CODE.test(code)) return fail("Enter the 6-digit code from your app.");
  return run(() => api<{ recoveryCodes: string[] }>("/auth/mfa/recovery-codes", { method: "POST", body: { code } }));
}

export async function disableMfa(code: string) {
  if (!CODE.test(code)) return fail("Enter the 6-digit code from your app.");
  return run(() => api("/auth/mfa/totp", { method: "DELETE", body: { code } }), "Two-step verification turned off.");
}
