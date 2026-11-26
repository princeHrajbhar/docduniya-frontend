import Link from "next/link";
import { Suspense } from "react";
import { StethoscopeIcon } from "@/components/ui/icons";
import { Avatar, Badge, Card, CardHeader, DescriptionList, EmptyState, ListSkeleton, LoadError, PageHeader, Skeleton, cx } from "@/components/ui/primitives";
import { DoctorDecisionForm } from "@/features/admin/DoctorDecisionForm";
import { NoAccess } from "@/features/admin/NoAccess";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { DoctorVerificationDetail, Page, VerificationCase } from "@/lib/api/types";
import { dateLabel, humanize, isoDateInIndia, relativeTime } from "@/lib/format";
import { adminContext } from "@/services/admin";
import { getSpecialties } from "@/services/catalog";

export const metadata = { title: "Doctor reviews – DocDuniya admin" };

type Props = PageProps<"/admin/doctors">;

export default function DoctorReviewsPage({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Doctor reviews" description="Check each applicant against the council register and issuing institutions before approving. You can't review colleagues at your own providers." />
      <Suspense fallback={<ListSkeleton rows={5} />}>
        <Queue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Queue({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { allowed } = await adminContext("doctors.verify");
  if (!allowed) return <NoAccess permission="doctors.verify" />;
  const { review } = await searchParams;
  let queue: Page<VerificationCase>;
  try {
    queue = await api<Page<VerificationCase>>("/platform/doctor-verifications", { query: { limit: 50 } });
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const selected = typeof review === "string" ? review : queue.items[0]?.id;

  if (queue.items.length === 0) {
    return (
      <EmptyState icon={<StethoscopeIcon className="h-6 w-6" />} title="Queue is clear">
        New doctor submissions will appear here.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit overflow-hidden">
        <CardHeader title={`${queue.items.length}${queue.nextCursor ? "+" : ""} waiting`} description="Oldest first is fairest" />
        <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
          {[...queue.items].reverse().map((c) => (
            <li key={c.id}>
              <Link href={`/admin/doctors?review=${c.id}`} scroll={false} className={cx("block px-5 py-3.5 transition hover:bg-slate-50", c.id === selected && "bg-brand-50/70")}>
                <p className="text-sm font-medium text-slate-900">Case {c.id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-slate-500">Submitted {relativeTime(c.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      {selected && (
        <Suspense key={selected} fallback={<Skeleton className="h-[36rem] rounded-2xl" />}>
          <ReviewDetail id={selected} />
        </Suspense>
      )}
    </div>
  );
}

/** The backend allows at most a year ahead, and never past the registration's expiry. */
function latestReviewDate(registrationExpiresOn?: string) {
  const yearOut = isoDateInIndia(new Date(Date.now() + 365 * 86_400_000));
  return registrationExpiresOn && registrationExpiresOn < yearOut ? registrationExpiresOn : yearOut;
}

async function ReviewDetail({ id }: { id: string }) {
  let c: DoctorVerificationDetail;
  try {
    c = await api<DoctorVerificationDetail>(`/platform/doctor-verifications/${id}`);
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const specialties = new Map((await getSpecialties()).map((s) => [s.id, s.name]));
  const reg = c.registrationSnapshot;
  const maxUntil = latestReviewDate(reg.expiresOn);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar name={c.profileSnapshot.publicName} seed={c.doctorId} size="lg" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{c.identitySnapshot.name.display}</h2>
            <p className="text-sm text-slate-500">
              Public name: {c.profileSnapshot.publicName}
              {c.identitySnapshot.birthDate && ` · Born ${dateLabel(c.identitySnapshot.birthDate)}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.profileSnapshot.specialtyIds.map((sid) => (
                <Badge key={sid} tone="brand">{specialties.get(sid) ?? "Speciality"}</Badge>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm whitespace-pre-line text-slate-700">{c.profileSnapshot.bio}</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Council registration" />
          <div className="px-6 py-2">
            <DescriptionList
              items={[
                ["Council", humanize(reg.authority)],
                ["Number", <span key="n" className="font-mono">{reg.registrationNumberNormalized}</span>],
                ["Jurisdiction", humanize(reg.jurisdiction)],
                ["Issued", dateLabel(reg.issuedOn)],
                ["Expires", reg.expiresOn ? dateLabel(reg.expiresOn) : "No expiry given"],
                ["Evidence", reg.evidenceReference],
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Qualifications" />
          <ul className="divide-y divide-slate-100">
            {c.qualificationSnapshots.map((q, i) => (
              <li key={i} className="px-6 py-3 text-sm">
                <p className="font-semibold text-slate-900">
                  {q.qualificationName} <span className="font-normal text-slate-500">({humanize(q.kind)})</span>
                </p>
                <p className="text-slate-600">
                  {q.institutionName}
                  {q.awardYear && ` · ${q.awardYear}`}
                </p>
                <p className="text-xs text-slate-500">Evidence: {q.evidenceReference}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Declaration" />
        <p className="px-6 py-4 text-sm text-slate-700 italic">“{c.declaration}”</p>
      </Card>

      <Card>
        <CardHeader title="Decision" description="Decisions are audited and can't be edited afterwards." />
        <div className="p-6">
          <DoctorDecisionForm reviewId={c.id} version={c.version} maxUntil={maxUntil} />
        </div>
      </Card>
    </div>
  );
}
