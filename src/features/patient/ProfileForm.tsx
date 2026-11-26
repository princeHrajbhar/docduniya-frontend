"use client";

import { useActionState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { Alert, Card, CardHeader } from "@/components/ui/primitives";
import type { Patient } from "@/lib/api/types";
import { updatePatientProfile } from "./actions";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const LANGS = [
  ["en", "English"], ["hi", "Hindi"], ["bn", "Bengali"], ["mr", "Marathi"], ["ta", "Tamil"], ["te", "Telugu"],
  ["kn", "Kannada"], ["ml", "Malayalam"], ["gu", "Gujarati"], ["pa", "Punjabi"], ["ur", "Urdu"],
];

const local = (e164?: string) => e164?.replace(/^\+91/, "") ?? "";

export function ProfileForm({ patient: p }: { patient: Patient }) {
  const [state, action] = useActionState(updatePatientProfile, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const phone = p.contacts.find((c) => c.kind === "PHONE" && c.use === "PERSONAL")?.value;
  const email = p.contacts.find((c) => c.kind === "EMAIL")?.value;
  const home = p.addresses.find((a) => a.use === "HOME");
  const ec = p.emergencyContacts[0];
  const input = (key: string) => ({ id: key, name: key, className: inputCls, ...fieldError(errors, key) });

  return (
    <form action={action} className="space-y-6">
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      {state && !state.ok && <Alert tone="danger">{state.error}</Alert>}

      <Card>
        <CardHeader title="Personal details" description="Clinics use these to register you. Keep them matching your ID." />
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name} className="sm:col-span-2">
            <input {...input("name")} defaultValue={p.name.display} autoComplete="name" />
          </Field>
          <Field id="birthDate" label="Date of birth" error={errors.birthDate}>
            <input {...input("birthDate")} type="date" defaultValue={p.birthDate} />
          </Field>
          <Field id="sex" label="Sex">
            <select {...input("sex")} defaultValue={p.administrativeSex}>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
              <option value="UNKNOWN">Prefer not to say</option>
            </select>
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone} optional>
            <input {...input("phone")} type="tel" inputMode="numeric" defaultValue={local(phone)} placeholder="98765 43210" />
          </Field>
          <Field id="preferredLanguage" label="Preferred language">
            <select {...input("preferredLanguage")} defaultValue={p.preferredLanguage}>
              {LANGS.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          {email && <p className="text-sm text-slate-500 sm:col-span-2">Email on file: <span className="font-medium text-slate-700">{email}</span></p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Home address" description="Optional. Helps clinics with home visits and invoices." />
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field id="line1" label="Address line 1" error={errors.line1} className="sm:col-span-2">
            <input {...input("line1")} defaultValue={home?.line1} autoComplete="address-line1" />
          </Field>
          <Field id="line2" label="Address line 2" optional className="sm:col-span-2">
            <input {...input("line2")} defaultValue={home?.line2} autoComplete="address-line2" />
          </Field>
          <Field id="city" label="City" error={errors.city}>
            <input {...input("city")} defaultValue={home?.city} autoComplete="address-level2" />
          </Field>
          <Field id="stateCode" label="State" error={errors.stateCode}>
            <select {...input("stateCode")} defaultValue={home?.stateCode ?? ""}>
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field id="postalCode" label="PIN code" error={errors.postalCode}>
            <input {...input("postalCode")} inputMode="numeric" maxLength={6} defaultValue={home?.postalCode} autoComplete="postal-code" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Emergency contact" description="Someone we can reach if you can't be contacted." />
        <div className="grid gap-5 p-6 sm:grid-cols-3">
          <Field id="ecName" label="Name" error={errors.ecName}>
            <input {...input("ecName")} defaultValue={ec?.name.display} />
          </Field>
          <Field id="ecRelation" label="Relationship" error={errors.ecRelation}>
            <input {...input("ecRelation")} defaultValue={ec?.relation} placeholder="Spouse, parent…" />
          </Field>
          <Field id="ecPhone" label="Mobile number" error={errors.ecPhone}>
            <input {...input("ecPhone")} type="tel" inputMode="numeric" defaultValue={local(ec?.phone)} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
