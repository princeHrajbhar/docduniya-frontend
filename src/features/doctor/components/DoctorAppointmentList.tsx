import { BuildingIcon, CalendarIcon, VideoIcon } from "@/components/ui/icons";
import { ActionButton } from "@/components/ui/interactive";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { appointmentStatus } from "@/features/appointment/status";
import { dateLabel, modeLabel, timeLabel } from "@/lib/format";
import type { DoctorAppointment } from "@/services/doctor";
import { transitionAppointment } from "../actions";

/** The doctor's run sheet: one row per visit, with the next step in the visit flow. */
export function DoctorAppointmentList({ appointments, showDate, empty }: { appointments: DoctorAppointment[]; showDate?: boolean; empty: string }) {
  if (appointments.length === 0) return <EmptyState icon={<CalendarIcon className="h-6 w-6" />} title={empty} />;
  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {appointments.map((a) => {
        const s = appointmentStatus(a.status, a.paymentPolicy);
        const act = (action: "start" | "complete") => transitionAppointment.bind(null, a.organizationId, a.id, action, a.version);
        return (
          <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="w-20 shrink-0 text-center">
              <p className="text-sm font-bold text-slate-900 tabular-nums">{timeLabel(a.startAt)}</p>
              <p className="text-xs text-slate-500">{showDate ? dateLabel(a.startAt, { year: undefined }) : `${a.offering.durationMinutes} min`}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                {a.offering.name}
                {a.requiresReassignment && <Badge tone="warning">Needs reassignment</Badge>}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                {a.offering.mode === "IN_PERSON" ? <BuildingIcon className="h-3.5 w-3.5" /> : <VideoIcon className="h-3.5 w-3.5" />}
                {modeLabel(a.offering.mode)}
                {a.organizationName && ` · ${a.organizationName}`}
                {a.bookingNumber && ` · ${a.bookingNumber}`}
              </p>
              {a.reasonForVisit && <p className="mt-1 line-clamp-1 text-sm text-slate-600">“{a.reasonForVisit}”</p>}
            </div>
            <Badge tone={s.tone} dot>
              {s.label}
            </Badge>
            <div className="flex gap-2">
              {/* Check-in and no-show are front-desk actions (appointments.manage), not clinician ones. */}
              {a.status === "CONFIRMED" && <span className="text-xs text-slate-500">Awaiting front-desk check-in</span>}
              {a.status === "CHECKED_IN" && (
                <ActionButton action={act("start")} variant="primary">
                  Start consultation
                </ActionButton>
              )}
              {a.status === "IN_PROGRESS" && (
                <ActionButton action={act("complete")} variant="primary">
                  Complete
                </ActionButton>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
