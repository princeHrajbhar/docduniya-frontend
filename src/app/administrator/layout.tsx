import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { LockIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Administrator portal – DocDuniya",
  // Staff-only pages stay out of search results.
  robots: { index: false, follow: false },
};

/** The administrator portal is deliberately separate from the patient and doctor sign-in. */
export default function AdministratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-slate-900" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-white [&_a]:text-white">
        <Logo />
        <span className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          <LockIcon className="h-3.5 w-3.5" />
          Administrator portal
        </span>
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:px-6">{children}</main>
      <footer className="relative py-5 text-center text-xs text-slate-500">
        Restricted to authorized DocDuniya staff. Sign-ins are logged.
      </footer>
    </div>
  );
}
