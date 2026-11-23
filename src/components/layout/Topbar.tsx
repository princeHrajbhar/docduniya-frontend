import { Suspense } from "react";
import { logout } from "@/features/auth/actions";
import { Logo } from "@/components/layout/Logo";
import { BellIcon, ChevronDownIcon, LogoutIcon, SearchIcon } from "@/components/ui/icons";
import { initials } from "@/lib/utils";
import { getSession, homeFor } from "@/lib/session";
import type { Role } from "@/types/auth";

export function Topbar({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="lg:hidden">
        <Logo href={homeFor(role)} />
      </div>
      <form role="search" className="relative hidden w-full max-w-xs sm:block">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          name="q"
          placeholder="Search doctors, records…"
          aria-label="Search"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </form>
      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <Suspense fallback={<div className="h-9 w-36 animate-pulse rounded-full bg-slate-100" />}>
          <ProfileMenu />
        </Suspense>
      </div>
    </header>
  );
}

async function ProfileMenu() {
  const session = await getSession();
  const name = !session
    ? "Guest"
    : session.role === "doctor"
      ? `Dr. ${session.name}`
      : session.name;

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initials(name)}
        </span>
        <span className="hidden text-sm font-semibold sm:block">{name}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">{name}</p>
          {session?.email && <p className="truncate text-xs text-slate-500">{session.email}</p>}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </details>
  );
}
