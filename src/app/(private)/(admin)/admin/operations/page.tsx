import { Suspense } from "react";
import { ActivityIcon, CheckCircleIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Card, CardHeader, EmptyState, ListSkeleton, LoadError, PageHeader, StatCard } from "@/components/ui/primitives";
import { replayEvent } from "@/features/admin/actions";
import { NoAccess } from "@/features/admin/NoAccess";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { FailedEvent, OutboxHealth, Page } from "@/lib/api/types";
import { dateTimeLabel, humanize } from "@/lib/format";
import { adminContext } from "@/services/admin";

export const metadata = { title: "Operations – DocDuniya admin" };

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Operations" description="Background delivery of notifications, payment follow-ups and other events. Replaying is safe: every consumer is idempotent." />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Health />
      </Suspense>
    </div>
  );
}

async function Health() {
  const { allowed } = await adminContext("operations.manage");
  if (!allowed) return <NoAccess permission="operations.manage" />;
  let health: OutboxHealth;
  let failed: Page<FailedEvent>;
  try {
    [health, failed] = await Promise.all([
      api<OutboxHealth>("/platform/operations/health"),
      api<Page<FailedEvent>>("/platform/outbox/failed", { query: { limit: 50 } }),
    ]);
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const lag = health.oldestPendingAgeSeconds;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending events" value={health.pending} icon={<ActivityIcon className="h-4 w-4" />} hint="Waiting for the worker" />
        <StatCard label="Oldest pending" value={lag < 60 ? `${lag}s` : `${Math.round(lag / 60)} min`} hint={lag > 300 ? "Is the worker running? (npm run worker)" : "Healthy"} />
        <StatCard label="Failed events" value={health.failed} hint="Gave up after 10 attempts" />
      </section>
      <Card>
        <CardHeader title="Failed events" />
        {failed.items.length === 0 ? (
          <EmptyState className="m-6 border-0" icon={<CheckCircleIcon className="h-6 w-6" />} title="No failures">
            Everything has been delivered.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th className="px-6 py-2.5 font-medium">Event</th>
                  <th className="px-6 py-2.5 font-medium">Record</th>
                  <th className="px-6 py-2.5 font-medium">Attempts</th>
                  <th className="px-6 py-2.5 font-medium">Occurred</th>
                  <th className="px-6 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {failed.items.map((e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-3 font-medium text-slate-900">{e.type}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {humanize(e.aggregateType)} <span className="font-mono text-xs text-slate-400">{e.aggregateId.slice(-8)}</span>
                    </td>
                    <td className="px-6 py-3 tabular-nums">{e.attempts}</td>
                    <td className="px-6 py-3 text-slate-600">{dateTimeLabel(e.occurredAt)}</td>
                    <td className="px-6 py-3 text-right">
                      <ActionButton action={replayEvent.bind(null, e.id)}>Replay</ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
