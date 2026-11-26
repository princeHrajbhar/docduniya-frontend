import { Suspense } from "react";
import { ActionButton } from "@/components/ui/interactive";
import { ListSkeleton, LoadError, PageHeader } from "@/components/ui/primitives";
import { replyToTicket } from "@/features/support/actions";
import { TicketForm } from "@/features/support/TicketForm";
import { TicketList } from "@/features/support/TicketList";
import { api, attempt } from "@/lib/api/server";
import type { Page, SupportTicket } from "@/lib/api/types";
import { patientContext } from "@/services/patient";

export const metadata = { title: "Help & support – DocDuniya" };

export default function SupportPage({ searchParams }: PageProps<"/patient/support">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Help & support" description="Questions about a booking, payment or your data? We're here to help." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Suspense fallback={<ListSkeleton rows={2} />}>
          <NewTicket searchParams={searchParams} />
        </Suspense>
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">Your requests</h2>
          <Suspense fallback={<ListSkeleton rows={3} />}>
            <Tickets />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function NewTicket({ searchParams }: { searchParams: PageProps<"/patient/support">["searchParams"] }) {
  const { appointment } = await searchParams;
  return <TicketForm appointmentId={typeof appointment === "string" ? appointment : undefined} />;
}

async function Tickets() {
  await patientContext();
  const page = await attempt(api<Page<SupportTicket>>("/me/support-tickets", { query: { limit: 25 } }));
  if (!page.ok) return <LoadError message={page.error} />;
  return (
    <TicketList
      tickets={page.data.items}
      empty="You haven't contacted support yet."
      actions={(t) =>
        t.status !== "CLOSED" && (
          <ActionButton
            action={replyToTicket.bind(null, t.id, t.version)}
            confirm={{ title: "Reply to support", confirmLabel: "Send reply", reason: { label: "Your message", minLength: 1 } }}
          >
            Reply
          </ActionButton>
        )
      }
    />
  );
}
