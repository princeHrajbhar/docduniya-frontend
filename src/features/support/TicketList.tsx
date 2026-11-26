import type { ReactNode } from "react";
import { MessageIcon } from "@/components/ui/icons";
import { Badge, EmptyState, type Tone } from "@/components/ui/primitives";
import type { SupportTicket } from "@/lib/api/types";
import { dateTimeLabel, humanize } from "@/lib/format";

export const TICKET_STATUS: Record<SupportTicket["status"], { label: string; tone: Tone }> = {
  OPEN: { label: "Open", tone: "info" },
  ASSIGNED: { label: "In progress", tone: "brand" },
  WAITING: { label: "Waiting on you", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  CLOSED: { label: "Closed", tone: "neutral" },
};

/** Expandable ticket threads. `actions` renders per-ticket controls (reply, transitions). */
export function TicketList({ tickets, actions, empty = "No support requests yet." }: { tickets: SupportTicket[]; actions?: (t: SupportTicket) => ReactNode; empty?: string }) {
  if (tickets.length === 0) return <EmptyState icon={<MessageIcon className="h-6 w-6" />} title={empty} />;
  return (
    <ul className="space-y-3">
      {tickets.map((t) => {
        const s = TICKET_STATUS[t.status];
        return (
          <li key={t.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{t.subject}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {humanize(t.category)}
                    {t.priority && ` · ${humanize(t.priority)} priority`}
                    {t.dueAt && ` · due ${dateTimeLabel(t.dueAt)}`}
                    {` · ${t.replies.length} repl${t.replies.length === 1 ? "y" : "ies"}`}
                  </p>
                </div>
                <Badge tone={s.tone}>{s.label}</Badge>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                <p className="text-sm whitespace-pre-line text-slate-700">{t.description}</p>
                {t.replies.map((r, i) => (
                  <div key={i} className={`rounded-xl px-4 py-3 text-sm ${r.role === "REQUESTER" ? "bg-slate-50" : "bg-brand-50"}`}>
                    <p className="text-xs font-semibold text-slate-500">
                      {r.role === "REQUESTER" ? "Requester" : "DocDuniya support"} · {dateTimeLabel(r.at)}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-slate-800">{r.body}</p>
                  </div>
                ))}
                {t.resolution && (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <span className="font-semibold">Resolution: </span>
                    {t.resolution}
                  </p>
                )}
                {actions && <div className="flex flex-wrap gap-2 pt-1">{actions(t)}</div>}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
