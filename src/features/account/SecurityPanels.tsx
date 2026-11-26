"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { Field, fieldError, inputCls } from "@/components/forms/fields";
import { ActionButton, SubmitButton } from "@/components/ui/interactive";
import { MonitorIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { Alert, Badge, Button, Card, CardHeader, Spinner, buttonClass, cx } from "@/components/ui/primitives";
import { changePassword } from "@/features/auth/actions";
import type { AuthSession, MfaStatus } from "@/lib/api/types";
import { dateLabel, relativeTime } from "@/lib/format";
import { activateMfa, disableMfa, regenerateRecoveryCodes, revokeSession, signOutEverywhere, startMfaEnrollment } from "./actions";

export function PasswordPanel() {
  const [state, action] = useActionState(changePassword, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <Card>
      <CardHeader title="Password" description="Changing it signs you out on every other device." />
      <form action={action} className="grid gap-5 p-6 sm:grid-cols-3">
        <Field id="currentPassword" label="Current password" error={errors.currentPassword}>
          <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputCls} />
        </Field>
        <Field id="newPassword" label="New password" error={errors.newPassword}>
          <input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" className={inputCls} {...fieldError(errors, "newPassword")} />
        </Field>
        <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
          <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputCls} {...fieldError(errors, "confirmPassword")} />
        </Field>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <SubmitButton pendingLabel="Updating…">Update password</SubmitButton>
          {state?.ok && <span className="text-sm text-emerald-700">{state.message}</span>}
          {state && !state.ok && !Object.keys(errors).length && <span className="text-sm text-rose-600">{state.error}</span>}
        </div>
      </form>
    </Card>
  );
}

function describeAgent(ua?: string) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

export function SessionsPanel({ sessions }: { sessions: AuthSession[] }) {
  return (
    <Card>
      <CardHeader
        title="Signed-in devices"
        description="Sign out anything you don't recognise."
        action={
          sessions.length > 1 ? (
            <form action={signOutEverywhere}>
              <button type="submit" className={buttonClass("secondary", "sm")}>
                Sign out everywhere
              </button>
            </form>
          ) : undefined
        }
      />
      <ul className="divide-y divide-slate-100">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-4 px-6 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
              <MonitorIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                {describeAgent(s.userAgent)}
                {s.current && <Badge tone="success">This device</Badge>}
              </p>
              <p className="text-xs text-slate-500">
                {s.ip ? `${s.ip} · ` : ""}Active {relativeTime(s.lastUsedAt ?? s.createdAt)} · Signed in {dateLabel(s.createdAt)}
              </p>
            </div>
            {!s.current && (
              <ActionButton action={revokeSession.bind(null, s.id)} variant="ghost">
                Sign out
              </ActionButton>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CodeInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="123456"
      className={cx(inputCls, "max-w-40 text-center font-mono tracking-[0.3em]")}
    />
  );
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  return (
    <Alert tone="warning" title="Save your recovery codes now">
      <p>Each code works once if you lose your phone. They won&apos;t be shown again.</p>
      <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-5">
        {codes.map((c) => (
          <li key={c} className="rounded-md bg-white px-2 py-1 text-center text-slate-900 ring-1 ring-amber-200">
            {c}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => navigator.clipboard?.writeText(codes.join("\n"))} className="mt-3 text-xs font-semibold underline">
        Copy all
      </button>
    </Alert>
  );
}

export function MfaPanel({ status }: { status: MfaStatus }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauthUri: string }>();
  const [codes, setCodes] = useState<string[]>();
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"disable" | "regenerate">();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const go = (fn: () => Promise<void>) =>
    start(async () => {
      setError(undefined);
      await fn();
    });

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-brand-600" /> Two-step verification
          </span>
        }
        description="Ask for a code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…) when signing in."
        action={status.enrolled ? <Badge tone="success">On</Badge> : <Badge>Off</Badge>}
      />
      <div className="space-y-4 p-6">
        {codes && <RecoveryCodes codes={codes} />}
        {error && <Alert tone="danger">{error}</Alert>}

        {status.enrolled ? (
          <>
            <p className="text-sm text-slate-600">
              Turned on {status.activatedAt ? dateLabel(status.activatedAt) : ""}. {status.recoveryCodesRemaining} recovery code{status.recoveryCodesRemaining === 1 ? "" : "s"} left.
            </p>
            {mode ? (
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-700">
                    Current code from your app
                  </label>
                  <CodeInput id="mfa-code" value={code} onChange={setCode} />
                </div>
                <button
                  type="button"
                  disabled={pending || code.length !== 6}
                  className={buttonClass(mode === "disable" ? "danger" : "primary")}
                  onClick={() =>
                    go(async () => {
                      const r = mode === "disable" ? await disableMfa(code) : await regenerateRecoveryCodes(code);
                      if (!r.ok) return setError(r.error);
                      if (mode === "regenerate" && r.data && "recoveryCodes" in (r.data as object)) setCodes((r.data as { recoveryCodes: string[] }).recoveryCodes);
                      setMode(undefined);
                      setCode("");
                      router.refresh();
                    })
                  }
                >
                  {pending && <Spinner />}
                  {mode === "disable" ? "Turn off" : "Get new codes"}
                </button>
                <Button variant="ghost" onClick={() => setMode(undefined)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setMode("regenerate")}>
                  New recovery codes
                </Button>
                {!status.enforcedForAdministrators && (
                  <Button variant="ghost" onClick={() => setMode("disable")} className="text-rose-700">
                    Turn off
                  </Button>
                )}
              </div>
            )}
          </>
        ) : enrollment ? (
          <div className="space-y-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Open your authenticator app and add a new account.</li>
              <li>
                Enter this setup key:{" "}
                <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm break-all text-slate-900 select-all">{enrollment.secret}</code>
                <span className="block text-xs text-slate-500">
                  On your phone? <a href={enrollment.otpauthUri} className="font-medium text-brand-700 underline">Open in your authenticator app</a>
                </span>
              </li>
              <li>Type the 6-digit code it shows.</li>
            </ol>
            <div className="flex flex-wrap items-end gap-3">
              <CodeInput id="mfa-activate" value={code} onChange={setCode} />
              <button
                type="button"
                disabled={pending || code.length !== 6}
                className={buttonClass("primary")}
                onClick={() =>
                  go(async () => {
                    const r = await activateMfa(code);
                    if (!r.ok) return setError(r.error);
                    setCodes(r.data.recoveryCodes);
                    setEnrollment(undefined);
                    setCode("");
                    router.refresh();
                  })
                }
              >
                {pending && <Spinner />}
                Turn on
              </button>
            </div>
            <p className="text-xs text-slate-500">Turning this on signs out your other devices.</p>
          </div>
        ) : (
          <Button
            disabled={pending}
            onClick={() =>
              go(async () => {
                const r = await startMfaEnrollment();
                if (!r.ok) return setError(r.error);
                setEnrollment(r.data);
              })
            }
          >
            {pending && <Spinner />}
            Set up two-step verification
          </Button>
        )}
      </div>
    </Card>
  );
}
