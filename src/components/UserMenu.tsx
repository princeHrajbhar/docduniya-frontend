import { logout } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { initials } from "@/lib/data";
import { AuthButtons } from "./auth/AuthButtons";

export async function UserMenu() {
  const session = await getSession();
  if (!session) return <AuthButtons />;

  const detail =
    session.profile && "speciality" in session.profile
      ? session.profile.speciality
      : session.profile?.city && `📍 ${session.profile.city}`;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold leading-tight">
          {session.role === "doctor" ? `Dr. ${session.name}` : session.name}
        </p>
        <p className="text-xs capitalize text-slate-500">
          {session.role}
          {detail && ` · ${detail}`}
        </p>
      </div>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-semibold text-teal-700">
        {initials(session.name)}
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <div className="h-10 w-40 animate-pulse rounded-full bg-slate-100" />;
}
