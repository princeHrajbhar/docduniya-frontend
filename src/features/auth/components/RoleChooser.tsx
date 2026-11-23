import Link from "next/link";

export type AuthMode = "login" | "signup";

const roles = [
  {
    role: "patient",
    icon: "🧑‍🤝‍🧑",
    title: "Patient",
    desc: "Find doctors, book appointments and consult online.",
    accent: "from-brand-500 to-brand-700",
    ring: "hover:border-brand-400",
  },
  {
    role: "doctor",
    icon: "🩺",
    title: "Doctor",
    desc: "Manage appointments, consult patients and grow your practice.",
    accent: "from-accent-500 to-accent-700",
    ring: "hover:border-accent-400",
  },
] as const;

export function RoleChooser({
  mode,
  onPick,
}: {
  mode: AuthMode;
  onPick?: () => void;
}) {
  const verb = mode === "login" ? "Login" : "Sign up";
  return (
    <div>
      <h2 className="text-2xl font-bold">
        {mode === "login" ? "Welcome back!" : "Join DocDuniya"}
      </h2>
      <p className="mt-1 text-slate-600">
        {mode === "login" ? "How would you like to login?" : "How would you like to sign up?"}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <Link
            key={r.role}
            href={`/${mode}/${r.role}`}
            onClick={onPick}
            className={`group rounded-2xl border-2 border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${r.ring}`}
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-2xl ${r.accent}`}>
              {r.icon}
            </span>
            <p className="mt-4 text-lg font-semibold">
              {verb} as {r.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{r.desc}</p>
            <span className="mt-3 inline-block font-semibold text-brand-700 transition group-hover:translate-x-1">
              Continue →
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          onClick={onPick}
          className="font-semibold text-brand-700 hover:underline"
        >
          {mode === "login" ? "Create an account" : "Login"}
        </Link>
      </p>
    </div>
  );
}
