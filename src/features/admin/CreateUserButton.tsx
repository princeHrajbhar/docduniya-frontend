"use client";

import { useActionState, useState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { Dialog, SubmitButton } from "@/components/ui/interactive";
import { PlusIcon } from "@/components/ui/icons";
import { Alert, Button } from "@/components/ui/primitives";
import { createUser } from "./actions";

export function CreateUserButton({ roles }: { roles: Array<{ slug: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createUser, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" /> Add staff account
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a staff account" description="They'll receive a single-use link to choose their own password.">
        {state?.ok ? (
          <div className="space-y-4">
            <Alert tone="success">{state.message}</Alert>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <Field id="new-email" label="Work email" error={errors.email}>
              <input id="new-email" name="email" type="email" required className={inputCls} {...fieldError(errors, "email")} />
            </Field>
            <Field id="new-role" label="Role" hint="Roles decide which admin sections they can open.">
              <select id="new-role" name="role" className={inputCls} defaultValue="user">
                {roles.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger">{state.error}</Alert>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Creating…">Create account</SubmitButton>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
