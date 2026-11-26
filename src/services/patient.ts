import "server-only";

import { redirect } from "next/navigation";
import { api } from "@/lib/api/server";
import type { Appointment, Page, PublicOffering } from "@/lib/api/types";
import { requireSession } from "@/lib/session";
import { getOffering } from "./catalog";

/** The signed-in patient and the profile they act for. */
export async function patientContext() {
  const session = await requireSession("patient");
  if (!session.patientId) redirect("/onboarding/patient");
  return { session, patientId: session.patientId };
}

export type AppointmentView = Appointment & { details: PublicOffering | null };

const ENDED = new Set(["COMPLETED", "CANCELLED", "EXPIRED", "NO_SHOW", "DISCONTINUED"]);
export const isUpcoming = (a: Appointment) => !ENDED.has(a.status) && new Date(a.endAt).getTime() > Date.now() - 3_600_000;

/** Appointments with the doctor and clinic names (from the cached public offering). */
export async function listPatientAppointments(patientId: string, limit = 100): Promise<AppointmentView[]> {
  const page = await api<Page<Appointment>>("/me/appointments", { query: { patientId, limit } });
  const offerings = new Map(
    await Promise.all(
      [...new Set(page.items.map((a) => a.offeringId))].map(async (id) => [id, await getOffering(id)] as const),
    ),
  );
  return page.items.map((a) => ({ ...a, details: offerings.get(a.offeringId) ?? null }));
}

export function splitAppointments(items: AppointmentView[]) {
  const upcoming = items.filter(isUpcoming).sort((a, b) => a.startAt.localeCompare(b.startAt));
  const past = items.filter((a) => !isUpcoming(a)).sort((a, b) => b.startAt.localeCompare(a.startAt));
  return { upcoming, past };
}
