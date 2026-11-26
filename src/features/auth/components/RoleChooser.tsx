import Link from "next/link";
import { ArrowRightIcon, HeartPulseIcon, StethoscopeIcon } from "@/components/ui/icons";

export type AuthMode = "login" | "signup";

const roles = [
  {
    role: "patient",
    Icon: HeartPulseIcon,
    title: "Patient",
    desc: "Find verified doctors, book visits and keep your records in one place.",
    tint: "bg-brand-50 text-brand-700",
    ring: "hover:border-brand-400 focus-visible:border-brand-500",
  },
  {
    role: "doctor",
    Icon: StethoscopeIcon,
    title: "Doctor",
    desc: "Manage your schedule, see patients and grow your practice.",
    tint: "bg-accent-50 text-accent-700",
    ring: "hover:border-accent-300 focus-visible:border-accent-400",
  },
] as const;

export function RoleChooser({ mode, onPick }: { mode: AuthMode; onPick?: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Join DocDuniya"}</h2>
      <p className="mt-1.5 text-sm text-slate-500">{mode === "login" ? "Choose how you'd like to sign in." : "Choose the account that fits you."}</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {roles.map(({ role, Icon, title, desc, tint, ring }) => (
          <Link
            key={role}
            href={`/${mode}/${role}`}
            onClick={onPick}
            className={`group rounded-2xl border border-slate-200 p-5 text-left outline-none transition hover:-translate-y-0.5 hover:shadow-lg ${ring}`}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold text-slate-900">
              {mode === "login" ? "Sign in" : "Sign up"} as a {title.toLowerCase()}
            </p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              Continue <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-7 text-center text-sm text-slate-600">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link href={mode === "login" ? "/signup" : "/login"} onClick={onPick} className="font-semibold text-brand-700 hover:underline">
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
