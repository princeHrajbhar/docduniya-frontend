import { StatCards } from "@/components/ui/StatCards";

export const metadata = { title: "Doctor Dashboard – DocDuniya" };

const stats = [
  { label: "Today's Appointments", value: "12" },
  { label: "Video Consults", value: "5" },
  { label: "Pending Reports", value: "3" },
  { label: "Avg. Rating", value: "4.8 ★" },
];

export default function DoctorDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of your practice today (sample data).</p>
      <StatCards stats={stats} className="mt-8" />
    </div>
  );
}
