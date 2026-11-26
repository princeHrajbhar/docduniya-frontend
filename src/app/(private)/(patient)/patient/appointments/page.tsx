import { Suspense } from "react";
import { CalendarIcon, PlusIcon } from "@/components/ui/icons";
import { ButtonLink, EmptyState, ListSkeleton, LoadError, PageHeader, TabLinks } from "@/components/ui/primitives";
import { AppointmentCard } from "@/features/appointment/components/AppointmentCard";
import { friendlyMessage } from "@/lib/api/errors";
import { listPatientAppointments, patientContext, splitAppointments } from "@/services/patient";

export const metadata = { title: "Appointments – DocDuniya" };

export default function AppointmentsPage({ searchParams }: PageProps<"/patient/appointments">) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Confirm, pay for, or cancel your bookings. Times are in India Standard Time."
        actions={
          <ButtonLink href="/doctors">
            <PlusIcon className="h-4 w-4" /> Book new
          </ButtonLink>
        }
      />
      <Suspense fallback={<ListSkeleton />}>
        <Appointments searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Appointments({ searchParams }: { searchParams: PageProps<"/patient/appointments">["searchParams"] }) {
  const { tab } = await searchParams;
  const { patientId } = await patientContext();
  let all;
  try {
    all = await listPatientAppointments(patientId);
  } catch (error) {
    return <LoadError message={friendlyMessage(error)} />;
  }
  const { upcoming, past } = splitAppointments(all);
  const active = tab === "past" ? "past" : "upcoming";
  const list = active === "past" ? past : upcoming;

  return (
    <div className="space-y-5">
      <TabLinks
        active={active}
        tabs={[
          { key: "upcoming", label: "Upcoming", href: "/patient/appointments", count: upcoming.length },
          { key: "past", label: "Past", href: "/patient/appointments?tab=past", count: past.length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title={active === "past" ? "No past appointments" : "Nothing scheduled"}
          action={active === "upcoming" ? <ButtonLink href="/doctors">Find a doctor</ButtonLink> : undefined}
        >
          {active === "past" ? "Completed and cancelled visits will be listed here." : "When you book a doctor, your visit appears here."}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
