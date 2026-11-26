import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuildingIcon, CalendarIcon, ClockIcon, VideoIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Alert, Avatar, Badge, ButtonLink, Card, CardHeader, DescriptionList, LoadError, Skeleton } from "@/components/ui/primitives";
import { appointmentStatus } from "@/features/appointment/status";
import { cancelAppointment, confirmAppointment } from "@/features/booking/actions";
import { Checkout } from "@/features/booking/Checkout";
import { HoldCountdown } from "@/features/booking/HoldCountdown";
import { ReviewForm } from "@/features/booking/ReviewForm";
import { friendlyMessage, isNotFound } from "@/lib/api/errors";
import { api } from "@/lib/api/server";
import type { Appointment } from "@/lib/api/types";
import { dateLabel, humanize, modeLabel, money, paymentLabel, timeLabel } from "@/lib/format";
import { getOffering } from "@/services/catalog";
import { patientContext } from "@/services/patient";

export const metadata = { title: "Appointment – DocDuniya" };

type Props = PageProps<"/patient/appointments/[appointmentId]">;

export default function AppointmentPage(props: Props) {
  return (
    <div className="space-y-6">
      <Link href="/patient/appointments" className="text-sm font-medium text-slate-500 hover:text-slate-900">
        ← All appointments
      </Link>
      <Suspense fallback={<Skeleton className="h-[30rem] rounded-2xl" />}>
        <Detail {...props} />
      </Suspense>
    </div>
  );
}

async function Detail({ params, searchParams }: Props) {
  const [{ appointmentId }, sp, { session }] = await Promise.all([params, searchParams, patientContext()]);
  if (!/^[a-f0-9]{24}$/i.test(appointmentId)) notFound();

  let a: Appointment;
  try {
    a = await api<Appointment>(`/appointments/${appointmentId}`);
  } catch (error) {
    if (isNotFound(error)) notFound();
    return <LoadError message={friendlyMessage(error)} />;
  }
  const details = await getOffering(a.offeringId);
  const status = appointmentStatus(a.status, a.paymentPolicy);
  const doctor = details?.doctor.name ?? "Your doctor";
  const held = a.status === "HELD";
  const prepay = a.paymentPolicy === "PREPAY";
  const online = a.offering.mode !== "IN_PERSON";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {sp.booked && <Alert tone="success" title="You're booked!">We&apos;ve sent a confirmation to {session.email}.</Alert>}
        {sp.paid && a.status === "CONFIRMED" && <Alert tone="success" title="Payment received">Your appointment is confirmed. A receipt is on its way to {session.email}.</Alert>}
        {sp.paid && held && <Alert tone="info" title="Confirming your payment">This usually takes under a minute. Refresh shortly.</Alert>}
        {sp.confirm && held && !prepay && <Alert tone="warning" title="Almost done">Your slot is reserved. Confirm it below to complete the booking.</Alert>}
        {a.requiresReassignment && (
          <Alert tone="warning" title="The clinic needs to reschedule">Your doctor is unavailable at this time. The clinic will contact you to arrange another doctor or time.</Alert>
        )}
        {a.refundRequired && <Alert tone="info" title="Refund in progress">A refund has been initiated for this booking.</Alert>}

        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={doctor} seed={a.doctorId} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{doctor}</h1>
                <p className="text-sm text-slate-500">{a.offering.name}</p>
              </div>
            </div>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: CalendarIcon, label: "Date", value: dateLabel(a.startAt, { weekday: "long" }) },
              { Icon: ClockIcon, label: "Time", value: `${timeLabel(a.startAt)} – ${timeLabel(a.endAt)}` },
              { Icon: online ? VideoIcon : BuildingIcon, label: modeLabel(a.offering.mode), value: details?.facility.name ?? "Clinic" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <Icon className="h-5 w-5 text-brand-600" />
                <p className="mt-2 text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          {online && a.status === "CONFIRMED" && (
            <p className="mt-4 text-sm text-slate-500">The clinic will share how to join the online consultation before your appointment.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Booking details" />
          <div className="px-6 py-2">
            <DescriptionList
              items={[
                ["Booking number", a.bookingNumber ?? "—"],
                ["Provider", details?.organization.name],
                ["Duration", `${a.offering.durationMinutes} minutes`],
                ["Reason for visit", a.reasonForVisit],
                ["Payment", paymentLabel(a.paymentPolicy)],
                ...(a.reason ? ([["Note", a.reason]] as Array<[string, string]>) : []),
              ]}
            />
          </div>
        </Card>

        {a.status === "COMPLETED" && (
          <Card>
            <CardHeader title="How was your visit?" description="Your review helps other patients. It's published as “Verified patient”, never with your name." />
            <div className="p-6">
              <ReviewForm appointmentId={a.id} />
            </div>
          </Card>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-6">
          <h2 className="font-semibold text-slate-900">Payment summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Consultation fee</dt>
              <dd className="tabular-nums">{money(a.price.amountMinor, a.price.currency)}</dd>
            </div>
            {a.price.taxMinor > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Taxes</dt>
                <dd className="tabular-nums">{money(a.price.taxMinor, a.price.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(a.price.totalMinor, a.price.currency)}</dd>
            </div>
          </dl>

          {held && a.holdExpiresAt && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Slot held for <HoldCountdown expiresAt={a.holdExpiresAt} />
            </p>
          )}

          <div className="mt-5 space-y-2">
            {held && prepay && (
              <Checkout
                appointmentId={a.id}
                amountMinor={a.price.totalMinor}
                currency={a.price.currency}
                description={`${a.offering.name} with ${doctor}`}
                email={session.email}
                autoStart={Boolean(sp.checkout)}
              />
            )}
            {held && !prepay && (
              <ActionButton action={confirmAppointment.bind(null, a.id, a.version)} variant="primary" size="lg" className="w-full">
                Confirm booking
              </ActionButton>
            )}
            {(held || a.status === "CONFIRMED") && (
              <ActionButton
                action={cancelAppointment.bind(null, a.id, a.version)}
                variant="ghost"
                size="md"
                className="w-full"
                confirm={{
                  title: "Cancel this appointment?",
                  description: prepay && !held ? "Any refund follows the cancellation policy agreed at booking." : undefined,
                  confirmLabel: "Cancel appointment",
                  tone: "danger",
                  reason: { label: "Reason for cancelling", minLength: 5 },
                }}
              >
                Cancel appointment
              </ActionButton>
            )}
            {["COMPLETED", "CANCELLED", "EXPIRED", "NO_SHOW"].includes(a.status) && details && (
              <ButtonLink href="/doctors" variant="secondary" className="w-full">
                Book again
              </ButtonLink>
            )}
          </div>
        </Card>
        <p className="px-2 text-xs text-slate-500">
          Status: {humanize(a.status)}. Need help with this booking?{" "}
          <Link href={`/patient/support?appointment=${a.id}`} className="font-medium text-brand-700 hover:underline">
            Contact support
          </Link>
        </p>
      </aside>
    </div>
  );
}
