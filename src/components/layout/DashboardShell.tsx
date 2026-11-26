import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/primitives";
import { getSession } from "@/lib/session";
import type { Role } from "@/types/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar + top bar frame shared by the patient, doctor and admin areas. */
export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      <Suspense fallback={<SidebarSkeleton />}>
        <SessionSidebar role={role} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} />
        <main className="flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Static stand-in while the session loads; it must not read the URL, so it prerenders. */
function SidebarSkeleton() {
  return (
    <aside aria-hidden="true" className="hidden border-r border-slate-200/80 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
      <div className="px-6 pt-5 pb-6">
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-2 px-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </aside>
  );
}

async function SessionSidebar({ role }: { role: Role }) {
  const session = await getSession();
  return <Sidebar role={role} permissions={session?.permissions ?? []} />;
}
