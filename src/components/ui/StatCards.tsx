export type Stat = { label: string; value: string };

export function StatCards({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">{s.label}</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
