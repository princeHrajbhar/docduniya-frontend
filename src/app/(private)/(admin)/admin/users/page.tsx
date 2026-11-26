import Link from "next/link";
import { Suspense } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Avatar, Badge, Card, EmptyState, ListSkeleton, LoadError, PageHeader, buttonClass } from "@/components/ui/primitives";
import { inputCls } from "@/components/forms/fields";
import { setUserActive, unlockUser } from "@/features/admin/actions";
import { CreateUserButton } from "@/features/admin/CreateUserButton";
import { NoAccess } from "@/features/admin/NoAccess";
import { friendlyMessage } from "@/lib/api/errors";
import { api, apiEnvelope, type Envelope } from "@/lib/api/server";
import type { PlatformUser } from "@/lib/api/types";
import { dateLabel, humanize, relativeTime } from "@/lib/format";
import { adminContext } from "@/services/admin";

export const metadata = { title: "Users – DocDuniya admin" };

type Props = PageProps<"/admin/users">;
const bare = inputCls.replace("mt-1.5 ", "");
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default function UsersPage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<ListSkeleton rows={8} />}>
        <Users searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Users({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { allowed, session } = await adminContext("users.manage");
  if (!allowed) return <NoAccess permission="users.manage" />;
  const sp = await searchParams;
  const search = one(sp.search);
  const status = one(sp.status);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  let result: Envelope<PlatformUser[]>;
  let roles: Array<{ slug: string; name: string }> = [];
  try {
    [result, roles] = await Promise.all([
      apiEnvelope<PlatformUser[]>("/users", {
        query: { page, limit: 20, search, ...(status === "active" ? { isActive: "true" } : status === "disabled" ? { isActive: "false" } : status === "unverified" ? { isVerified: "false" } : {}) },
      }),
      api<Array<{ slug: string; name: string }>>("/roles/assignable").catch(() => []),
    ]);
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const users = result.data;
  const pages = result.pagination?.pages ?? 1;
  const href = (p: number) => `/admin/users?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Users"
        description={`${result.pagination?.total.toLocaleString("en-IN") ?? users.length} accounts. Patient and doctor profiles are managed by their owners.`}
        actions={<CreateUserButton roles={roles.length ? roles : [{ slug: "user", name: "User" }]} />}
      />
      <form className="flex flex-wrap gap-3" role="search">
        <div className="relative min-w-64 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="search" defaultValue={search} placeholder="Search by email" className={`${bare} pl-10`} />
        </div>
        <select name="status" defaultValue={status ?? ""} className={`${bare} w-auto`} aria-label="Status">
          <option value="">All accounts</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="unverified">Email not verified</option>
        </select>
        <button type="submit" className={buttonClass("secondary")}>
          Filter
        </button>
      </form>

      {users.length === 0 ? (
        <EmptyState title="No accounts match">Try a different search.</EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last sign-in</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const id = u.id ?? u._id ?? "";
                  const self = id === session.userId;
                  return (
                    <tr key={id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.email} seed={id} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900">{u.email}</p>
                            <p className="text-xs text-slate-500">Joined {dateLabel(u.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={u.role === "super-admin" ? "accent" : u.role === "user" ? "neutral" : "brand"}>{humanize(u.role)}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        {!u.isActive ? <Badge tone="danger">Disabled</Badge> : !u.isVerified ? <Badge tone="warning">Unverified</Badge> : <Badge tone="success">Active</Badge>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{u.lastLoginAt ? relativeTime(u.lastLoginAt) : "Never"}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          {u.lockedUntil && new Date(u.lockedUntil) > new Date() && (
                            <ActionButton action={unlockUser.bind(null, id)} variant="ghost">
                              Unlock
                            </ActionButton>
                          )}
                          {!self &&
                            (u.isActive ? (
                              <ActionButton
                                action={setUserActive.bind(null, id, false)}
                                variant="ghost"
                                confirm={{ title: `Disable ${u.email}?`, description: "They'll be signed out everywhere and can't sign in until re-enabled.", confirmLabel: "Disable", tone: "danger" }}
                              >
                                Disable
                              </ActionButton>
                            ) : (
                              <ActionButton action={setUserActive.bind(null, id, true)}>Enable</ActionButton>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={href(page - 1)} className={buttonClass("secondary", "sm")}>
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={href(page + 1)} className={buttonClass("secondary", "sm")}>
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
