"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";
import { fail, run, type ActionResult } from "@/lib/actions";
import type { Availability, CommandResult, PaymentIntent } from "@/lib/api/types";
import { getSession } from "@/lib/session";

const ID = /^[a-f0-9]{24}$/i;

/** Live slots for one day. Public: anyone can look before signing in. */
export async function loadAvailability(offeringId: string, date: string): Promise<ActionResult<Availability>> {
  if (!ID.test(offeringId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Invalid request.");
  return run(() => api<Availability>(`/offerings/${offeringId}/availability`, { auth: false, query: { date } }));
}

export type BookingRequest = {
  offeringId: string;
  offeringVersion: number;
  priceId: string;
  startAt: string;
  paymentPolicy: string;
  reasonForVisit?: string;
};

/**
 * Reserves the slot (a "hold"). Pay-at-clinic and free visits are confirmed straight away;
 * prepaid visits go to checkout, because only a verified payment can confirm them.
 */
export async function bookSlot(request: BookingRequest): Promise<ActionResult<undefined>> {
  const session = await getSession();
  if (!session || session.role !== "patient") return fail("Sign in with a patient account to book.");
  if (!session.patientId) redirect("/onboarding/patient");

  const hold = await run(() =>
    api<CommandResult>("/appointments/holds", {
      method: "POST",
      body: {
        patientId: session.patientId,
        offeringId: request.offeringId,
        offeringVersion: request.offeringVersion,
        priceId: request.priceId,
        startAt: request.startAt,
        ...(request.reasonForVisit?.trim() ? { reasonForVisit: request.reasonForVisit.trim().slice(0, 1000) } : {}),
      },
    }),
  );
  if (!hold.ok) return hold;
  const appointmentId = hold.data.id;

  if (request.paymentPolicy === "PREPAY") redirect(`/patient/appointments/${appointmentId}?checkout=1`);

  const confirmed = await run(() =>
    api(`/appointments/${appointmentId}/confirm`, { method: "POST", body: { expectedVersion: hold.data.version } }),
  );
  redirect(`/patient/appointments/${appointmentId}?${confirmed.ok ? "booked=1" : "confirm=1"}`);
}

// ── Appointment commands (patient portal) ──────────────────────────────────

export async function confirmAppointment(appointmentId: string, expectedVersion: number) {
  return run(() => api(`/appointments/${appointmentId}/confirm`, { method: "POST", body: { expectedVersion } }), "Booking confirmed.");
}

export async function cancelAppointment(appointmentId: string, expectedVersion: number, reason?: string) {
  if (!reason || reason.length < 5) return fail("Tell the clinic briefly why you're cancelling (5+ characters).");
  return run(() => api(`/appointments/${appointmentId}/cancel`, { method: "POST", body: { expectedVersion, reason } }), "Appointment cancelled.");
}

/** Starts (or resumes) online payment for a held prepaid appointment. */
export async function startPayment(appointmentId: string): Promise<ActionResult<PaymentIntent>> {
  return run(() =>
    // A key that is stable for ten minutes makes double clicks and quick retries reuse one
    // payment intent, while a later attempt (after a hold lapsed) starts afresh.
    api<PaymentIntent>(`/appointments/${appointmentId}/payment-intents`, {
      method: "POST",
      idempotencyKey: `pay_${appointmentId}_${Math.floor(Date.now() / 600_000)}`,
    }),
  );
}

export async function getPaymentIntent(intentId: string): Promise<ActionResult<PaymentIntent>> {
  return run(() => api<PaymentIntent>(`/payment-intents/${intentId}`));
}

export async function verifyPayment(intentId: string, response: { orderId: string; paymentId: string; signature: string }) {
  return run(() => api(`/payment-intents/${intentId}/verify`, { method: "POST", body: response }));
}

export async function getAppointmentStatus(appointmentId: string) {
  return run(() => api<{ status: string; version: number }>(`/appointments/${appointmentId}`));
}

export async function submitReview(appointmentId: string, rating: number, text: string) {
  if (!(rating >= 1 && rating <= 5)) return fail("Choose a rating from 1 to 5 stars.");
  return run(
    () => api("/reviews", { method: "POST", body: { appointmentId, rating, ...(text.trim() ? { text: text.trim() } : {}) } }),
    "Thanks! Your review will appear once it's been checked.",
  );
}
