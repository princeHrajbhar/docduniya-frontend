import Link from "next/link";
import { Suspense } from "react";
import { ActivityIcon, BuildingIcon, IdCardIcon, MessageIcon, StarIcon, StethoscopeIcon } from "@/components/ui/icons";
import { Alert, Card, CardHeader, PageHeader, Skeleton, StatCard } from "@/components/ui/primitives";
import { api, apiEnvelope } from "@/lib/api/server";
import type { OutboxHealth, Page, PlatformUser, SupportTicket } from "@/lib/api/types";
import { dateTimeLabel, humanize } from "@/lib/format";
import { adminContext } from "@/services/admin";

export const metadata = { title: "Admin overview – DocDuniya" };

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin console" title="Platform overview" description="Queues that need a reviewer, and the health of background processing." />
      <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>}>
        <Overview />
      </Suspense>
    </div>
  );
}

/** Count of a cursor-paged queue, shown as "25+" when there are more. */
async function queueCount(path: string) {
  const page = await api<Page<unknown>>(path, { query: { limit: 25 } });
  return page.nextCursor ? "25+" : String(page.items.length);
}

async function Overview() {
  const { permissions } = await adminContext();
  const can = (p: string) => permissions.includes(p);
  const safe = <T,>(p: Promise<T>) => p.catch(() => undefined);

  const [doctors, providers, reviews, tickets, users, health] = await Promise.all([
    can("doctors.verify") ? safe(queueCount("/platform/doctor-verifications")) : undefined,
    can("providers.verify") ? safe(queueCount("/platform/provider-verifications")) : undefined,
    can("reviews.moderate") ? safe(queueCount("/platform/reviews")) : undefined,
    can("support.manage") ? safe(api<Page<SupportTicket>>("/platform/support-tickets", { query: { limit: 25 } })) : undefined,
    can("users.manage") ? safe(apiEnvelope<PlatformUser[]>("/users", { query: { limit: 1 } })) : undefined,
    can("operations.manage") ? safe(api<OutboxHealth>("/platform/operations/health")) : undefined,
  ]);

  const urgent = tickets?.items.filter((t) => t.priority === "URGENT" && t.status !== "RESOLVED") ?? [];

  return (
    <>
      {health && health.failed > 0 && (
        <Alert tone="danger" title={`${health.failed} background event${health.failed > 1 ? "s" : ""} failed`} action={<Link href="/admin/operations" className="text-sm font-semibold underline">Review</Link>}>
          Notifications or payment follow-ups may not have gone out.
        </Alert>
      )}
      {urgent.length > 0 && (
        <Alert tone="warning" title={`${urgent.length} urgent support ticket${urgent.length > 1 ? "s" : ""}`} action={<Link href="/admin/support" className="text-sm font-semibold underline">Open queue</Link>} />
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors !== undefined && <StatCard label="Doctors awaiting review" value={doctors} icon={<StethoscopeIcon className="h-4 w-4" />} href="/admin/doctors" hint="Credential verification queue" />}
        {providers !== undefined && <StatCard label="Providers awaiting review" value={providers} icon={<BuildingIcon className="h-4 w-4" />} href="/admin/providers" hint="Clinic and hospital onboarding" />}
        {reviews !== undefined && <StatCard label="Reviews to moderate" value={reviews} icon={<StarIcon className="h-4 w-4" />} href="/admin/reviews" hint="Published only after approval" />}
        {tickets && <StatCard label="Open support tickets" value={tickets.nextCursor ? "25+" : tickets.items.length} icon={<MessageIcon className="h-4 w-4" />} href="/admin/support" hint={`${urgent.length} urgent`} />}
        {users?.pagination && <StatCard label="Accounts" value={users.pagination.total.toLocaleString("en-IN")} icon={<IdCardIcon className="h-4 w-4" />} href="/admin/users" hint="Patients, doctors and staff" />}
        {health && <StatCard label="Pending events" value={health.pending} icon={<ActivityIcon className="h-4 w-4" />} href="/admin/operations" hint={health.oldestPendingAgeSeconds > 300 ? `Oldest waiting ${Math.round(health.oldestPendingAgeSeconds / 60)} min` : "Processing normally"} />}
      </section>

      {tickets && tickets.items.length > 0 && (
        <Card>
          <CardHeader title="Latest support tickets" action={<Link href="/admin/support" className="text-sm font-semibold text-brand-700 hover:underline">All tickets</Link>} />
          <ul className="divide-y divide-slate-100">
            {tickets.items.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.subject}</p>
                  <p className="text-xs text-slate-500">{humanize(t.category)} · due {dateTimeLabel(t.dueAt)}</p>
                </div>
                <span className="text-xs font-medium text-slate-500">{humanize(t.status)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {permissions.length > 0 && [doctors, providers, reviews, tickets, users, health].every((v) => v === undefined) && (
        <Alert tone="info">Your role doesn&apos;t include any review queues. Use the menu to open the sections you can access.</Alert>
      )}
    </>
  );
}
