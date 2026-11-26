import "server-only";

import { api } from "@/lib/api/server";
import type { CommandResult, Sex } from "@/lib/api/types";
import { indianMobileToE164, slugify } from "@/lib/format";

/** Form values shared by sign-up and onboarding. */
export type ProfileValues = Record<string, string>;
export type FieldErrors = Record<string, string>;

const SEXES: Sex[] = ["FEMALE", "MALE", "OTHER", "UNKNOWN"];
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function nameFrom(full: string) {
  const parts = full.replace(/^dr\.?\s+/i, "").trim().split(/\s+/);
  return {
    display: parts.join(" "),
    given: parts[0],
    ...(parts.length > 1 ? { family: parts.slice(1).join(" ") } : {}),
  };
}

function contacts(email: string, phone?: string) {
  return [
    ...(phone ? [{ kind: "PHONE" as const, value: phone, use: "PERSONAL" as const }] : []),
    { kind: "EMAIL" as const, value: email, use: "PERSONAL" as const },
  ];
}

export function validatePatient(v: ProfileValues): FieldErrors {
  const errors: FieldErrors = {};
  if (v.name.length < 2) errors.name = "Enter your full name.";
  if (!SEXES.includes(v.sex as Sex)) errors.sex = "Choose an option.";
  if (!v.birthDate) errors.birthDate = "Enter your date of birth.";
  else if (v.birthDate > today()) errors.birthDate = "Date of birth can't be in the future.";
  if (v.phone && !indianMobileToE164(v.phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  return errors;
}

export function validateDoctor(v: ProfileValues): FieldErrors {
  const errors: FieldErrors = {};
  if (v.name.replace(/^dr\.?\s*/i, "").length < 2) errors.name = "Enter your full name.";
  if (v.phone && !indianMobileToE164(v.phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (v.bio.length < 40) errors.bio = "Write at least a couple of sentences (40+ characters).";
  const year = Number(v.careerStartYear);
  if (v.careerStartYear && (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear()))
    errors.careerStartYear = "Enter the year you started practising.";
  return errors;
}

export async function createPatientProfile(v: ProfileValues, email: string, token?: string) {
  return api<CommandResult>("/patients", {
    method: "POST",
    token,
    body: {
      kind: "SELF",
      profile: {
        name: nameFrom(v.name),
        birthDate: v.birthDate,
        administrativeSex: v.sex,
        preferredLanguage: "en",
        contacts: contacts(email, indianMobileToE164(v.phone ?? "")),
      },
    },
  });
}

/** Creates the practitioner identity (if missing) and then the doctor's public profile. */
export async function createDoctorProfile(
  v: ProfileValues,
  email: string,
  options: { token?: string; practitionerExists?: boolean } = {},
) {
  const name = nameFrom(v.name);
  const languages = (v.languages || "en").split(",").map((l) => l.trim()).filter(Boolean);
  if (!options.practitionerExists) {
    await api<CommandResult>("/practitioners/me", {
      method: "POST",
      token: options.token,
      body: {
        name,
        profession: "DOCTOR",
        contacts: contacts(email, indianMobileToE164(v.phone ?? "")),
        languages,
      },
    });
  }
  const suffix = crypto.randomUUID().slice(0, 4);
  return api<CommandResult>("/doctors/me", {
    method: "POST",
    token: options.token,
    body: {
      slug: `${slugify(`dr ${name.display}`).slice(0, 90)}-${suffix}`,
      publicName: `Dr. ${name.display}`,
      bio: v.bio,
      specialtyIds: v.specialtyId ? [v.specialtyId] : [],
      ...(v.careerStartYear ? { careerStartDate: `${v.careerStartYear}-01-01` } : {}),
    },
  });
}
