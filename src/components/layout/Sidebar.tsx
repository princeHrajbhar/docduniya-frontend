"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { cx } from "@/components/ui/primitives";
import { navigation } from "@/constants/navigation";
import { homeFor } from "@/lib/session-core";
import type { Role } from "@/types/auth";

const AREA_LABEL: Record<Role, string> = { patient: "Patient", doctor: "Doctor", admin: "Admin console" };

function NavList({ role, permissions, onNavigate }: { role: Role; permissions: string[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="space-y-6 px-3">
      {navigation[role].map((section, i) => {
        const items = section.items.filter((item) => !item.permission || permissions.includes(item.permission));
        if (items.length === 0) return null;
        return (
          <div key={section.title ?? i}>
            {section.title && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{section.title}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <Icon className={cx("h-[18px] w-[18px]", active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role, permissions = [] }: { role: Role; permissions?: string[] }) {
  // The drawer closes itself when a link is chosen (onNavigate).
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden border-r border-slate-200/80 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="px-6 pt-5 pb-6">
          <Logo href={homeFor(role)} />
          <p className="mt-1 pl-11 text-xs font-medium text-slate-400">{AREA_LABEL[role]}</p>
        </div>
        <div className="flex-1 overflow-y-auto pb-6">
          <NavList role={role} permissions={permissions} />
        </div>
      </aside>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed bottom-5 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-xl lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo href={homeFor(role)} />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-6">
              <NavList role={role} permissions={permissions} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
