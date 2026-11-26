import type { Tone } from "@/components/ui/primitives";
import type { AppointmentStatus, PaymentPolicy } from "@/lib/api/types";

export function appointmentStatus(status: AppointmentStatus, paymentPolicy?: PaymentPolicy): { label: string; tone: Tone } {
  switch (status) {
    case "HELD":
      return paymentPolicy === "PREPAY" ? { label: "Payment pending", tone: "warning" } : { label: "Awaiting confirmation", tone: "warning" };
    case "CONFIRMED":
      return { label: "Confirmed", tone: "success" };
    case "CHECKED_IN":
      return { label: "Checked in", tone: "info" };
    case "IN_PROGRESS":
      return { label: "In consultation", tone: "info" };
    case "COMPLETED":
      return { label: "Completed", tone: "neutral" };
    case "CANCELLED":
      return { label: "Cancelled", tone: "danger" };
    case "EXPIRED":
      return { label: "Hold expired", tone: "neutral" };
    case "NO_SHOW":
      return { label: "Missed", tone: "danger" };
    case "DISCONTINUED":
      return { label: "Discontinued", tone: "neutral" };
    default:
      return { label: status, tone: "neutral" };
  }
}
