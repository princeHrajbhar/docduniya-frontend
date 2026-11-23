import { StatCards } from "@/components/ui/StatCards";

export const metadata = { title: "Admin Dashboard – DocDuniya" };

const stats = [
  { label: "Active Doctors", value: "1,248" },
  { label: "Registered Patients", value: "38,902" },
  { label: "Appointments Today", value: "864" },
  { label: "Pending Verifications", value: "17" },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Platform overview (sample data).</p>
      <StatCards stats={stats} className="mt-8" />
    </div>
  );
}
