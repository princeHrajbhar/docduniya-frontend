import { Suspense } from "react";
import { BuildingIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Alert, Badge, Card, CardHeader, EmptyState, ListSkeleton, PageHeader, type Tone } from "@/components/ui/primitives";
import { acceptMembership, endAffiliation, respondToAffiliation } from "@/features/doctor/actions";
import { dateLabel, humanize } from "@/lib/format";
import { doctorContext, doctorWorkspace, organizationNames } from "@/services/doctor";

export const metadata = { title: "Clinics & invitations – DocDuniya" };

const AFFILIATION: Record<string, Tone> = { PENDING: "warning", ACTIVE: "success", SUSPENDED: "danger", ENDED: "neutral", REJECTED: "neutral" };

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinics & invitations"
        description="Clinics invite you in two steps: first to their team, then to list you at a location. Accept both to receive bookings there."
      />
      <Suspense fallback={<ListSkeleton rows={4} />}>
        <Practice />
      </Suspense>
    </div>
  );
}

async function Practice() {
  await doctorContext();
  const w = await doctorWorkspace();
  const names = await organizationNames([...w.memberships.map((m) => m.organizationId), ...w.affiliations.map((a) => a.organizationId)]);
  const invites = w.memberships.filter((m) => m.status === "INVITED");
  const pending = w.affiliations.filter((a) => a.status === "PENDING");
  const current = w.affiliations.filter((a) => a.status !== "PENDING");
  const nameOf = (id: string) => names.get(id) ?? "A clinic";

  if (w.memberships.length === 0 && w.affiliations.length === 0) {
    return (
      <EmptyState icon={<BuildingIcon className="h-6 w-6" />} title="No clinics yet">
        Ask your clinic or hospital administrator to invite you using your DocDuniya email. Invitations appear here.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      {w.doctor.verificationStatus !== "VERIFIED" && pending.length > 0 && (
        <Alert tone="info">You can accept listings now; they go live once your verification is approved.</Alert>
      )}

      {(invites.length > 0 || pending.length > 0) && (
        <Card>
          <CardHeader title="Waiting for you" description="Invitations expire after seven days." />
          <ul className="divide-y divide-slate-100">
            {invites.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">Join {nameOf(m.organizationId)}&apos;s team</p>
                  <p className="text-xs text-slate-500">
                    {m.facilityScope === "ALL" ? "All locations" : `${m.facilityIds.length} location${m.facilityIds.length === 1 ? "" : "s"}`}
                    {m.invitationExpiresAt && ` · expires ${dateLabel(m.invitationExpiresAt)}`}
                  </p>
                </div>
                <ActionButton action={acceptMembership.bind(null, m.id, m.version)} variant="primary">Accept</ActionButton>
              </li>
            ))}
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {a.title}, {a.department}
                  </p>
                  <p className="text-xs text-slate-500">
                    Listing at {nameOf(a.organizationId)}
                    {a.invitationExpiresAt && ` · expires ${dateLabel(a.invitationExpiresAt)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ActionButton action={respondToAffiliation.bind(null, a.id, a.version, "ACCEPT")} variant="primary">Accept</ActionButton>
                  <ActionButton action={respondToAffiliation.bind(null, a.id, a.version, "REJECT")} variant="ghost" confirm={{ title: "Decline this listing?", confirmLabel: "Decline", tone: "danger" }}>
                    Decline
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader title="Your clinics" />
        {current.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-500">Accepted listings will show here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {current.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <BuildingIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{nameOf(a.organizationId)}</p>
                  <p className="text-xs text-slate-500">
                    {a.title} · {a.department}
                  </p>
                </div>
                <Badge tone={AFFILIATION[a.status] ?? "neutral"}>{humanize(a.status)}</Badge>
                {(a.status === "ACTIVE" || a.status === "SUSPENDED") && (
                  <ActionButton
                    action={endAffiliation.bind(null, a.id, a.version)}
                    variant="ghost"
                    confirm={{
                      title: `Leave ${nameOf(a.organizationId)}?`,
                      description: "Patients will no longer be able to book you at this clinic.",
                      confirmLabel: "End listing",
                      tone: "danger",
                      reason: { label: "Reason", minLength: 5 },
                    }}
                  >
                    End
                  </ActionButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
