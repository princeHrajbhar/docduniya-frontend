"use client";

import { useActionState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { Alert, Card, CardHeader, cx } from "@/components/ui/primitives";
import { createTicket } from "./actions";

const TOPICS = [
  ["BOOKING", "A booking or appointment"],
  ["PAYMENT", "Payments or refunds"],
  ["PROVIDER", "A doctor or clinic"],
  ["PRIVACY", "My data and privacy"],
  ["SAFETY", "A safety concern"],
  ["TECHNICAL", "Something isn't working"],
];

export function TicketForm({ appointmentId }: { appointmentId?: string }) {
  const [state, action] = useActionState(createTicket, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <Card>
      <CardHeader title="Contact support" description="For medical emergencies, call 112 or go to the nearest hospital." />
      {state?.ok ? (
        <div className="p-6">
          <Alert tone="success">{state.message}</Alert>
        </div>
      ) : (
        <form action={action} className="space-y-5 p-6">
          {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}
          <Field id="category" label="What's it about?" error={errors.category}>
            <select id="category" name="category" defaultValue={appointmentId ? "BOOKING" : ""} className={inputCls} {...fieldError(errors, "category")}>
              <option value="" disabled>
                Choose a topic
              </option>
              {TOPICS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field id="subject" label="Subject" error={errors.subject}>
            <input id="subject" name="subject" maxLength={200} className={inputCls} {...fieldError(errors, "subject")} />
          </Field>
          <Field id="description" label="Details" error={errors.description} hint="Don't include card numbers or passwords.">
            <textarea id="description" name="description" rows={5} maxLength={4000} className={cx(inputCls, "resize-y")} {...fieldError(errors, "description")} />
          </Field>
          {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger">{state.error}</Alert>}
          <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
        </form>
      )}
    </Card>
  );
}
