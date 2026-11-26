"use server";

import { refresh, updateTag } from "next/cache";
import { api } from "@/lib/api/server";
import { fail, run, str } from "@/lib/actions";

const reasonOk = (reason: string | undefined, min: number) => Boolean(reason && reason.trim().length >= min);

// ── Doctor verification ────────────────────────────────────────────────────

export async function decideDoctorVerification(reviewId: string, expectedVersion: number, _prev: unknown, form: FormData) {
  const decision = str(form, "decision");
  const reason = str(form, "reason");
  const validUntil = str(form, "validUntil");
  if (!["APPROVED", "REJECTED", "CHANGES_REQUIRED"].includes(decision)) return fail("Choose a decision.");
  if (reason.length < 20) return fail("Explain the decision in at least 20 characters.", { reason: "At least 20 characters." });

  let body: Record<string, unknown> = { expectedVersion, decision, reason };
  if (decision === "APPROVED") {
    if (!["identityChecked", "registrationChecked", "qualificationsChecked"].every((k) => form.get(k) === "on"))
      return fail("Confirm all three independent checks before approving.");
    if (!validUntil) return fail("Set when this verification should be reviewed again.", { validUntil: "Required." });
    body = {
      ...body,
      validUntil: new Date(`${validUntil}T23:59:59+05:30`).toISOString(),
      checks: { identityChecked: true, registrationChecked: true, qualificationsChecked: true },
    };
  }
  const result = await run(() => api(`/platform/doctor-verifications/${reviewId}/decide`, { method: "POST", body }), "Decision recorded.");
  if (result.ok) refresh();
  return result;
}

export async function decideProviderVerification(caseId: string, expectedVersion: number, decision: "APPROVED" | "REJECTED" | "CHANGES_REQUIRED", reason?: string) {
  if (!reasonOk(reason, 20)) return fail("Explain the decision in at least 20 characters.");
  return run(() => api(`/platform/provider-verifications/${caseId}/decide`, { method: "POST", body: { expectedVersion, decision, reason } }));
}

// ── Reviews ────────────────────────────────────────────────────────────────

export async function moderateReview(
  reviewId: string,
  expectedVersion: number,
  status: "PUBLISHED" | "HIDDEN" | "REMOVED",
  doctorId: string,
  reason?: string,
) {
  if (!reasonOk(reason, 5)) return fail("Add a short moderation note (5+ characters).");
  const result = await run(() => api(`/platform/reviews/${reviewId}/moderate`, { method: "POST", body: { expectedVersion, status, reason } }));
  if (result.ok) {
    // The public profile caches reviews and ratings; show the decision there right away.
    updateTag(`reviews:${doctorId}`);
    updateTag("discovery");
  }
  return result;
}

// ── Support ────────────────────────────────────────────────────────────────

export async function transitionTicket(ticketId: string, expectedVersion: number, action: "assign" | "wait" | "resolve" | "close" | "reopen", resolution?: string) {
  if (action === "resolve" && !reasonOk(resolution, 5)) return fail("Describe the resolution (5+ characters).");
  return run(() =>
    api(`/platform/support-tickets/${ticketId}/transition`, {
      method: "POST",
      body: { expectedVersion, action, ...(action === "resolve" ? { resolution } : {}) },
    }),
  );
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function setUserActive(userId: string, isActive: boolean) {
  return run(() => api(`/users/${userId}`, { method: "PATCH", body: { isActive } }));
}

export async function unlockUser(userId: string) {
  return run(() => api(`/users/${userId}/unlock`, { method: "PATCH" }));
}

export async function createUser(_prev: unknown, form: FormData) {
  const email = str(form, "email").toLowerCase();
  const role = str(form, "role") || "user";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.", { email: "Invalid email." });
  const result = await run(
    () => api("/users", { method: "POST", body: { email, role, isVerified: true } }),
    `Account created. ${email} will get an email to set their password.`,
  );
  if (result.ok) refresh();
  return result;
}

// ── Operations ─────────────────────────────────────────────────────────────

export async function replayEvent(eventId: string) {
  return run(() => api(`/platform/outbox/${eventId}/replay`, { method: "POST" }));
}
