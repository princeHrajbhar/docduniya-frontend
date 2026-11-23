import { Suspense } from "react";
import { Logo } from "./Logo";
import { MobileNav, NavLinks } from "./NavLinks";
import { UserMenu, UserMenuSkeleton } from "./UserMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-2">
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
