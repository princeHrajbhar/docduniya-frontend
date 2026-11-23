import Link from "next/link";
import { initials } from "@/lib/utils";
import type { Doctor } from "@/types/doctor";

export function DoctorCard({ doctor: d }: { doctor: Doctor }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-xl">
      <span className={`grid h-20 w-20 place-items-center rounded-2xl text-2xl font-bold ${d.color}`}>
        {initials(d.name)}
      </span>
      <h3 className="mt-4 text-lg font-semibold">
        {/* The stretched link makes the whole card clickable. */}
        <Link href={`/doctors/${d.slug}`} className="after:absolute after:inset-0 group-hover:text-brand-700">
          {d.name}
        </Link>
      </h3>
      <p className="text-sm font-medium text-brand-600">{d.speciality}</p>
      <p className="mt-1 text-sm text-slate-500">
        {d.hospital}, {d.city}
      </p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-600">{d.exp} yrs exp</span>
        <span className="font-semibold text-amber-500">★ {d.rating}</span>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="font-semibold">₹{d.fee}</span>
        <span className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
          View profile
        </span>
      </div>
    </article>
  );
}
