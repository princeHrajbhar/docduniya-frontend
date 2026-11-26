import { Suspense } from "react";
import { UsersIcon } from "@/components/ui/icons";
import { Avatar, Badge, Card, CardHeader, EmptyState, ListSkeleton, PageHeader } from "@/components/ui/primitives";
import { api } from "@/lib/api/server";
import type { Page, PatientRegistration } from "@/lib/api/types";
import { friendlyMessage } from "@/lib/api/errors";
import { doctorContext, doctorWorkspace, organizationNames } from "@/services/doctor";

export const metadata = { title: "Patients – DocDuniya" };

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Patients registered at the clinics you work with. Clinical records open only for patients in your care." />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <Patients />
      </Suspense>
    </div>
  );
}

async function Patients() {
  await doctorContext();
  const { memberships } = await doctorWorkspace();
  const orgIds = [...new Set(memberships.filter((m) => m.status === "ACTIVE").map((m) => m.organizationId))];
  if (orgIds.length === 0) {
    return (
      <EmptyState icon={<UsersIcon className="h-6 w-6" />} title="No clinics yet">
        Patients appear here once you join a clinic.
      </EmptyState>
    );
  }
  const names = await organizationNames(orgIds);
  const lists = await Promise.all(
    orgIds.map((orgId) =>
      api<Page<PatientRegistration>>(`/organizations/${orgId}/patient-registrations`, { query: { limit: 50 } }).then(
        (p) => ({ orgId, items: p.items, error: undefined }),
        (error: unknown) => ({ orgId, items: [] as PatientRegistration[], error: friendlyMessage(error) }),
      ),
    ),
  );

  return (
    <div className="space-y-6">
      {lists.map(({ orgId, items, error }) => (
        <Card key={orgId}>
          <CardHeader title={names.get(orgId) ?? "Clinic"} description={error ? undefined : `${items.length} registered patient${items.length === 1 ? "" : "s"}`} />
          {error ? (
            <p className="px-6 py-5 text-sm text-slate-500">Your role at this clinic doesn&apos;t include the patient register.</p>
          ) : items.length === 0 ? (
            <p className="px-6 py-5 text-sm text-slate-500">No patients registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((r) => (
                <li key={r.id} className="flex items-center gap-4 px-6 py-3.5">
                  <Avatar name={r.demographicSnapshot?.name?.display} seed={r.patientId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.demographicSnapshot?.name?.display ?? "Patient"}</p>
                    <p className="font-mono text-xs text-slate-500">{r.mrn}</p>
                  </div>
                  <Badge tone={r.status === "ACTIVE" ? "success" : "neutral"}>{r.status === "ACTIVE" ? "Active" : r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
