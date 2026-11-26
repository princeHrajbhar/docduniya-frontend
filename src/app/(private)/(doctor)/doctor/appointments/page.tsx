import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { Alert, ListSkeleton, PageHeader, buttonClass, cx } from "@/components/ui/primitives";
import { DoctorAppointmentList } from "@/features/doctor/components/DoctorAppointmentList";
import { TimeOffButton } from "@/features/doctor/components/TimeOffForm";
import { dateLabel, isoDateInIndia } from "@/lib/format";
import { doctorAppointments, doctorContext, doctorWorkspace } from "@/services/doctor";

export const metadata = { title: "Appointments – DocDuniya" };

export default function DoctorAppointmentsPage({ searchParams }: PageProps<"/doctor/appointments">) {
  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Your bookings at every clinic you consult at, in India Standard Time." actions={<TimeOffButton />} />
      <Suspense fallback={<ListSkeleton rows={5} />}>
        <Schedule searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const shift = (iso: string, days: number) => isoDateInIndia(new Date(new Date(`${iso}T12:00:00+05:30`).getTime() + days * 86_400_000));

async function Schedule({ searchParams }: { searchParams: PageProps<"/doctor/appointments">["searchParams"] }) {
  const { date: raw } = await searchParams;
  const { doctorId } = await doctorContext();
  const today = isoDateInIndia();
  const date = typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today;
  const { memberships } = await doctorWorkspace();
  const { appointments, orgIds } = await doctorAppointments(doctorId, memberships, { date });
  const week = Array.from({ length: 7 }, (_, i) => shift(date, i - 3));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/doctor/appointments?date=${shift(date, -7)}`} className={buttonClass("secondary", "sm")} aria-label="Previous week">
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {week.map((d) => {
            const at = new Date(`${d}T12:00:00+05:30`);
            return (
              <Link
                key={d}
                href={`/doctor/appointments?date=${d}`}
                aria-current={d === date ? "date" : undefined}
                className={cx(
                  "flex min-w-16 flex-1 flex-col items-center rounded-xl border px-2 py-2 text-center transition",
                  d === date ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white hover:border-brand-300",
                )}
              >
                <span className={cx("text-[11px] font-medium uppercase", d === date ? "text-brand-100" : "text-slate-400")}>{d === today ? "Today" : at.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" })}</span>
                <span className="text-lg font-bold">{at.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" })}</span>
              </Link>
            );
          })}
        </div>
        <Link href={`/doctor/appointments?date=${shift(date, 7)}`} className={buttonClass("secondary", "sm")} aria-label="Next week">
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {orgIds.length === 0 ? (
        <Alert tone="info" title="You're not part of a clinic yet" action={<Link href="/doctor/practice" className={buttonClass("secondary", "sm")}>Clinics & invitations</Link>}>
          Bookings appear here once a clinic adds you and you accept its invitation.
        </Alert>
      ) : (
        <>
          <h2 className="text-base font-semibold text-slate-900">{dateLabel(`${date}T12:00:00+05:30`, { weekday: "long" })}</h2>
          <DoctorAppointmentList appointments={appointments} empty="No appointments on this day" />
        </>
      )}
    </div>
  );
}
