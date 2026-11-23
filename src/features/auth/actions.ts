"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  encodeSession,
  homeFor,
  type Role,
  type Session,
} from "@/lib/session";

export type LoginState = {
  error?: string;
  email?: string;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

async function startSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function login(
  role: Role,
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address.", email };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters.", email };
  }

  // TODO: replace with a real API call to your backend.
  const localPart = email.split("@")[0].replace(/[._-]+/g, " ");
  const name = localPart.replace(/\b\w/g, (c) => c.toUpperCase());

  await startSession({ role, name, email });
  redirect(homeFor(role));
}

export type SignupState = {
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

/** Reads the fields and runs the checks shared by patient and doctor sign-up. */
function readCommon(formData: FormData, keys: string[]) {
  const values: Record<string, string> = {};
  for (const k of ["name", "email", "phone", "city", ...keys]) {
    values[k] = String(formData.get(k) ?? "").trim();
  }
  values.phone = values.phone.replace(/[\s-]/g, "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!/^(\+91)?[6-9]\d{9}$/.test(values.phone))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!values.city) errors.city = "Please select your city.";
  if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (formData.get("terms") !== "on") errors.terms = "Please accept the terms to continue.";

  return { values, errors, phone: values.phone.slice(-10) };
}

export async function signupPatient(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const { values, errors, phone } = readCommon(formData, ["gender", "dob", "bloodGroup"]);
  if (!values.gender) errors.gender = "Please select your gender.";
  if (!values.dob) {
    errors.dob = "Please enter your date of birth.";
  } else if (new Date(values.dob) > new Date()) {
    errors.dob = "Date of birth can't be in the future.";
  }
  if (Object.keys(errors).length > 0) return { errors, values };

  // TODO: send the details + password to your backend to create the account.
  await startSession({
    role: "patient",
    name: values.name,
    email: values.email,
    profile: {
      phone,
      city: values.city,
      gender: values.gender,
      dob: values.dob,
      bloodGroup: values.bloodGroup || undefined,
    },
  });
  redirect("/patient");
}

export async function signupDoctor(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const { values, errors, phone } = readCommon(formData, [
    "speciality", "registrationNo", "experience", "clinic", "fee",
  ]);
  values.name = values.name.replace(/^dr\.?\s*/i, "");
  if (!values.speciality) errors.speciality = "Please select your speciality.";
  if (values.registrationNo.length < 4)
    errors.registrationNo = "Enter your medical council registration number.";
  const exp = Number(values.experience);
  if (values.experience === "" || !Number.isInteger(exp) || exp < 0 || exp > 70)
    errors.experience = "Enter years of experience (0–70).";
  if (values.fee && !(Number(values.fee) >= 0))
    errors.fee = "Enter a valid fee amount.";
  if (Object.keys(errors).length > 0) return { errors, values };

  // TODO: send the details + password to your backend for verification.
  await startSession({
    role: "doctor",
    name: values.name,
    email: values.email,
    profile: {
      phone,
      city: values.city,
      speciality: values.speciality,
      registrationNo: values.registrationNo,
      experience: values.experience,
      clinic: values.clinic || undefined,
      fee: values.fee || undefined,
    },
  });
  redirect("/doctor");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
