import Link from "next/link";
import { BuildingIcon, CalendarIcon, ClockIcon, VideoIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Avatar, Badge, ButtonLink, cx } from "@/components/ui/primitives";
import { cancelAppointment, confirmAppointment } from "@/features/booking/actions";
import { dateLabel, modeLabel, money, timeLabel } from "@/lib/format";
import type { AppointmentView } from "@/services/patient";
import { appointmentStatus } from "../status";

const CANCELLABLE = new Set(["HELD", "CONFIRMED"]);

export function AppointmentCard({ appointment: a, compact }: { appointment: AppointmentView; compact?: boolean }) {
  const status = appointmentStatus(a.status, a.paymentPolicy);
  const doctor = a.details?.doctor.name ?? "Your doctor";
  const facility = a.details?.facility.name;
  const online = a.offering.mode !== "IN_PERSON";
  const needsPayment = a.status === "HELD" && a.paymentPolicy === "PREPAY";
  const needsConfirm = a.status === "HELD" && a.paymentPolicy !== "PREPAY";

  return (
    <article className={cx("relative flex flex-col rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md", needsPayment || needsConfirm ? "border-amber-200" : "border-slate-200/80")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={doctor} seed={a.doctorId} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              <Link href={`/patient/appointments/${a.id}`} className="hover:text-brand-700">
                {doctor}
              </Link>
            </p>
            <p className="truncate text-sm text-slate-500">{a.offering.name}</p>
          </div>
        </div>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>

      <dl className={cx("grid gap-3 text-sm", compact ? "mt-4" : "mt-5 sm:grid-cols-2")}>
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Date</dt>
          <dd className="font-medium text-slate-800">{dateLabel(a.startAt, { weekday: "short" })}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <ClockIcon className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Time</dt>
          <dd className="font-medium text-slate-800">
            {timeLabel(a.startAt)} – {timeLabel(a.endAt)}
          </dd>
        </div>
        <div className="flex items-center gap-2.5 sm:col-span-2">
          {online ? <VideoIcon className="h-4 w-4 text-slate-400" /> : <BuildingIcon className="h-4 w-4 text-slate-400" />}
          <dt className="sr-only">Where</dt>
          <dd className="truncate text-slate-600">
            {modeLabel(a.offering.mode)}
            {facility && ` · ${facility}`}
          </dd>
        </div>
      </dl>

      {!compact && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="mr-auto text-sm font-semibold text-slate-900">{money(a.price.totalMinor, a.price.currency)}</span>
          {needsPayment && (
            <ButtonLink href={`/patient/appointments/${a.id}?checkout=1`} size="sm">
              Pay now
            </ButtonLink>
          )}
          {needsConfirm && (
            <ActionButton action={confirmAppointment.bind(null, a.id, a.version)} variant="primary">
              Confirm
            </ActionButton>
          )}
          {CANCELLABLE.has(a.status) && (
            <ActionButton
              action={cancelAppointment.bind(null, a.id, a.version)}
              variant="ghost"
              confirm={{
                title: "Cancel this appointment?",
                description: `${doctor}, ${dateLabel(a.startAt, { weekday: "short" })} at ${timeLabel(a.startAt)}. Any refund follows the clinic's cancellation policy.`,
                confirmLabel: "Cancel appointment",
                tone: "danger",
                reason: { label: "Reason for cancelling", placeholder: "E.g. I'm feeling better", minLength: 5 },
              }}
            >
              Cancel
            </ActionButton>
          )}
          <ButtonLink href={`/patient/appointments/${a.id}`} variant="secondary" size="sm">
            Details
          </ButtonLink>
        </div>
      )}
    </article>
  );
}
