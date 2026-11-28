"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Field, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { Alert } from "@/components/ui/primitives";
import { KeyIcon, LockIcon, MailIcon } from "@/components/ui/icons";
import { adminLoginStep, type AdminLoginState } from "@/features/auth/admin-actions";
import { AuthCard } from "./AuthCard";

const RESEND_AFTER_SECONDS = 60;

const codeInput = `${inputCls} text-center font-mono text-lg tracking-[0.4em]`;

/** Administrator portal: password, then the code emailed for this sign-in. */
export function AdminLoginForm({ next, notice }: { next?: string; notice?: "expired" }) {
  const [state, dispatch] = useActionState<AdminLoginState, FormData>(adminLoginStep.bind(null, next), {
    step: "password",
  });

  if (state.step === "code") return <CodeStep state={state} dispatch={dispatch} />;

  if (state.step === "authenticator") {
    return (
      <AuthCard
        icon={<KeyIcon className="h-6 w-6" />}
        badge="Staff only"
        title="Authenticator code"
        subtitle="Your account also uses an authenticator app. Enter its current 6-digit code, or a recovery code."
      >
        <form action={dispatch} className="space-y-5">
          <input type="hidden" name="intent" value="authenticator" />
          <Field id="code" label="Authenticator code">
            <input
              id="code"
              name="code"
              required
              autoFocus
              autoComplete="one-time-code"
              placeholder="123 456"
              className={codeInput}
            />
          </Field>
          {state.error && <Alert tone="danger">{state.error}</Alert>}
          <SubmitButton className="w-full" size="lg" variant="dark" pendingLabel="Verifying…">
            Verify and sign in
          </SubmitButton>
        </form>
        <RestartLink dispatch={dispatch} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={<LockIcon className="h-6 w-6" />}
      badge="Staff only"
      title="Administrator sign in"
      subtitle="For DocDuniya platform staff. A verification code is emailed to you every time you sign in."
    >
      {notice === "expired" && (
        <Alert tone="warning" className="mb-5">
          Your session ended. Please sign in again.
        </Alert>
      )}
      <form action={dispatch} className="space-y-5">
        <input type="hidden" name="intent" value="password" />
        <Field id="email" label="Work email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            defaultValue={state.email}
            autoComplete="username"
            placeholder="you@docduniya.com"
            className={inputCls}
          />
        </Field>
        <Field id="password" label="Password">
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            className={inputCls}
          />
        </Field>
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        <SubmitButton className="w-full" size="lg" variant="dark" pendingLabel="Checking…">
          Continue
        </SubmitButton>
      </form>
      <div className="mt-6 space-y-2 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
        <p>
          <Link href="/forgot-password" className="font-semibold text-slate-900 hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Patients and doctors sign in at{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            the main sign-in page
          </Link>
          .
        </p>
      </div>
    </AuthCard>
  );
}

function CodeStep({ state, dispatch }: { state: AdminLoginState; dispatch: (form: FormData) => void }) {
  // Counts down to when a new code may be requested, from when the latest code was sent.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const sentAt = state.sentAt ? Date.parse(state.sentAt) : now;
  const wait = Math.max(0, Math.ceil(RESEND_AFTER_SECONDS - (now - sentAt) / 1000));

  return (
    <AuthCard
      icon={<MailIcon className="h-6 w-6" />}
      badge="Staff only"
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit sign-in code to <strong className="text-slate-700">{state.sentTo}</strong>. It expires in 10
          minutes and works once.
        </>
      }
    >
      <form action={dispatch} className="space-y-5">
        <input type="hidden" name="intent" value="code" />
        <Field id="code" label="Verification code">
          <input
            id="code"
            name="code"
            required
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="123 456"
            className={codeInput}
          />
        </Field>
        {state.notice && <Alert tone="success">{state.notice}</Alert>}
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        <SubmitButton className="w-full" size="lg" variant="dark" pendingLabel="Verifying…">
          Verify and sign in
        </SubmitButton>
      </form>
      <form action={dispatch} className="mt-4 text-center text-sm text-slate-600">
        <input type="hidden" name="intent" value="resend" />
        {wait > 0 ? (
          <p>You can request a new code in {wait}s.</p>
        ) : (
          <button type="submit" className="font-semibold text-slate-900 hover:underline">
            Send a new code
          </button>
        )}
      </form>
      <RestartLink dispatch={dispatch} />
    </AuthCard>
  );
}

function RestartLink({ dispatch }: { dispatch: (form: FormData) => void }) {
  return (
    <form action={dispatch} className="mt-6 border-t border-slate-100 pt-6 text-center text-sm">
      <input type="hidden" name="intent" value="restart" />
      <button type="submit" className="font-medium text-slate-500 hover:text-slate-900">
        ← Use a different account
      </button>
    </form>
  );
}
