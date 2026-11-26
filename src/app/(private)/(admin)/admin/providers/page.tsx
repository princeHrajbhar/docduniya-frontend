import { Suspense } from "react";
import { BuildingIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Card, EmptyState, ListSkeleton, LoadError, PageHeader } from "@/components/ui/primitives";
import { decideProviderVerification } from "@/features/admin/actions";
import { NoAccess } from "@/features/admin/NoAccess";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { Page } from "@/lib/api/types";
import { dateTimeLabel } from "@/lib/format";
import { adminContext } from "@/services/admin";
import { organizationNames } from "@/services/doctor";

export const metadata = { title: "Provider reviews – DocDuniya admin" };

type ProviderCase = { id: string; organizationId: string; declaration: string; evidenceReferences: string[]; createdAt: string; version: number };

export default function ProviderReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Provider reviews" description="Clinics and hospitals asking to go live. Verify their registration and licences against the evidence before approving." />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Queue />
      </Suspense>
    </div>
  );
}

const decision = (c: ProviderCase, d: "APPROVED" | "REJECTED" | "CHANGES_REQUIRED") => decideProviderVerification.bind(null, c.id, c.version, d);

async function Queue() {
  const { allowed } = await adminContext("providers.verify");
  if (!allowed) return <NoAccess permission="providers.verify" />;
  let page: Page<ProviderCase>;
  try {
    page = await api<Page<ProviderCase>>("/platform/provider-verifications", { query: { limit: 50 } });
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  if (page.items.length === 0) {
    return (
      <EmptyState icon={<BuildingIcon className="h-6 w-6" />} title="No providers waiting">
        New provider submissions will appear here.
      </EmptyState>
    );
  }
  const names = await organizationNames(page.items.map((c) => c.organizationId));

  return (
    <div className="space-y-4">
      {page.items.map((c) => (
        <Card key={c.id} className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">{names.get(c.organizationId) ?? `Organisation ${c.organizationId.slice(-6)}`}</h2>
          <p className="text-sm text-slate-500">Submitted {dateTimeLabel(c.createdAt)}</p>
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 italic">&ldquo;{c.declaration}&rdquo;</p>
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Evidence references</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {c.evidenceReferences.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <ActionButton
              action={decision(c, "APPROVED")}
              variant="primary"
              confirm={{ title: "Approve this provider?", description: "They'll be able to list doctors and take bookings.", confirmLabel: "Approve", reason: { label: "Reviewer note (shared with the provider)", minLength: 20 } }}
            >
              Approve
            </ActionButton>
            <ActionButton action={decision(c, "CHANGES_REQUIRED")} confirm={{ title: "Request changes", confirmLabel: "Send request", reason: { label: "What needs to change?", minLength: 20 } }}>
              Request changes
            </ActionButton>
            <ActionButton action={decision(c, "REJECTED")} variant="ghost" confirm={{ title: "Reject this provider?", confirmLabel: "Reject", tone: "danger", reason: { label: "Reason", minLength: 20 } }}>
              Reject
            </ActionButton>
          </div>
        </Card>
      ))}
    </div>
  );
}
