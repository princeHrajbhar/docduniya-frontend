"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api/server";
import { fail, run, str } from "@/lib/actions";
import type { Address, Contact, HumanName, Patient } from "@/lib/api/types";
import { indianMobileToE164 } from "@/lib/format";
import { getSession, setSession } from "@/lib/session";

// The backend validates with strict schemas, so only known keys may be sent back.
const pickName = (n: HumanName): HumanName => {
  const out: HumanName = { display: n.display };
  for (const k of ["given", "middle", "family", "prefix"] as const) if (n[k]) out[k] = n[k];
  return out;
};
const pickContact = ({ kind, value, use }: Contact): Contact => ({ kind, value, use });
const pickAddress = (a: Address): Address => {
  const out: Address = { use: a.use, line1: a.line1, city: a.city, stateCode: a.stateCode, postalCode: a.postalCode, countryCode: "IN" };
  for (const k of ["line2", "locality", "district"] as const) if (a[k]) out[k] = a[k];
  return out;
};
const nameFrom = (full: string): HumanName => {
  const parts = full.trim().split(/\s+/);
  return { display: parts.join(" "), given: parts[0], ...(parts.length > 1 ? { family: parts.slice(1).join(" ") } : {}) };
};

export async function updatePatientProfile(_prev: unknown, form: FormData) {
  const session = await getSession();
  if (!session?.patientId) return fail("Your session has ended. Please sign in again.");
  const { patientId } = session;

  const errors: Record<string, string> = {};
  const name = str(form, "name");
  const birthDate = str(form, "birthDate");
  const phoneRaw = str(form, "phone");
  const phone = phoneRaw ? indianMobileToE164(phoneRaw) : undefined;
  if (name.length < 2) errors.name = "Enter your full name.";
  if (phoneRaw && !phone) errors.phone = "Enter a valid 10-digit mobile number.";

  const line1 = str(form, "line1");
  const city = str(form, "city");
  const stateCode = str(form, "stateCode");
  const postalCode = str(form, "postalCode");
  const hasAddress = Boolean(line1 || city || stateCode || postalCode);
  if (hasAddress) {
    if (!line1) errors.line1 = "Enter the street address.";
    if (!city) errors.city = "Enter the city.";
    if (!stateCode) errors.stateCode = "Choose a state.";
    if (!/^\d{6}$/.test(postalCode)) errors.postalCode = "Enter a six-digit PIN code.";
  }

  const ecName = str(form, "ecName");
  const ecRelation = str(form, "ecRelation");
  const ecPhoneRaw = str(form, "ecPhone");
  const ecPhone = ecPhoneRaw ? indianMobileToE164(ecPhoneRaw) : undefined;
  const hasEmergency = Boolean(ecName || ecRelation || ecPhoneRaw);
  if (hasEmergency) {
    if (ecName.length < 2) errors.ecName = "Enter their name.";
    if (!ecRelation) errors.ecRelation = "How are they related to you?";
    if (!ecPhone) errors.ecPhone = "Enter a valid 10-digit mobile number.";
  }
  if (Object.keys(errors).length) return fail("Please fix the highlighted fields.", errors);

  const result = await run(async () => {
    const current = await api<Patient>(`/patients/${patientId}/profile`);
    const otherContacts = current.contacts.filter((c) => !(c.kind === "PHONE" && c.use === "PERSONAL")).map(pickContact);
    const otherAddresses = current.addresses.filter((a, i) => !(a.use === "HOME" && i === current.addresses.findIndex((x) => x.use === "HOME"))).map(pickAddress);
    const others = current.emergencyContacts.slice(1).map((e) => ({ name: pickName(e.name), relation: e.relation, phone: e.phone }));

    await api(`/patients/${patientId}/profile`, {
      method: "PATCH",
      body: {
        expectedVersion: current.version,
        profile: {
          name: nameFrom(name),
          ...(birthDate ? { birthDate } : {}),
          administrativeSex: str(form, "sex") || current.administrativeSex,
          preferredLanguage: str(form, "preferredLanguage") || current.preferredLanguage || "en",
          contacts: [...(phone ? [{ kind: "PHONE", value: phone, use: "PERSONAL" }] : []), ...otherContacts],
          addresses: [
            ...(hasAddress ? [{ use: "HOME", line1, ...(str(form, "line2") ? { line2: str(form, "line2") } : {}), city, stateCode, postalCode, countryCode: "IN" }] : []),
            ...otherAddresses,
          ],
          emergencyContacts: [...(hasEmergency ? [{ name: nameFrom(ecName), relation: ecRelation, phone: ecPhone }] : []), ...others],
        },
      },
    });
    await setSession({ ...session, name: nameFrom(name).display });
    refresh();
  }, "Profile saved.");
  return result;
}
