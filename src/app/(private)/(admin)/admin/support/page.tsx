import { Suspense } from "react";
import { ActionButton } from "@/components/ui/interactive";
import { ListSkeleton, LoadError, PageHeader, TabLinks } from "@/components/ui/primitives";
import { transitionTicket } from "@/features/admin/actions";
import { NoAccess } from "@/features/admin/NoAccess";
import { replyToTicket } from "@/features/support/actions";
import { TicketList } from "@/features/support/TicketList";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { Page, SupportTicket } from "@/lib/api/types";
import { adminContext } from "@/services/admin";

export const metadata = { title: "Support tickets – DocDuniya admin" };

const TABS = [
  { key: "active", label: "Active", status: undefined },
  { key: "WAITING", label: "Waiting on user", status: "WAITING" },
  { key: "RESOLVED", label: "Resolved", status: "RESOLVED" },
  { key: "CLOSED", label: "Closed", status: "CLOSED" },
];

type Action = "assign" | "wait" | "resolve" | "close" | "reopen";

export default function SupportQueuePage({ searchParams }: PageProps<"/admin/support">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Support tickets" description="Safety and privacy tickets are prioritised automatically. Linking a patient never grants access to their records." />
      <Suspense fallback={<ListSkeleton rows={5} />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Queue({ searchParams }: { searchParams: PageProps<"/admin/support">["searchParams"] }) {
  const { allowed } = await adminContext("support.manage");
  if (!allowed) return <NoAccess permission="support.manage" />;
  const { status } = await searchParams;
  const tab = TABS.find((t) => t.key === status) ?? TABS[0];
  let page: Page<SupportTicket>;
  try {
    page = await api<Page<SupportTicket>>("/platform/support-tickets", { query: { limit: 50, status: tab.status } });
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const act = (t: SupportTicket, a: Action) => transitionTicket.bind(null, t.id, t.version, a);

  return (
    <div className="space-y-5">
      <TabLinks active={tab.key} tabs={TABS.map((t) => ({ key: t.key, label: t.label, href: t.status ? `/admin/support?status=${t.key}` : "/admin/support" }))} />
      <TicketList
        tickets={page.items}
        empty="No tickets here."
        actions={(t) => (
          <>
            {t.status !== "CLOSED" && (
              <ActionButton action={replyToTicket.bind(null, t.id, t.version)} confirm={{ title: `Reply: ${t.subject}`, confirmLabel: "Send reply", reason: { label: "Message to the requester", minLength: 1 } }}>
                Reply
              </ActionButton>
            )}
            {t.status === "OPEN" && (
              <ActionButton action={act(t, "assign")} variant="primary">
                Assign to me
              </ActionButton>
            )}
            {["OPEN", "ASSIGNED"].includes(t.status) && <ActionButton action={act(t, "wait")}>Waiting on user</ActionButton>}
            {["OPEN", "ASSIGNED", "WAITING"].includes(t.status) && (
              <ActionButton action={act(t, "resolve")} variant="primary" confirm={{ title: "Resolve ticket", confirmLabel: "Resolve", reason: { label: "Resolution (shared with the requester)", minLength: 5 } }}>
                Resolve
              </ActionButton>
            )}
            {t.status === "RESOLVED" && <ActionButton action={act(t, "close")}>Close</ActionButton>}
            {["RESOLVED", "CLOSED"].includes(t.status) && (
              <ActionButton action={act(t, "reopen")} variant="ghost">
                Reopen
              </ActionButton>
            )}
          </>
        )}
      />
    </div>
  );
}
