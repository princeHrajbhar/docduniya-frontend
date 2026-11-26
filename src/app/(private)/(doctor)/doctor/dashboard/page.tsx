import Link from "next/link";
import { Suspense } from "react";
import { CalendarIcon, CheckIcon, ShieldCheckIcon, UsersIcon, BuildingIcon } from "@/components/ui/icons";
import { Alert, Badge, ButtonLink, Card, CardHeader, PageHeader, Skeleton, StatCard, cx } from "@/components/ui/primitives";
import { DoctorAppointmentList } from "@/features/doctor/components/DoctorAppointmentList";
import { dateLabel, isoDateInIndia } from "@/lib/format";
import { doctorAppointments, doctorContext, doctorWorkspace } from "@/services/doctor";

export const metadata = { title: "Doctor overview – DocDuniya" };

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<Skeleton className="h-16 w-80" />}>
        <Header />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <Overview />
      </Suspense>
    </div>
  );
}

async function Header() {
  const { session } = await doctorContext();
  return (
    <PageHeader
      eyebrow={dateLabel(new Date(), { weekday: "long", month: "long", year: undefined })}
      title={`Welcome, ${session.name}`}
      description="Your day at a glance."
      actions={<ButtonLink href="/doctor/appointments" variant="secondary"><CalendarIcon className="h-4 w-4" /> Full schedule</ButtonLink>}
    />
  );
}

const VERIFICATION_LABEL = {
  UNVERIFIED: { label: "Not verified", tone: "neutral" },
  IN_REVIEW: { label: "Under review", tone: "info" },
  VERIFIED: { label: "Verified", tone: "success" },
  SUSPENDED: { label: "Suspended", tone: "danger" },
} as const;

async function Overview() {
  const { doctorId } = await doctorContext();
  const w = await doctorWorkspace();
  const today = isoDateInIndia();
  const { appointments } = await doctorAppointments(doctorId, w.memberships, { date: today });
  const active = appointments.filter((a) => !["CANCELLED", "EXPIRED"].includes(a.status));
  const v = VERIFICATION_LABEL[w.doctor.verificationStatus];
  const activeAffiliation = w.affiliations.some((a) => a.status === "ACTIVE");
  const pendingInvites = w.affiliations.filter((a) => a.status === "PENDING").length + w.memberships.filter((m) => m.status === "INVITED").length;

  const steps = [
    { done: true, title: "Create your profile", href: "/doctor/profile" },
    { done: w.qualifications.length > 0, title: "Add your degrees", href: "/doctor/profile#qualifications" },
    { done: w.registrations.length > 0, title: "Add your council registration", href: "/doctor/profile#registrations" },
    { done: w.doctor.verificationStatus !== "UNVERIFIED", title: w.doctor.verificationStatus === "IN_REVIEW" ? "Verification under review" : "Submit for verification", href: "/doctor/profile#verification" },
    { done: activeAffiliation, title: "Join a clinic or hospital", href: "/doctor/practice" },
    { done: w.doctor.profilePublished, title: "Publish your profile", href: "/doctor/profile#verification" },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <>
      {w.doctor.verificationStatus === "SUSPENDED" && (
        <Alert tone="danger" title="Your profile is suspended">You can&apos;t take new bookings or sign records. Contact DocDuniya support for details.</Alert>
      )}
      {pendingInvites > 0 && (
        <Alert tone="info" title={`You have ${pendingInvites} pending clinic invitation${pendingInvites > 1 ? "s" : ""}`} action={<ButtonLink href="/doctor/practice" size="sm" variant="secondary">Review</ButtonLink>} />
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's appointments" value={active.length} icon={<CalendarIcon className="h-4 w-4" />} href="/doctor/appointments" hint={`${active.filter((a) => a.status === "COMPLETED").length} completed`} />
        <StatCard label="Waiting to be seen" value={active.filter((a) => a.status === "CHECKED_IN").length} icon={<UsersIcon className="h-4 w-4" />} hint="Checked in at the front desk" />
        <StatCard label="Verification" value={<Badge tone={v.tone} className="text-sm">{v.label}</Badge>} icon={<ShieldCheckIcon className="h-4 w-4" />} href="/doctor/profile" hint={w.doctor.verifiedUntil ? `Valid until ${dateLabel(w.doctor.verifiedUntil)}` : "Required before patients can book"} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Today</h2>
          <DoctorAppointmentList appointments={active} empty={activeAffiliation ? "No appointments today" : "Join a clinic to start receiving bookings"} />
        </section>

        {completed < steps.length && (
          <Card className="h-fit">
            <CardHeader title="Get ready for patients" description={`${completed} of ${steps.length} steps done`} />
            <div className="px-6 pt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(completed / steps.length) * 100}%` }} />
              </div>
            </div>
            <ol className="space-y-1 p-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <Link href={s.href} className={cx("flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition hover:bg-slate-50", s.done ? "text-slate-500" : "font-medium text-slate-900")}>
                    <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold", s.done ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-500")}>
                      {s.done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={s.done ? "line-through decoration-slate-300" : ""}>{s.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        )}
        {completed === steps.length && (
          <Card className="h-fit p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><BuildingIcon className="h-5 w-5" /></span>
            <p className="mt-3 font-semibold">You&apos;re live on DocDuniya</p>
            <p className="mt-1 text-sm text-slate-500">Patients can find and book you in the public directory.</p>
            <ButtonLink href="/doctors" variant="secondary" size="sm" className="mt-4">View directory</ButtonLink>
          </Card>
        )}
      </div>
    </>
  );
}
