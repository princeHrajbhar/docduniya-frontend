import { logout } from "@/features/auth/actions";
import { getSession, homeFor } from "@/lib/session";
import { AuthButtons } from "@/features/auth/components/AuthButtons";
import { Avatar, ButtonLink } from "@/components/ui/primitives";

export async function UserMenu() {
  const session = await getSession();
  if (!session) return <AuthButtons />;

  return (
    <div className="flex items-center gap-2">
      <ButtonLink href={homeFor(session.role)} variant="secondary" size="md" className="hidden sm:inline-flex">
        <Avatar name={session.name} seed={session.userId} size="sm" className="-ml-2 h-6 w-6 text-[10px]" />
        My dashboard
      </ButtonLink>
      <form action={logout}>
        <button type="submit" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          Sign out
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />;
}
