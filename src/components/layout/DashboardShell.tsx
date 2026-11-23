import type { ReactNode } from "react";
import type { Role } from "@/types/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar + top bar frame shared by the patient, doctor and admin areas. */
export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50/60 lg:flex-row">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} />
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
