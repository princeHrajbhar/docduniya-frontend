"use client";

import { useActionState, useState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { Dialog, SubmitButton } from "@/components/ui/interactive";
import { PlusIcon } from "@/components/ui/icons";
import { Alert, Button, cx } from "@/components/ui/primitives";
import type { DoctorProfile, ProfessionalRegistration, Qualification, Specialty } from "@/lib/api/types";
import { addQualification, addRegistration, submitVerification, updateDoctorProfile } from "../actions";

type State = { ok: boolean; message?: string; error?: string; fieldErrors?: Record<string, string> } | null;

function useDialogForm(action: (prev: unknown, form: FormData) => Promise<State>) {
  const [open, setOpen] = useState(false);
  // Close the dialog when a submission succeeds.
  const [state, formAction] = useActionState(async (prev: State, form: FormData) => {
    const result = await action(prev, form);
    if (result?.ok) setOpen(false);
    return result;
  }, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return { open, setOpen, state, formAction, errors };
}

const COUNCILS = [
  "National Medical Commission",
  "Andhra Pradesh Medical Council", "Bihar Medical Council", "Delhi Medical Council", "Gujarat Medical Council",
  "Haryana Medical Council", "Karnataka Medical Council", "Kerala State Medical Councils", "Madhya Pradesh Medical Council",
  "Maharashtra Medical Council", "Punjab Medical Council", "Rajasthan Medical Council", "Tamil Nadu Medical Council",
  "Telangana State Medical Council", "Uttar Pradesh Medical Council", "West Bengal Medical Council",
];

const evidenceHint = "A reference our reviewers use to check the original, such as the certificate number, or where the document is held.";

export function AddQualificationButton() {
  const { open, setOpen, state, formAction, errors } = useDialogForm(addQualification);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="h-3.5 w-3.5" /> Add degree
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a qualification">
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <Field id="kind" label="Type">
            <select id="kind" name="kind" defaultValue="DEGREE" className={inputCls}>
              <option value="DEGREE">Degree</option>
              <option value="DIPLOMA">Diploma</option>
              <option value="FELLOWSHIP">Fellowship</option>
              <option value="CERTIFICATION">Certification</option>
              <option value="TRAINING">Training</option>
            </select>
          </Field>
          <Field id="awardYear" label="Year awarded" error={errors.awardYear} optional>
            <input id="awardYear" name="awardYear" inputMode="numeric" maxLength={4} className={inputCls} />
          </Field>
          <Field id="qualificationName" label="Qualification" error={errors.qualificationName} className="sm:col-span-2">
            <input id="qualificationName" name="qualificationName" placeholder="MBBS, MD (General Medicine)…" className={inputCls} {...fieldError(errors, "qualificationName")} />
          </Field>
          <Field id="institutionName" label="University or institution" error={errors.institutionName} className="sm:col-span-2">
            <input id="institutionName" name="institutionName" placeholder="AIIMS, New Delhi" className={inputCls} {...fieldError(errors, "institutionName")} />
          </Field>
          <Field id="certificateNumber" label="Certificate number" optional>
            <input id="certificateNumber" name="certificateNumber" className={inputCls} />
          </Field>
          <Field id="evidenceReference" label="Evidence reference" error={errors.evidenceReference} hint={evidenceHint}>
            <input id="evidenceReference" name="evidenceReference" className={inputCls} {...fieldError(errors, "evidenceReference")} />
          </Field>
          {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger" className="sm:col-span-2">{state.error}</Alert>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton pendingLabel="Saving…">Add qualification</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function AddRegistrationButton() {
  const { open, setOpen, state, formAction, errors } = useDialogForm(addRegistration);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="h-3.5 w-3.5" /> Add registration
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add your medical council registration">
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <Field id="authority" label="Council" error={errors.authority} className="sm:col-span-2">
            <input id="authority" name="authority" list="councils" placeholder="Start typing your council" className={inputCls} {...fieldError(errors, "authority")} />
            <datalist id="councils">
              {COUNCILS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field id="registrationNumber" label="Registration number" error={errors.registrationNumber}>
            <input id="registrationNumber" name="registrationNumber" className={cx(inputCls, "font-mono uppercase")} {...fieldError(errors, "registrationNumber")} />
          </Field>
          <Field id="jurisdiction" label="State / jurisdiction" error={errors.jurisdiction}>
            <input id="jurisdiction" name="jurisdiction" placeholder="Delhi" className={inputCls} {...fieldError(errors, "jurisdiction")} />
          </Field>
          <Field id="issuedOn" label="Issued on" optional>
            <input id="issuedOn" name="issuedOn" type="date" className={inputCls} />
          </Field>
          <Field id="expiresOn" label="Valid until" optional>
            <input id="expiresOn" name="expiresOn" type="date" className={inputCls} />
          </Field>
          <Field id="evidenceReference" label="Evidence reference" error={errors.evidenceReference} hint={evidenceHint} className="sm:col-span-2">
            <input id="evidenceReference" name="evidenceReference" className={inputCls} {...fieldError(errors, "evidenceReference")} />
          </Field>
          {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger" className="sm:col-span-2">{state.error}</Alert>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton pendingLabel="Saving…">Add registration</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function SubmitVerificationButton({ registrations, qualifications }: { registrations: ProfessionalRegistration[]; qualifications: Qualification[] }) {
  const { open, setOpen, state, formAction, errors } = useDialogForm(submitVerification);
  const ready = registrations.length > 0 && qualifications.length > 0;
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!ready}>
        Submit for verification
      </Button>
      {!ready && <p className="text-xs text-slate-500">Add a degree and a council registration first.</p>}
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      <Dialog open={open} onClose={() => setOpen(false)} size="lg" title="Submit for verification" description="A DocDuniya reviewer checks these against the source records. Your profile stays hidden while it's in review.">
        <form action={formAction} className="space-y-5">
          <Field id="registrationId" label="Registration to verify" error={errors.registrationId}>
            <select id="registrationId" name="registrationId" className={inputCls}>
              {registrations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.authority} · {r.registrationNumberNormalized}
                </option>
              ))}
            </select>
          </Field>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Qualifications to include</legend>
            <div className="mt-2 space-y-2">
              {qualifications.map((q) => (
                <label key={q.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <input type="checkbox" name="qualificationIds" value={q.id} defaultChecked className="h-4 w-4 accent-brand-600" />
                  <span>
                    <span className="font-medium text-slate-900">{q.qualificationName}</span>
                    <span className="text-slate-500"> · {q.institutionName}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.qualificationIds && <p className="mt-1.5 text-sm text-rose-600">{errors.qualificationIds}</p>}
          </fieldset>
          <Field id="declaration" label="Declaration" error={errors.declaration}>
            <textarea
              id="declaration"
              name="declaration"
              rows={3}
              defaultValue="I declare that the registration and qualifications I have submitted are my own, accurate and currently valid."
              className={cx(inputCls, "resize-none")}
            />
          </Field>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" name="attest" className="mt-0.5 h-4 w-4 accent-brand-600" />
            I understand that false declarations lead to removal from DocDuniya and may be reported to the council.
          </label>
          {errors.attest && <p className="text-sm text-rose-600">Please confirm to continue.</p>}
          {state && !state.ok && <Alert tone="danger">{state.error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton pendingLabel="Submitting…">Submit</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function DoctorProfileForm({ doctor, specialties, locked }: { doctor: DoctorProfile; specialties: Specialty[]; locked: boolean }) {
  const [state, action] = useActionState(updateDoctorProfile, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const selected = new Set(doctor.specialtyIds);
  return (
    <form action={action} className="space-y-5 p-6">
      {locked && <Alert tone="info">Your public profile is locked while it&apos;s under review or verified. Withdraw verification to make changes.</Alert>}
      <fieldset disabled={locked} className="space-y-5 disabled:opacity-70">
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <Field id="publicName" label="Name shown to patients" error={errors.publicName}>
            <input id="publicName" name="publicName" defaultValue={doctor.publicName} className={inputCls} {...fieldError(errors, "publicName")} />
          </Field>
          <Field id="careerStartYear" label="Practising since" error={errors.careerStartYear} optional>
            <input id="careerStartYear" name="careerStartYear" inputMode="numeric" maxLength={4} defaultValue={doctor.careerStartDate?.slice(0, 4)} className={inputCls} />
          </Field>
        </div>
        {specialties.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Specialities</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {specialties.map((s) => (
                <label key={s.id} className="cursor-pointer">
                  <input type="checkbox" name="specialtyIds" value={s.id} defaultChecked={selected.has(s.id)} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
                    {s.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <Field id="bio" label="About you" error={errors.bio}>
          <textarea id="bio" name="bio" rows={6} maxLength={4000} defaultValue={doctor.bio} className={cx(inputCls, "resize-y")} {...fieldError(errors, "bio")} />
        </Field>
        <div className="flex items-center gap-3">
          <SubmitButton pendingLabel="Saving…" disabled={locked}>Save profile</SubmitButton>
          {state?.ok && <span className="text-sm text-emerald-700">{state.message}</span>}
          {state && !state.ok && !Object.keys(errors).length && <span className="text-sm text-rose-600">{state.error}</span>}
        </div>
      </fieldset>
    </form>
  );
}
