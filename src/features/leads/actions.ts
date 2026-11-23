"use server";

export type LeadState = {
  ok?: boolean;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const FIELDS = ["name", "phone", "city", "age", "gender", "concern", "consent"] as const;

/** Patient lead from the home page hero: someone who wants us to call them back. */
export async function submitPatientLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const values: Record<string, string> = {};
  for (const k of FIELDS) values[k] = String(formData.get(k) ?? "").trim();

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!/^(\+91)?[6-9]\d{9}$/.test(values.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter a valid 10-digit mobile number.";
  if (!values.city) errors.city = "Please select your city.";
  if (values.age) {
    const age = Number(values.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) errors.age = "Enter a valid age.";
  }
  if (!values.concern) errors.concern = "Please choose what you need help with.";
  if (!values.consent) errors.consent = "Please allow us to contact you.";
  if (Object.keys(errors).length > 0) return { errors, values };

  // TODO: save the lead to your backend / CRM.
  return { ok: true, values: { name: values.name } };
}
