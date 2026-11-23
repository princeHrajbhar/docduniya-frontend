import { Suspense } from "react";
import { Logo } from "./Logo";
import { UserMenu, UserMenuSkeleton } from "./UserMenu";

export function SiteHeader({
  home,
  links = [],
}: {
  home: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo href={home} />
        <nav className="hidden gap-8 text-sm font-medium text-slate-600 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-teal-600">
              {l.label}
            </a>
          ))}
        </nav>
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
