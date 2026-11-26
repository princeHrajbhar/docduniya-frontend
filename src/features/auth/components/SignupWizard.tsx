"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { MailIcon } from "@/components/ui/icons";
import { Alert, Button, Spinner, buttonClass, cx } from "@/components/ui/primitives";
import type { Specialty } from "@/lib/api/types";
import { completeSignup, requestSignupCode, resendCode } from "../actions";
import { AuthCard } from "./AuthCard";
import { ProfileFields, emptyProfile, type ProfileKind } from "./ProfileFields";

const RULES: Array<[RegExp, string]> = [
  [/.{8,}/, "8+ characters"],
  [/[A-Z]/, "Uppercase"],
  [/[a-z]/, "Lowercase"],
  [/[0-9]/, "Number"],
  [/[^A-Za-z0-9]/, "Symbol"],
];

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Password requirements">
      {RULES.map(([re, label]) => {
        const met = re.test(password);
        return (
          <li key={label} className={cx("rounded-full px-2 py-0.5 text-xs font-medium transition", met ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            {met ? "✓ " : ""}
            {label}
          </li>
        );
      })}
    </ul>
  );
}

const COPY: Record<ProfileKind, { title: string; subtitle: string }> = {
  patient: {
    title: "Create your account",
    subtitle: "Book verified doctors and keep your health records in one secure place.",
  },
  doctor: {
    title: "Join DocDuniya as a doctor",
    subtitle: "Create your profile now. You'll add your registration and degrees for verification next.",
  },
};

export function SignupWizard({ kind, specialties }: { kind: ProfileKind; specialties?: Specialty[] }) {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [profile, setProfile] = useState(() => emptyProfile(kind));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [cooldown, setCooldown] = useState(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const payload = { kind, email, password, profile };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setErrors({ terms: "Please accept the terms to continue." });
      return;
    }
    start(async () => {
      setError(undefined);
      const result = await requestSignupCode(payload);
      if (result.ok) {
        setErrors({});
        setStep("verify");
        setCooldown(60);
      } else {
        setErrors(result.fieldErrors ?? {});
        setError(result.code === "USER_EXISTS" ? undefined : result.error);
        if (result.code === "USER_EXISTS") setErrors({ email: result.error });
      }
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setError(undefined);
      setNotice(undefined);
      const result = await completeSignup(payload, otp.trim());
      if (!result.ok) setError(result.error);
    });
  };

  const resend = () =>
    start(async () => {
      setError(undefined);
      const result = await resendCode(email);
      if (result.ok) {
        setNotice(`A new code is on its way to ${email}.`);
        setCooldown(60);
      } else setError(result.error);
    });

  if (step === "verify") {
    return (
      <AuthCard icon={<MailIcon className="h-6 w-6" />} title="Check your email" subtitle={<>We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>. It expires in 5 minutes.</>}>
        <form onSubmit={submitCode} className="space-y-5">
          <Field id="otp" label="Verification code">
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              className={cx(inputCls, "text-center font-mono text-2xl tracking-[0.5em]")}
            />
          </Field>
          {error && <Alert tone="danger">{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}
          <button type="submit" disabled={pending || otp.length !== 6} className={buttonClass("primary", "lg", "w-full")}>
            {pending && <Spinner />}
            {pending ? "Setting up your account…" : "Verify and continue"}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={() => setStep("details")} className="font-medium text-slate-600 hover:text-slate-900">
            ← Change details
          </button>
          <button type="button" disabled={cooldown > 0 || pending} onClick={resend} className="font-semibold text-brand-700 hover:underline disabled:text-slate-400 disabled:no-underline">
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard wide title={COPY[kind].title} subtitle={COPY[kind].subtitle}>
      <ol className="mb-8 flex items-center gap-3 text-xs font-medium" aria-label="Progress">
        <li className="flex items-center gap-2 text-brand-700">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">1</span>Your details
        </li>
        <li className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        <li className="flex items-center gap-2 text-slate-400">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100">2</span>Verify email
        </li>
      </ol>
      <form onSubmit={submitDetails} noValidate className="space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">{kind === "doctor" ? "Professional profile" : "About you"}</h2>
          <ProfileFields kind={kind} values={profile} errors={errors} specialties={specialties} onChange={(k, v) => setProfile((p) => ({ ...p, [k]: v }))} />
        </section>
        <section className="border-t border-slate-100 pt-8">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Sign-in details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email address" error={errors.email}>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={inputCls} {...fieldError(errors, "email")} />
            </Field>
            <Field id="password" label="Password" error={errors.password}>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Create a strong password" className={inputCls} {...fieldError(errors, "password")} />
              <PasswordChecklist password={password} />
            </Field>
          </div>
        </section>
        <div>
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-brand-600" />
            <span>
              I agree to DocDuniya&apos;s Terms of Service and{" "}
              <Link href="/privacy-policy" className="font-medium text-brand-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-sm text-rose-600">{errors.terms}</p>}
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Spinner />}
          {pending ? "Sending code…" : "Continue"}
        </Button>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={`/login/${kind}`} className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
