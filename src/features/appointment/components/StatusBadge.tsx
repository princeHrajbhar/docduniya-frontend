import type { AppointmentStatus } from "@/types/appointment";

const styles: Record<AppointmentStatus, string> = {
  confirmed: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-brand-50 text-brand-700",
  cancelled: "bg-rose-50 text-rose-700",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
