import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClipboardIcon,
  ClockIcon,
  PillIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { AppointmentCard } from "@/features/appointment/components/AppointmentCard";
import { BookingPanel } from "@/features/patient/components/BookingPanel";
import { upcomingAppointments } from "@/features/appointment/data";
import { formatDate, todayInIndia } from "@/lib/date";

export const metadata = { title: "Dashboard – DocDuniya" };

const quickActions = [
  {
    title: "Book Appointments",
    desc: "Schedule a visit with a healthcare provider",
    cta: "Get started",
    href: "/patient/appointments",
    Icon: CalendarIcon,
    tint: "bg-brand-50 text-brand-700",
  },
  {
    title: "Upcoming Visits",
    desc: `You have ${upcomingAppointments.length} upcoming appointments`,
    cta: "View all",
    href: "/patient/appointments",
    Icon: ClockIcon,
    tint: "bg-accent-50 text-accent-700",
  },
  {
    title: "Medical Records",
    desc: "Access and manage your health documents",
    cta: "View records",
    href: "/patient/records",
    Icon: ClipboardIcon,
    tint: "bg-fuchsia-50 text-fuchsia-700",
  },
  {
    title: "Prescriptions",
    desc: "Manage, track and renew your prescriptions",
    cta: "View prescriptions",
    href: "/patient/prescriptions",
    Icon: PillIcon,
    tint: "bg-amber-50 text-amber-700",
  },
];

export default function PatientDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Suspense fallback={<p className="mt-1 h-5 w-48 animate-pulse rounded bg-slate-100" />}>
            <TodayLabel />
          </Suspense>
        </div>
        <Link
          href="/patient/appointments"
          className="flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-800"
        >
          <PlusIcon className="h-4 w-4" />
          New Appointment
        </Link>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ title, desc, cta, href, Icon, tint }) => (
          <div key={title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-full ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-500">{desc}</p>
            <Link
              href={href}
              className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              {cta}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-slate-100" />}>
        <Schedule />
      </Suspense>
    </div>
  );
}

async function TodayLabel() {
  await connection();
  return (
    <p className="mt-1 text-sm text-slate-500">
      {formatDate(todayInIndia(), { weekday: "long", month: "long" })}
    </p>
  );
}

/** Everything that depends on today's date renders per request. */
async function Schedule() {
  await connection();
  const today = todayInIndia();

  return (
    <>
      <BookingPanel today={today} />
      <section>
        <h2 className="mb-4 text-lg font-semibold">Upcoming Consultations</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {upcomingAppointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} today={today} />
          ))}
        </div>
      </section>
    </>
  );
}
