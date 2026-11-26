import Link from "next/link";
import { Suspense } from "react";
import { publicNavigation } from "@/constants/navigation";
import { Logo } from "./Logo";
import { MobileNav, NavLinks } from "./NavLinks";
import { UserMenu, UserMenuSkeleton } from "./UserMenu";

/** Plain links shown while the active-link highlighting (which reads the URL) streams in. */
function StaticNav() {
  return (
    <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
      {publicNavigation.map(({ href, label }) => (
        <Link key={href} href={href} className="text-slate-600 hover:text-brand-600">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Logo />
        <Suspense fallback={<StaticNav />}>
          <NavLinks />
        </Suspense>
        <div className="flex items-center gap-2">
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
          <Suspense>
            <MobileNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
