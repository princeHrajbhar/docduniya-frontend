import { Suspense } from "react";
import { GraduationIcon, IdCardIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Alert, Badge, ButtonLink, Card, CardHeader, ListSkeleton, PageHeader, type Tone } from "@/components/ui/primitives";
import { setPublished, withdrawVerification } from "@/features/doctor/actions";
import { AddQualificationButton, AddRegistrationButton, DoctorProfileForm, SubmitVerificationButton } from "@/features/doctor/components/CredentialForms";
import { dateLabel, doctorHref, humanize } from "@/lib/format";
import { doctorContext, doctorWorkspace } from "@/services/doctor";
import { getSpecialties } from "@/services/catalog";

export const metadata = { title: "Profile & verification – DocDuniya" };

const CRED: Record<string, Tone> = { VERIFIED: "success", DECLARED: "neutral", SUSPENDED: "danger", EXPIRED: "warning", REJECTED: "danger" };
const CASE: Record<string, Tone> = { SUBMITTED: "info", APPROVED: "success", REJECTED: "danger", CHANGES_REQUIRED: "warning", WITHDRAWN: "neutral" };

export default function DoctorProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile & verification" description="Patients only see verified doctors. Complete each section, then submit for review." />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <Workspace />
      </Suspense>
    </div>
  );
}

async function Workspace() {
  await doctorContext();
  const [w, specialties] = await Promise.all([doctorWorkspace(), getSpecialties()]);
  const d = w.doctor;
  const status = d.verificationStatus;
  const latestCase = w.verifications[0];
  const canPublish = status === "VERIFIED" && w.affiliations.some((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <Card id="verification" className="scroll-mt-24">
        <CardHeader
          title={<span className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-brand-600" />Verification</span>}
          action={<Badge tone={status === "VERIFIED" ? "success" : status === "IN_REVIEW" ? "info" : status === "SUSPENDED" ? "danger" : "neutral"}>{humanize(status)}</Badge>}
        />
        <div className="space-y-4 p-6">
          {status === "UNVERIFIED" && (
            <>
              {latestCase && ["REJECTED", "CHANGES_REQUIRED"].includes(latestCase.status) && (
                <Alert tone="warning" title={latestCase.status === "REJECTED" ? "Your last submission wasn't approved" : "The reviewer asked for changes"}>
                  {latestCase.reason}
                </Alert>
              )}
              <p className="text-sm text-slate-600">Submit your council registration and degrees. Reviews usually take 2–3 working days.</p>
              <div className="flex flex-wrap items-center gap-3">
                <SubmitVerificationButton registrations={w.registrations.filter((r) => r.status !== "REJECTED")} qualifications={w.qualifications.filter((q) => q.status !== "REJECTED")} />
              </div>
            </>
          )}
          {status === "IN_REVIEW" && (
            <Alert tone="info" title="Under review">Submitted {dateLabel(latestCase?.createdAt)}. We&apos;ll email you when there&apos;s a decision.</Alert>
          )}
          {status === "VERIFIED" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Verified until <strong className="text-slate-900">{dateLabel(d.verifiedUntil)}</strong>.{" "}
                {d.profilePublished ? "Your profile is live in the public directory." : "Publish your profile so patients can find you."}
              </p>
              <div className="flex flex-wrap gap-2">
                {d.profilePublished ? (
                  <>
                    <ButtonLink href={doctorHref(d.slug, d.id)} variant="secondary">View public profile</ButtonLink>
                    <ActionButton action={setPublished.bind(null, d.version, false)} variant="ghost" size="md">Hide from directory</ActionButton>
                  </>
                ) : canPublish ? (
                  <ActionButton action={setPublished.bind(null, d.version, true)} variant="primary" size="md">Publish profile</ActionButton>
                ) : (
                  <Alert tone="info">Accept a clinic invitation first. Patients book you at a clinic, so publishing needs an active affiliation.</Alert>
                )}
              </div>
            </div>
          )}
          {status === "SUSPENDED" && <Alert tone="danger" title="Suspended">Your profile has been suspended by DocDuniya. Contact support for details.</Alert>}
          {(status === "IN_REVIEW" || status === "VERIFIED") && (
            <ActionButton
              action={withdrawVerification.bind(null, d.version)}
              variant="ghost"
              confirm={{
                title: "Withdraw verification?",
                description: "Your profile will be hidden and you'll need to submit again after making changes.",
                confirmLabel: "Withdraw",
                tone: "danger",
                reason: { label: "Why are you withdrawing?", minLength: 5 },
              }}
            >
              Withdraw to edit details
            </ActionButton>
          )}
          {w.verifications.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-slate-600">Review history ({w.verifications.length})</summary>
              <ul className="mt-3 space-y-2">
                {w.verifications.map((c) => (
                  <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <span>
                      Submitted {dateLabel(c.createdAt)}
                      {c.reason && <span className="block text-xs text-slate-500">{c.reason}</span>}
                    </span>
                    <Badge tone={CASE[c.status] ?? "neutral"}>{humanize(c.status)}</Badge>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="qualifications" className="scroll-mt-24">
          <CardHeader title={<span className="flex items-center gap-2"><GraduationIcon className="h-4 w-4 text-brand-600" />Degrees & training</span>} action={<AddQualificationButton />} />
          {w.qualifications.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">Add at least your primary medical degree.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {w.qualifications.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-3 px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{q.qualificationName}</p>
                    <p className="text-xs text-slate-500">
                      {q.institutionName}
                      {q.awardYear && ` · ${q.awardYear}`}
                    </p>
                  </div>
                  <Badge tone={CRED[q.status] ?? "neutral"}>{q.status === "DECLARED" ? "Not yet verified" : humanize(q.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card id="registrations" className="scroll-mt-24">
          <CardHeader title={<span className="flex items-center gap-2"><IdCardIcon className="h-4 w-4 text-brand-600" />Council registration</span>} action={<AddRegistrationButton />} />
          {w.registrations.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">Add your registration with the NMC or your state medical council.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {w.registrations.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 px-6 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{humanize(r.authority)}</p>
                    <p className="font-mono text-xs text-slate-500">
                      {r.registrationNumberNormalized} · {humanize(r.jurisdiction)}
                      {r.expiresOn && ` · valid to ${dateLabel(r.expiresOn)}`}
                    </p>
                  </div>
                  <Badge tone={CRED[r.status] ?? "neutral"}>{r.status === "DECLARED" ? "Not yet verified" : humanize(r.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Public profile" description="What patients see in the directory." />
        <DoctorProfileForm doctor={d} specialties={specialties} locked={status !== "UNVERIFIED"} />
      </Card>
    </div>
  );
}
