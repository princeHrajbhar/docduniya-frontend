"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { KeyIcon, MailIcon } from "@/components/ui/icons";
import { Alert } from "@/components/ui/primitives";
import { forgotPassword, resetPassword } from "../actions";
import { AuthCard } from "./AuthCard";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, null);
  return (
    <AuthCard icon={<MailIcon className="h-6 w-6" />} title="Reset your password" subtitle="Enter the email you signed up with and we'll send you a reset link.">
      {state?.ok ? (
        <Alert tone="success" title="Check your inbox">
          {state.message} The link expires in 5 minutes.
        </Alert>
      ) : (
        <form action={action} className="space-y-5">
          <Field id="email" label="Email address">
            <input id="email" name="email" type="email" required autoFocus autoComplete="email" placeholder="you@example.com" className={inputCls} />
          </Field>
          {state && !state.ok && <Alert tone="danger">{state.error}</Alert>}
          <SubmitButton className="w-full" size="lg" pendingLabel="Sending…">
            Send reset link
          </SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordForm({ token, email }: { token?: string; email?: string }) {
  const [state, action] = useActionState(resetPassword, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  if (!token || !email) {
    return (
      <AuthCard icon={<KeyIcon className="h-6 w-6" />} title="This link isn't valid">
        <Alert tone="warning">The reset link is incomplete or has been used. Request a new one to continue.</Alert>
        <Link href="/forgot-password" className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard icon={<KeyIcon className="h-6 w-6" />} title="Choose a new password" subtitle={<>For <strong className="text-slate-800">{email}</strong></>}>
      <form action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <Field id="password" label="New password" error={errors.password} hint="8+ characters with upper and lower case, a number and a symbol.">
          <input id="password" name="password" type="password" required autoFocus autoComplete="new-password" className={inputCls} {...fieldError(errors, "password")} />
        </Field>
        <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputCls} {...fieldError(errors, "confirmPassword")} />
        </Field>
        {state && !state.ok && !Object.keys(errors).length && <Alert tone="danger">{state.error}</Alert>}
        <SubmitButton className="w-full" size="lg" pendingLabel="Updating…">
          Update password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
