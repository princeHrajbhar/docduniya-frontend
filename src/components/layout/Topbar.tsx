import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/features/auth/actions";
import { NotificationsMenu } from "@/features/notifications/NotificationsMenu";
import { Logo } from "@/components/layout/Logo";
import { ChevronDownIcon, LogoutIcon, SearchIcon, SettingsIcon } from "@/components/ui/icons";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { api, attempt } from "@/lib/api/server";
import type { AppNotification, Page } from "@/lib/api/types";
import { getSession, homeFor } from "@/lib/session";
import type { Role } from "@/types/auth";

export function Topbar({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="lg:hidden">
        <Logo href={homeFor(role)} />
      </div>
      {role === "patient" && (
        <Link
          href="/doctors"
          className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white md:flex"
        >
          <SearchIcon className="h-4 w-4" />
          Search doctors and specialities
        </Link>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
          <Notifications />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-10 w-36 rounded-full" />}>
          <ProfileMenu role={role} />
        </Suspense>
      </div>
    </header>
  );
}

async function Notifications() {
  const page = await attempt(api<Page<AppNotification>>("/me/notifications", { query: { limit: 15 } }));
  return page.ok ? <NotificationsMenu items={page.data.items} /> : <NotificationsMenu items={[]} failed />;
}

async function ProfileMenu({ role }: { role: Role }) {
  const session = await getSession();
  const name = session?.name ?? "Account";

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
        <Avatar name={name} seed={session?.userId} size="sm" />
        <span className="hidden max-w-40 truncate text-sm font-semibold text-slate-800 sm:block">{name}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
        <div className="border-b border-slate-100 px-3 py-2.5">
          <p className="truncate text-sm font-semibold">{name}</p>
          {session?.email && <p className="truncate text-xs text-slate-500">{session.email}</p>}
        </div>
        <Link href={`/${role}/settings`} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <SettingsIcon className="h-4 w-4 text-slate-400" />
          Security settings
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <LogoutIcon className="h-4 w-4 text-slate-400" />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
