"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, cities, fieldError, inputCls } from "@/components/forms/fields";
import { signupPatient, type SignupState } from "@/features/auth/actions";

const genders = ["Male", "Female", "Other", "Prefer not to say"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientSignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signupPatient,
    {},
  );
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const err = (k: string) => fieldError(e, k);

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold">Create your patient account</h1>
      <p className="mt-1 text-slate-600">
        Tell us a little about yourself so we can find the right doctors for you.
      </p>

      {/* key resets uncontrolled inputs to the latest submitted values */}
      <form key={JSON.stringify(v)} action={formAction} noValidate className="mt-8 space-y-8">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Personal details
          </legend>
          <Field id="name" label="Full name" error={e.name} className="sm:col-span-2">
            <input id="name" name="name" autoComplete="name" placeholder="Rohit Verma"
              defaultValue={v.name} className={inputCls} {...err("name")} />
          </Field>
          <Field id="gender" label="Gender" error={e.gender}>
            <select id="gender" name="gender" defaultValue={v.gender ?? ""} className={inputCls} {...err("gender")}>
              <option value="" disabled>Select gender</option>
              {genders.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field id="dob" label="Date of birth" error={e.dob}>
            <input id="dob" name="dob" type="date" autoComplete="bday"
              defaultValue={v.dob} className={inputCls} {...err("dob")} />
          </Field>
          <Field id="bloodGroup" label="Blood group" optional>
            <select id="bloodGroup" name="bloodGroup" defaultValue={v.bloodGroup ?? ""} className={inputCls}>
              <option value="">Don&apos;t know</option>
              {bloodGroups.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Contact details
          </legend>
          <Field id="email" label="Email" error={e.email}>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
              defaultValue={v.email} className={inputCls} {...err("email")} />
          </Field>
          <Field id="phone" label="Mobile number" error={e.phone}>
            <div className="flex">
              <span className="mt-1 grid place-items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-600">
                +91
              </span>
              <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                maxLength={10} placeholder="98765 43210" defaultValue={v.phone}
                className={`${inputCls} rounded-l-none`} {...err("phone")} />
            </div>
          </Field>
          <Field id="city" label="City" error={e.city}>
            <select id="city" name="city" defaultValue={v.city ?? ""} className={inputCls} {...err("city")}>
              <option value="" disabled>Select your city</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Security
          </legend>
          <Field id="password" label="Password" error={e.password}>
            <input id="password" name="password" type="password" autoComplete="new-password"
              placeholder="At least 6 characters" className={inputCls} {...err("password")} />
          </Field>
          <Field id="confirmPassword" label="Confirm password" error={e.confirmPassword}>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
              placeholder="Re-enter password" className={inputCls} {...err("confirmPassword")} />
          </Field>
        </fieldset>

        <div>
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 accent-brand-600" />
            <span>I agree to DocDuniya&apos;s Terms of Service and Privacy Policy.</span>
          </label>
          {e.terms && <p className="mt-1 text-sm text-red-600">{e.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login/patient" className="font-semibold text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
