export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  doctor: string;
  speciality: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  start: string;
  end: string;
  mode: "video" | "clinic";
  location?: string;
  status: AppointmentStatus;
  avatarColor: string;
  accent: string;
};
