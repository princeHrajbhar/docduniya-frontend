"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api/server";
import { fail, run, str } from "@/lib/actions";
import type { DoctorProfile } from "@/lib/api/types";
import { getSession, setSession } from "@/lib/session";

const ID = /^[a-f0-9]{24}$/i;
const done = <T>(r: T) => {
  refresh();
  return r;
};

// ── Public profile ─────────────────────────────────────────────────────────

export async function updateDoctorProfile(_prev: unknown, form: FormData) {
  const publicName = str(form, "publicName");
  const bio = str(form, "bio");
  const specialtyIds = form.getAll("specialtyIds").map(String).filter((id) => ID.test(id));
  const careerStartYear = str(form, "careerStartYear");
  const errors: Record<string, string> = {};
  if (publicName.length < 3) errors.publicName = "Enter the name patients will see.";
  if (bio.length < 40) errors.bio = "Write at least a couple of sentences (40+ characters).";
  if (careerStartYear && !/^(19|20)\d{2}$/.test(careerStartYear)) errors.careerStartYear = "Enter a four-digit year.";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  const result = await run(async () => {
    const current = await api<DoctorProfile>("/doctors/me");
    await api("/doctors/me", {
      method: "PATCH",
      body: {
        expectedVersion: current.version,
        profile: {
          slug: current.slug,
          publicName,
          bio,
          specialtyIds,
          ...(careerStartYear ? { careerStartDate: `${careerStartYear}-01-01` } : {}),
        },
      },
    });
    const session = await getSession();
    if (session) await setSession({ ...session, name: publicName });
  }, "Profile saved.");
  return result.ok ? done(result) : result;
}

// ── Credentials ────────────────────────────────────────────────────────────

export async function addQualification(_prev: unknown, form: FormData) {
  const awardYear = str(form, "awardYear");
  const body = {
    kind: str(form, "kind"),
    qualificationName: str(form, "qualificationName"),
    institutionName: str(form, "institutionName"),
    ...(awardYear ? { awardYear: Number(awardYear) } : {}),
    ...(str(form, "certificateNumber") ? { certificateNumber: str(form, "certificateNumber") } : {}),
    evidenceReference: str(form, "evidenceReference"),
  };
  const errors: Record<string, string> = {};
  if (!body.qualificationName) errors.qualificationName = "Enter the degree, e.g. MBBS or MD (Medicine).";
  if (!body.institutionName) errors.institutionName = "Enter the university or institution.";
  if (awardYear && !(Number(awardYear) >= 1900 && Number(awardYear) <= new Date().getFullYear())) errors.awardYear = "Enter a valid year.";
  if (body.evidenceReference.length < 5) errors.evidenceReference = "Add a reference reviewers can check (5+ characters).";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);
  const result = await run(() => api("/practitioners/me/qualifications", { method: "POST", body }), "Qualification added.");
  return result.ok ? done(result) : result;
}

export async function addRegistration(_prev: unknown, form: FormData) {
  const body = {
    authority: str(form, "authority"),
    jurisdiction: str(form, "jurisdiction"),
    registrationNumberNormalized: str(form, "registrationNumber").replace(/\s+/g, ""),
    ...(str(form, "issuedOn") ? { issuedOn: str(form, "issuedOn") } : {}),
    ...(str(form, "expiresOn") ? { expiresOn: str(form, "expiresOn") } : {}),
    evidenceReference: str(form, "evidenceReference"),
  };
  const errors: Record<string, string> = {};
  if (!body.authority) errors.authority = "Choose the council that registered you.";
  if (body.jurisdiction.length < 2) errors.jurisdiction = "Enter the state or region.";
  if (!body.registrationNumberNormalized) errors.registrationNumber = "Enter your registration number.";
  if (body.evidenceReference.length < 5) errors.evidenceReference = "Add a reference reviewers can check (5+ characters).";
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);
  const result = await run(() => api("/practitioners/me/registrations", { method: "POST", body }), "Registration added.");
  return result.ok ? done(result) : result;
}

