"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, inputCls } from "@/components/forms/fields";
import { SubmitButton } from "@/components/ui/interactive";
import { Alert } from "@/components/ui/primitives";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { login, verifyMfa, type LoginState } from "@/features/auth/actions";
import type { Role } from "@/types/auth";
import { AuthCard } from "./AuthCard";

const copy: Record<Role, { title: string; subtitle: string; other?: Role }> = {
  patient: {
    title: "Welcome back",
    subtitle: "Sign in to manage appointments, records and prescriptions.",
    other: "doctor",
  },
  doctor: {
    title: "Doctor sign in",
    subtitle: "Your schedule, patients and verification in one place.",
    other: "patient",
  },
  admin: {
    title: "Admin console",
    subtitle: "Restricted to DocDuniya platform staff.",
  },
};

export function LoginForm({ role, next, notice }: { role: Role; next?: string; notice?: "expired" | "reset" | "verified" }) {
  const [state, signIn] = useActionState<LoginState, FormData>(login.bind(null, role, next), {});
  const [mfaState, confirmCode] = useActionState<LoginState, FormData>(verifyMfa.bind(null, role, next), {});
  const c = copy[role];

  // A failed code keeps the challenge; an expired challenge comes back without one.
  const expired = Boolean(mfaState.error) && !mfaState.challengeToken;
  const challenge = expired ? undefined : (mfaState.challengeToken ?? state.challengeToken);

  if (state.challengeToken) {
    return (
      <AuthCard
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        title="Two-step verification"
        subtitle="Enter the 6-digit code from your authenticator app. You can also use a recovery code."
      >
        <form action={confirmCode} className="space-y-5">
          <input type="hidden" name="challengeToken" value={challenge ?? ""} />
          <input type="hidden" name="email" value={state.email ?? ""} />
          <Field id="code" label="Verification code">
            <input
              id="code"
              name="code"
              required
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="123 456"
              className={`${inputCls} text-center font-mono text-lg tracking-[0.4em]`}
            />
          </Field>
          {mfaState.error && <Alert tone="danger">{mfaState.error}</Alert>}
          {challenge ? (
            <SubmitButton className="w-full" size="lg" pendingLabel="Verifying…">
              Verify and sign in
            </SubmitButton>
          ) : (
            // A full reload resets this form's state back to the password step.
            <a href={`/login/${role}`} className="block text-center text-sm font-semibold text-brand-700 hover:underline">
              Start again
            </a>
          )}
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={c.title} subtitle={c.subtitle} badge={role === "admin" ? "Staff only" : undefined}>
      {notice === "expired" && (
        <Alert tone="warning" className="mb-5">
          Your session ended. Please sign in again.
        </Alert>
      )}
      {notice === "reset" && (
        <Alert tone="success" className="mb-5">
          Password updated. Sign in with your new password.
        </Alert>
      )}
      <form action={signIn} className="space-y-5">
        <Field id="email" label="Email address">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            defaultValue={state.email}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </Field>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            className={inputCls}
          />
        </div>

        {state.error && <Alert tone="danger">{state.error}</Alert>}

        <SubmitButton className="w-full" size="lg" variant={role === "admin" ? "dark" : "primary"} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      {role !== "admin" && (
        <div className="mt-6 space-y-2 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          <p>
            New to DocDuniya?{" "}
            <Link href={`/signup/${role}`} className="font-semibold text-brand-700 hover:underline">
              Create {role === "doctor" ? "a doctor" : "an"} account
            </Link>
          </p>
          {c.other && (
            <p>
              Are you a {c.other}?{" "}
              <Link href={`/login/${c.other}`} className="font-semibold text-brand-700 hover:underline">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      )}
    </AuthCard>
  );
}
