import { Suspense } from "react";
import type { Role } from "@/types/auth";
import { Skeleton } from "@/components/ui/primitives";
import { LoginForm } from "./LoginForm";

type Search = Promise<Record<string, string | string[] | undefined>>;

export function AuthFallback() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200/80 bg-white p-9 shadow-xl" aria-busy="true">
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-6 h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** Login screens read ?next= and notices from the URL, so they render per request. */
export function LoginPage({ role, searchParams }: { role: Role; searchParams: Search }) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <LoginWithParams role={role} searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginWithParams({ role, searchParams }: { role: Role; searchParams: Search }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const notice = sp.expired ? "expired" : sp.reset ? "reset" : undefined;
  return <LoginForm role={role} next={next} notice={notice} />;
}
