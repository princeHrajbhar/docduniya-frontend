"use client";

import { useActionState, useState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { Alert, cx } from "@/components/ui/primitives";
import { decideDoctorVerification } from "./actions";

const DECISIONS = [
  { value: "APPROVED", label: "Approve", tone: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  { value: "CHANGES_REQUIRED", label: "Request changes", tone: "border-amber-500 bg-amber-50 text-amber-800" },
  { value: "REJECTED", label: "Reject", tone: "border-rose-500 bg-rose-50 text-rose-800" },
];

export function DoctorDecisionForm({ reviewId, version, maxUntil }: { reviewId: string; version: number; maxUntil: string }) {
  const [decision, setDecision] = useState("APPROVED");
  const [state, action] = useActionState(decideDoctorVerification.bind(null, reviewId, version), null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const defaultUntil = maxUntil;

  if (state?.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="decision" value={decision} />
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Decision">
        {DECISIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            role="radio"
            aria-checked={decision === d.value}
            onClick={() => setDecision(d.value)}
            className={cx("rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition", decision === d.value ? d.tone : "border-slate-200 text-slate-600 hover:border-slate-300")}
          >
            {d.label}
          </button>
        ))}
      </div>

      {decision === "APPROVED" && (
        <>
          <fieldset className="space-y-2 rounded-xl bg-slate-50 p-4">
            <legend className="mb-1 text-sm font-semibold text-slate-900">Independent checks</legend>
            {[
              ["identityChecked", "Identity matches the council record"],
              ["registrationChecked", "Registration is genuine and current at the source"],
              ["qualificationsChecked", "Qualifications verified against the issuing institution"],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" name={name} className="h-4 w-4 accent-brand-600" />
                {label}
              </label>
            ))}
          </fieldset>
          <Field id="validUntil" label="Review again by" error={errors.validUntil} hint="At most a year away, and never after the registration expires.">
            <input id="validUntil" name="validUntil" type="date" defaultValue={defaultUntil} max={maxUntil} className={inputCls} />
          </Field>
        </>
      )}

      <Field id="reason" label={decision === "APPROVED" ? "Reviewer note" : "What should the doctor know?"} error={errors.reason} hint="Shared with the doctor. At least 20 characters.">
        <textarea
          id="reason"
          name="reason"
          rows={3}
          className={cx(inputCls, "resize-none")}
          placeholder={decision === "APPROVED" ? "Identity and selected credentials checked against source evidence." : "Explain what's missing or incorrect."}
          {...fieldError(errors, "reason")}
        />
      </Field>
      {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger">{state.error}</Alert>}
      <SubmitButton variant={decision === "REJECTED" ? "danger" : "primary"} pendingLabel="Recording…" className="w-full">
        Record decision
      </SubmitButton>
    </form>
  );
}