// ── Verification and publication ───────────────────────────────────────────

export async function submitVerification(_prev: unknown, form: FormData) {
  const registrationId = str(form, "registrationId");
  const qualificationIds = form.getAll("qualificationIds").map(String).filter((id) => ID.test(id));
  const declaration = str(form, "declaration");
  if (!ID.test(registrationId)) return fail("Choose the registration to verify.", { registrationId: "Choose a registration." });
  if (qualificationIds.length === 0) return fail("Choose at least one qualification.", { qualificationIds: "Choose at least one." });
  if (declaration.length < 20) return fail("The declaration needs at least 20 characters.", { declaration: "Too short." });
  if (form.get("attest") !== "on") return fail("Please confirm the declaration.", { attest: "Required." });

  const result = await run(async () => {
    const doctor = await api<DoctorProfile>("/doctors/me");
    await api("/doctors/me/verification-requests", {
      method: "POST",
      body: { expectedVersion: doctor.version, registrationId, qualificationIds, declaration },
    });
  }, "Submitted. Our medical team will review your credentials.");
  return result.ok ? done(result) : result;
}

export async function withdrawVerification(expectedVersion: number, reason?: string) {
  if (!reason || reason.length < 5) return fail("Give a short reason (5+ characters).");
  return run(() => api("/doctors/me/withdraw-verification", { method: "POST", body: { expectedVersion, reason } }));
}

export async function setPublished(expectedVersion: number, published: boolean) {
  return run(() => api("/doctors/me/publication", { method: "POST", body: { expectedVersion, published } }));
}

// ── Clinics ────────────────────────────────────────────────────────────────

export async function respondToAffiliation(affiliationId: string, expectedVersion: number, decision: "ACCEPT" | "REJECT") {
  return run(() => api(`/doctors/me/affiliations/${affiliationId}/respond`, { method: "POST", body: { expectedVersion, decision } }));
}

export async function endAffiliation(affiliationId: string, expectedVersion: number, reason?: string) {
  if (!reason || reason.length < 5) return fail("Give a short reason (5+ characters).");
  return run(() => api(`/doctors/me/affiliations/${affiliationId}/end`, { method: "POST", body: { expectedVersion, reason } }));
}

export async function acceptMembership(membershipId: string, expectedVersion: number) {
  return run(() => api(`/me/memberships/${membershipId}/accept`, { method: "POST", body: { expectedVersion } }));
}

// ── Schedule ───────────────────────────────────────────────────────────────

export async function blockTime(_prev: unknown, form: FormData) {
  const from = str(form, "from");
  const to = str(form, "to");
  const reason = str(form, "reason");
  if (!from || !to) return fail("Choose when your time off starts and ends.");
  const startAt = new Date(`${from}:00+05:30`);
  const endAt = new Date(`${to}:00+05:30`);
  if (!(endAt > startAt)) return fail("The end must be after the start.", { to: "Must be after the start." });
  if (reason.length < 5) return fail("Add a short reason (5+ characters).", { reason: "5+ characters." });
  const result = await run(
    () => api("/doctors/me/time-blocks", { method: "POST", body: { startAt: startAt.toISOString(), endAt: endAt.toISOString(), reason } }),
    "Time off saved. Clinics will be asked to reassign any affected bookings.",
  );
  return result.ok ? done(result) : result;
}

/** Visit flow commands on a provider's appointment (check-in, start, complete, no-show). */
export async function transitionAppointment(
  organizationId: string,
  appointmentId: string,
  action: "check-in" | "start" | "complete" | "no-show",
  expectedVersion: number,
  reason?: string,
) {
  return run(() =>
    api(`/organizations/${organizationId}/appointments/${appointmentId}/${action}`, {
      method: "POST",
      body: { expectedVersion, ...(reason ? { reason } : {}) },
    }),
  );
}
