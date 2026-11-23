"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "@/features/auth/actions";
import type { Role } from "@/types/auth";

const copy: Record<Role, { title: string; subtitle: string; other: Role; button: string }> = {
  patient: {
    title: "Patient Login",
    subtitle: "Book appointments and consult India's top doctors.",
    other: "doctor",
    button: "bg-brand-600 hover:bg-brand-700",
  },
  doctor: {
    title: "Doctor Login",
    subtitle: "Access your dashboard, appointments and patients.",
    other: "patient",
    button: "bg-brand-800 hover:bg-brand-900",
  },
  admin: {
    title: "Admin Login",
    subtitle: "Manage doctors, patients, staff and billing.",
    other: "patient",
    button: "bg-slate-800 hover:bg-slate-900",
  },
};

export function LoginForm({ role }: { role: Role }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login.bind(null, role),
    {},
  );
  const c = copy[role];

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold">{c.title}</h1>
      <p className="mt-1 text-slate-600">{c.subtitle}</p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={state.email}
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`w-full rounded-xl py-3 font-semibold text-white transition disabled:opacity-60 ${c.button}`}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Admin accounts are provisioned internally, so there's no public sign-up. */}
      {role !== "admin" && (
        <p className="mt-6 text-center text-sm text-slate-600">
          New to DocDuniya?{" "}
          <Link href={`/signup/${role}`} className="font-semibold text-brand-700 hover:underline">
            Create {role === "doctor" ? "a doctor" : "an"} account
          </Link>
        </p>
      )}

      <p className={`${role === "admin" ? "mt-6" : "mt-3"} text-center text-sm text-slate-600`}>
        Are you a {c.other}?{" "}
        <Link href={`/login/${c.other}`} className="font-semibold text-brand-700 hover:underline">
          Login as {c.other === "doctor" ? "Doctor" : "Patient"}
        </Link>
      </p>
    </div>
  );
}
