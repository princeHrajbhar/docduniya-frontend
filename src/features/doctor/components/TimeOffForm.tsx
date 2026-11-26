"use client";

import { useActionState, useState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { Dialog, SubmitButton } from "@/components/ui/interactive";
import { Alert, Button } from "@/components/ui/primitives";
import { blockTime } from "../actions";

export function TimeOffButton() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(blockTime, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Block time off
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Block time off" description="Blocks your calendar at every clinic. Existing bookings in this window are flagged for the clinic to reassign.">
        {state?.ok ? (
          <div className="space-y-4">
            <Alert tone="success">{state.message}</Alert>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="from" label="From" error={errors.from}>
                <input id="from" name="from" type="datetime-local" required className={inputCls} />
              </Field>
              <Field id="to" label="Until" error={errors.to}>
                <input id="to" name="to" type="datetime-local" required className={inputCls} {...fieldError(errors, "to")} />
              </Field>
            </div>
            <Field id="reason" label="Reason" error={errors.reason} hint="Visible to clinic staff only. Up to 90 days at a time.">
              <input id="reason" name="reason" placeholder="Conference, leave…" className={inputCls} {...fieldError(errors, "reason")} />
            </Field>
            {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger">{state.error}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Saving…">Block time</SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
