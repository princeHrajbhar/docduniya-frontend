import "server-only";

import { redirect } from "next/navigation";
import { api, apiOrNull } from "@/lib/api/server";
import type {
  Affiliation,
  Appointment,
  DoctorProfile,
  Membership,
  Organization,
  Page,
  Practitioner,
  ProfessionalRegistration,
  Qualification,
  VerificationCase,
} from "@/lib/api/types";
import { requireSession } from "@/lib/session";

export async function doctorContext() {
  const session = await requireSession("doctor");
  if (!session.doctorId) redirect("/onboarding/doctor");
  return { session, doctorId: session.doctorId };
}

const items = <T>(p: Promise<Page<T>>) => p.then((r) => r.items, () => [] as T[]);

/** Everything the profile and onboarding checklist need, in parallel. */
export async function doctorWorkspace() {
  const [doctor, practitioner, qualifications, registrations, verifications, affiliations, memberships] = await Promise.all([
    apiOrNull<DoctorProfile>("/doctors/me"),
    apiOrNull<Practitioner>("/practitioners/me"),
    items(api<Page<Qualification>>("/practitioners/me/qualifications", { query: { limit: 50 } })),
    items(api<Page<ProfessionalRegistration>>("/practitioners/me/registrations", { query: { limit: 50 } })),
    items(api<Page<VerificationCase>>("/doctors/me/verification-requests", { query: { limit: 20 } })),
    items(api<Page<Affiliation>>("/doctors/me/affiliations", { query: { limit: 50 } })),
    items(api<Page<Membership>>("/me/memberships", { query: { limit: 50 } })),
  ]);
  if (!doctor) redirect("/onboarding/doctor");
  return { doctor, practitioner, qualifications, registrations, verifications, affiliations, memberships };
}

/** Organization names for the given ids (members can read their own organizations). */
export async function organizationNames(ids: string[]) {
  const entries = await Promise.all(
    [...new Set(ids)].map(async (id) => [id, (await apiOrNull<Organization>(`/organizations/${id}`).catch(() => null))?.displayName] as const),
  );
  return new Map(entries.filter((e): e is readonly [string, string] => Boolean(e[1])));
}

export type DoctorAppointment = Appointment & { organizationName?: string };

/**
 * The doctor's appointments across every provider they work at. Provider lists include all
 * doctors, so they are filtered to this doctor. Providers that don't grant this member
 * appointment access are skipped rather than failing the page.
 */
export async function doctorAppointments(doctorId: string, memberships: Membership[], query: { date?: string; status?: string } = {}) {
  const orgIds = [...new Set(memberships.filter((m) => m.status === "ACTIVE").map((m) => m.organizationId))];
  const names = await organizationNames(orgIds);
  const lists = await Promise.all(
    orgIds.map((orgId) =>
      api<Page<Appointment>>(`/organizations/${orgId}/appointments`, { query: { limit: 100, ...query } }).then(
        (p) => p.items.filter((a) => a.doctorId === doctorId).map((a) => ({ ...a, organizationName: names.get(orgId) })),
        () => [] as DoctorAppointment[],
      ),
    ),
  );
  return { appointments: lists.flat().sort((a, b) => a.startAt.localeCompare(b.startAt)), names, orgIds };
}
