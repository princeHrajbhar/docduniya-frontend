import { SiteHeader } from "@/components/SiteHeader";

export const metadata = { title: "Doctor Dashboard – DocDuniya" };

const cards = [
  { label: "Today's Appointments", value: "12" },
  { label: "Video Consults", value: "5" },
  { label: "Pending Reports", value: "3" },
  { label: "Avg. Rating", value: "4.8 ★" },
];

export default function DoctorDashboard() {
  return (
    <>
      <SiteHeader home="/doctor" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="mt-1 text-slate-600">Overview of your practice today (sample data).</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-sky-700">{c.value}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
