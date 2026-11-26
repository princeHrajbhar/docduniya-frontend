"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api/server";
import { fail, run, str } from "@/lib/actions";
import { getSession } from "@/lib/session";

const CATEGORIES = ["BOOKING", "PROVIDER", "PAYMENT", "PRIVACY", "SAFETY", "TECHNICAL"];

export async function createTicket(_prev: unknown, form: FormData) {
  const session = await getSession();
  const category = str(form, "category");
  const subject = str(form, "subject");
  const description = str(form, "description");
  const appointmentId = str(form, "appointmentId");
  const errors: Record<string, string> = {};
  if (!CATEGORIES.includes(category)) errors.category = "Choose a topic.";
  if (!subject) errors.subject = "Add a short subject.";
  if (description.length < 10) errors.description = "Describe the problem in a sentence or two (10+ characters).";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  const result = await run(
    () =>
      api("/support-tickets", {
        method: "POST",
        body: {
          category,
          subject: subject.slice(0, 200),
          description: description.slice(0, 4000),
          ...(session?.patientId ? { patientId: session.patientId } : {}),
          ...(/^[a-f0-9]{24}$/i.test(appointmentId) ? { relatedRefs: [{ type: "appointment", id: appointmentId }] } : {}),
        },
      }),
    "Thanks, we've got it. Our team usually replies within one working day.",
  );
  if (result.ok) refresh();
  return result;
}

export async function replyToTicket(ticketId: string, expectedVersion: number, body?: string) {
  if (!body?.trim()) return fail("Write a reply first.");
  return run(() => api(`/support-tickets/${ticketId}/replies`, { method: "POST", body: { expectedVersion, body: body.trim() } }));
}
