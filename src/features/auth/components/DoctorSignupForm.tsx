"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupDoctor, type SignupState } from "@/features/auth/actions";
import { specialities } from "@/constants/specialities";
import { Field, cities, fieldError, inputCls } from "@/components/forms/fields";

export function DoctorSignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signupDoctor,
    {},
  );
  const e = state.errors ?? {};
  const v = state.values ?? {};
  const err = (k: string) => fieldError(e, k);

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold">Join DocDuniya as a Doctor</h1>
      <p className="mt-1 text-slate-600">
        Reach thousands of patients across India. Your profile will be verified before going live.
      </p>

      {/* key resets uncontrolled inputs to the latest submitted values */}
      <form key={JSON.stringify(v)} action={formAction} noValidate className="mt-8 space-y-8">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-600">
            Personal details
          </legend>
          <Field id="name" label="Full name" error={e.name} className="sm:col-span-2">
            <div className="flex">
              <span className="mt-1 grid place-items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-600">
                Dr.
              </span>
              <input id="name" name="name" autoComplete="name" placeholder="Ananya Sharma"
                defaultValue={v.name} className={`${inputCls} rounded-l-none`} {...err("name")} />
            </div>
          </Field>
          <Field id="email" label="Email" error={e.email}>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="doctor@example.com"
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
          <Field id="city" label="City of practice" error={e.city}>
            <select id="city" name="city" defaultValue={v.city ?? ""} className={inputCls} {...err("city")}>
              <option value="" disabled>Select your city</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-600">
            Professional details
          </legend>
          <Field id="speciality" label="Speciality" error={e.speciality}>
            <select id="speciality" name="speciality" defaultValue={v.speciality ?? ""} className={inputCls} {...err("speciality")}>
              <option value="" disabled>Select speciality</option>
              {specialities.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="registrationNo" label="Medical registration no." error={e.registrationNo}>
            <input id="registrationNo" name="registrationNo" placeholder="e.g. DMC/R/12345"
              defaultValue={v.registrationNo} className={inputCls} {...err("registrationNo")} />
          </Field>
          <Field id="experience" label="Years of experience" error={e.experience}>
            <input id="experience" name="experience" type="number" min={0} max={70} inputMode="numeric"
              placeholder="10" defaultValue={v.experience} className={inputCls} {...err("experience")} />
          </Field>
          <Field id="fee" label="Consultation fee (₹)" error={e.fee} optional>
            <input id="fee" name="fee" type="number" min={0} inputMode="numeric" placeholder="800"
              defaultValue={v.fee} className={inputCls} {...err("fee")} />
          </Field>
          <Field id="clinic" label="Clinic / hospital name" optional className="sm:col-span-2">
            <input id="clinic" name="clinic" placeholder="Apex Heart Institute"
              defaultValue={v.clinic} className={inputCls} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-600">
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
            <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 accent-accent-600" />
            <span>
              I confirm these details are accurate and agree to DocDuniya&apos;s Terms of Service
              and Privacy Policy.
            </span>
          </label>
          {e.terms && <p className="mt-1 text-sm text-red-600">{e.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-800 py-3 font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create doctor account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login/doctor" className="font-semibold text-brand-700 hover:underline">
          Login as Doctor
        </Link>
      </p>
    </div>
  );
}
