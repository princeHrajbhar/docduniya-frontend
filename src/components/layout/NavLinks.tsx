"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicNavigation } from "@/constants/navigation";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
      {publicNavigation.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={
            isActive(pathname, href)
              ? "text-brand-700"
              : "text-slate-600 transition-colors hover:text-brand-600"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    // `key` resets the <details> (closing the menu) after navigating.
    <details key={pathname} className="group lg:hidden">
      <summary
        aria-label="Open menu"
        className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg text-slate-700 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <path className="group-open:hidden" d="M4 6h16M4 12h16M4 18h16" />
          <path className="hidden group-open:block" d="M18 6 6 18M6 6l12 12" />
        </svg>
      </summary>
      <nav className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white px-6 py-3 shadow-lg">
        {publicNavigation.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive(pathname, href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
