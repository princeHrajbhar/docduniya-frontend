"use server";

export type ContactState = {
  ok?: boolean;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values: Record<string, string> = {};
  for (const k of ["name", "email", "phone", "topic", "message"]) {
    values[k] = String(formData.get(k) ?? "").trim();
  }

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.phone && !/^(\+91)?[6-9]\d{9}$/.test(values.phone.replace(/[\s-]/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!values.topic) errors.topic = "Please choose a topic.";
  if (values.message.length < 10) errors.message = "Please write at least 10 characters.";
  if (Object.keys(errors).length > 0) return { errors, values };

  // TODO: send to your backend / support inbox.
  return { ok: true };
}
