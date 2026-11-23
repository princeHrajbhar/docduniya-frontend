"use client";

import { useActionState } from "react";
import { cities, fieldError } from "@/components/forms/fields";
import { specialities } from "@/constants/specialities";
import { submitPatientLead, type LeadState } from "@/features/leads/actions";

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 aria-[invalid=true]:border-red-400";

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  ) : null;
}

/** Hero call-back form: collects basic patient details so our team can reach out. */
export function PatientLeadForm() {
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitPatientLead, {});

  if (state.ok) {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center text-slate-900 shadow-2xl">
        <p className="text-5xl">✅</p>
        <h2 className="mt-4 text-2xl font-bold">Thank you, {state.values?.name}!</h2>
        <p className="mt-2 text-slate-600">
          Our care team will call you shortly to help you find the right doctor.
        </p>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
      <h2 className="text-2xl font-bold">Get a free call back</h2>
      <p className="mt-1 text-sm text-slate-600">
        Share a few details and our care team will help you book the right doctor.
      </p>

      <form action={formAction} noValidate className="mt-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="lead-name" className="sr-only">Full name</label>
          <input id="lead-name" name="name" placeholder="Full name" autoComplete="name" defaultValue={v.name} className={inputCls} {...fieldError(e, "name")} />
          <Err id="name" msg={e.name} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="lead-phone" className="sr-only">Mobile number</label>
          <input id="lead-phone" name="phone" type="tel" inputMode="numeric" placeholder="Mobile number" autoComplete="tel" defaultValue={v.phone} className={inputCls} {...fieldError(e, "phone")} />
          <Err id="phone" msg={e.phone} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="lead-city" className="sr-only">City</label>
          <select id="lead-city" name="city" defaultValue={v.city ?? ""} className={inputCls} {...fieldError(e, "city")}>
            <option value="" disabled>Select city</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Err id="city" msg={e.city} />
        </div>

        <div>
          <label htmlFor="lead-age" className="sr-only">Age (optional)</label>
          <input id="lead-age" name="age" type="number" min={0} max={120} placeholder="Age" defaultValue={v.age} className={inputCls} {...fieldError(e, "age")} />
          <Err id="age" msg={e.age} />
        </div>

        <div>
          <label htmlFor="lead-gender" className="sr-only">Gender (optional)</label>
          <select id="lead-gender" name="gender" defaultValue={v.gender ?? ""} className={inputCls}>
            <option value="">Gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>

        <div className="col-span-2">
          <label htmlFor="lead-concern" className="sr-only">What do you need help with?</label>
          <select id="lead-concern" name="concern" defaultValue={v.concern ?? ""} className={inputCls} {...fieldError(e, "concern")}>
            <option value="" disabled>What do you need help with?</option>
            {specialities.map((s) => <option key={s}>{s}</option>)}
            <option>Not sure</option>
          </select>
          <Err id="concern" msg={e.concern} />
        </div>

        <div className="col-span-2">
          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" name="consent" defaultChecked={v.consent ? true : !state.errors} className="mt-0.5 accent-brand-600" {...fieldError(e, "consent")} />
            I agree to be contacted by DocDuniya by call, SMS or WhatsApp.
          </label>
          <Err id="consent" msg={e.consent} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="col-span-2 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Request a call back"}
        </button>
        <p className="col-span-2 text-center text-xs text-slate-400">🔒 Your details are safe and never shared.</p>
      </form>
    </div>
  );
}
