import type { Appointment } from "@/types/appointment";

// Dummy appointments. Replace with API data later.

export const upcomingAppointments: Appointment[] = [
  {
    id: "a1",
    doctor: "Dr. Ananya Sharma",
    speciality: "Cardiologist",
    date: "2026-11-24",
    start: "10:00 AM",
    end: "10:30 AM",
    mode: "video",
    status: "confirmed",
    avatarColor: "bg-rose-100 text-rose-700",
    accent: "border-l-blue-600",
  },
  {
    id: "a2",
    doctor: "Dr. Vikram Singh",
    speciality: "Neurologist",
    date: "2026-11-26",
    start: "11:30 AM",
    end: "12:00 PM",
    mode: "clinic",
    location: "NeuroLife Centre, Mumbai",
    status: "confirmed",
    avatarColor: "bg-indigo-100 text-indigo-700",
    accent: "border-l-emerald-600",
  },
  {
    id: "a3",
    doctor: "Dr. Mohammed Ali",
    speciality: "Dentist",
    date: "2026-12-02",
    start: "4:00 PM",
    end: "4:30 PM",
    mode: "video",
    status: "pending",
    avatarColor: "bg-emerald-100 text-emerald-700",
    accent: "border-l-amber-500",
  },
];

export const pastAppointments: Appointment[] = [
  {
    id: "p1",
    doctor: "Dr. Priya Menon",
    speciality: "Dermatologist",
    date: "2026-10-28",
    start: "3:00 PM",
    end: "3:30 PM",
    mode: "clinic",
    location: "SkinCare Clinic, Bengaluru",
    status: "completed",
    avatarColor: "bg-fuchsia-100 text-fuchsia-700",
    accent: "border-l-slate-400",
  },
  {
    id: "p2",
    doctor: "Dr. Arjun Mehta",
    speciality: "Pediatrician",
    date: "2026-10-12",
    start: "9:30 AM",
    end: "10:00 AM",
    mode: "video",
    status: "completed",
    avatarColor: "bg-sky-100 text-sky-700",
    accent: "border-l-slate-400",
  },
];
