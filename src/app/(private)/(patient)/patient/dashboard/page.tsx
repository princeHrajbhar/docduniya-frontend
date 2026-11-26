import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, CalendarIcon, ClipboardIcon, FileTextIcon, PillIcon, PlusIcon, SearchIcon } from "@/components/ui/icons";
import { Alert, ButtonLink, Card, CardHeader, EmptyState, LoadError, PageHeader, Skeleton, StatCard } from "@/components/ui/primitives";
import { AppointmentCard } from "@/features/appointment/components/AppointmentCard";
import { friendlyMessage } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { DiagnosticReport, PatientRecords } from "@/lib/api/types";
import { dateLabel, dateTimeLabel, relativeTime } from "@/lib/format";
import { listPatientAppointments, patientContext, splitAppointments } from "@/services/patient";

export const metadata = { title: "Overview – DocDuniya" };

export default function PatientDashboard() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<HeaderSkeleton />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<BodySkeleton />}>
        <Overview />
      </Suspense>
    </div>
  );
}

async function Greeting() {
  const { session } = await patientContext();
  const hour = Number(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <PageHeader
      eyebrow={dateLabel(new Date(), { weekday: "long", month: "long", year: undefined })}
      title={`${part}, ${session.name.split(" ")[0]}`}
      description="Here's what's coming up with your health."
      actions={
        <ButtonLink href="/doctors">
          <PlusIcon className="h-4 w-4" /> Book appointment
        </ButtonLink>
      }
    />
  );
}

async function Overview() {
  const { patientId } = await patientContext();
  const [appointments, records, reports] = await Promise.allSettled([
    listPatientAppointments(patientId),
    api<PatientRecords>(`/patients/${patientId}/clinical-records`),
    api<DiagnosticReport[]>(`/patients/${patientId}/diagnostic-reports`),
  ]);

  if (appointments.status === "rejected") return <LoadError message={friendlyMessage(appointments.reason)} />;
  const { upcoming, past } = splitAppointments(appointments.value);
  const next = upcoming[0];
  const pending = upcoming.filter((a) => a.status === "HELD");
  const rx = records.status === "fulfilled" ? records.value.prescriptions : [];
  const activeRx = rx.filter((p) => !p.validUntil || new Date(p.validUntil) > new Date());
  const reportList = reports.status === "fulfilled" ? reports.value : [];

  return (
    <>
      {pending.length > 0 && (
        <Alert
          tone="warning"
          title={pending.length === 1 ? "One booking needs your attention" : `${pending.length} bookings need your attention`}
          action={<ButtonLink href="/patient/appointments" size="sm" variant="secondary">Review</ButtonLink>}
        >
          Slots are only held for a short time. Confirm or pay to keep them.
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming visits" value={upcoming.length} icon={<CalendarIcon className="h-4 w-4" />} href="/patient/appointments" hint={next ? `Next ${relativeTime(next.startAt)}` : "Nothing scheduled"} />
        <StatCard label="Active prescriptions" value={activeRx.length} icon={<PillIcon className="h-4 w-4" />} href="/patient/prescriptions" hint={`${rx.length} in total`} />
        <StatCard label="Lab reports" value={reportList.length} icon={<FileTextIcon className="h-4 w-4" />} href="/patient/records?tab=reports" hint={reportList[0] ? `Latest ${dateLabel(reportList[0].issuedAt)}` : "None yet"} />
        <StatCard label="Past visits" value={past.filter((a) => a.status === "COMPLETED").length} icon={<ClipboardIcon className="h-4 w-4" />} href="/patient/records?tab=visits" hint="Completed consultations" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Upcoming appointments</h2>
            {upcoming.length > 0 && (
              <Link href="/patient/appointments" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                View all <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="h-6 w-6" />}
              title="No upcoming appointments"
              action={
                <ButtonLink href="/doctors">
                  <SearchIcon className="h-4 w-4" /> Find a doctor
                </ButtonLink>
              }
            >
              Book a verified doctor for an in-clinic or online consultation.
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {upcoming.slice(0, 3).map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
            </div>
          )}
        </section>

        <section>
          <Card>
            <CardHeader title="Recent prescriptions" action={<Link href="/patient/prescriptions" className="text-sm font-semibold text-brand-700 hover:underline">All</Link>} />
            {records.status === "rejected" ? (
              <p className="px-6 py-8 text-sm text-slate-500">{friendlyMessage(records.reason)}</p>
            ) : rx.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">Prescriptions your doctors sign will appear here.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rx.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-6 py-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <PillIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{p.items.map((i) => i.medication.name).join(", ") || "Prescription"}</p>
                      <p className="text-xs text-slate-500">
                        {p.prescriberSnapshot?.name ?? "Your doctor"} · {dateTimeLabel(p.issuedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-56" />
    </div>
  );
}

function BodySkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
