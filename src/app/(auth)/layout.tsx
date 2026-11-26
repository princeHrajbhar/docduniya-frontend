import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { LockIcon, ShieldCheckIcon, StethoscopeIcon } from "@/components/ui/icons";

const TRUST = [
  { Icon: StethoscopeIcon, text: "Manually verified doctors" },
  { Icon: LockIcon, text: "Private, encrypted health records" },
  { Icon: ShieldCheckIcon, text: "Secure payments by Razorpay" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-transparent" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to site
        </Link>
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-4 pb-16 sm:items-center sm:px-6">{children}</main>
      <footer className="relative border-t border-slate-200/70 bg-white/60 py-5">
        <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-xs font-medium text-slate-500">
          {TRUST.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand-600" />
              {text}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
