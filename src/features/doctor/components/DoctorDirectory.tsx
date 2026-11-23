"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import type { Doctor } from "@/types/doctor";
import { DoctorCard } from "./DoctorCard";

/** Searchable, filterable grid of doctors. */
export function DoctorDirectory({ doctors }: { doctors: Doctor[] }) {
  const [query, setQuery] = useState("");
  const [speciality, setSpeciality] = useState("All");

  const specialities = ["All", ...new Set(doctors.map((d) => d.speciality))];
  const q = query.trim().toLowerCase();
  const results = doctors.filter(
    (d) =>
      (speciality === "All" || d.speciality === speciality) &&
      (!q || [d.name, d.speciality, d.city, d.hospital].some((f) => f.toLowerCase().includes(q))),
  );

  return (
    <div>
      <div className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, speciality, city or hospital"
          aria-label="Search doctors"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-12 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div role="group" aria-label="Filter by speciality" className="mt-5 flex flex-wrap gap-2">
        {specialities.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={speciality === s}
            onClick={() => setSpeciality(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              speciality === s
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 text-slate-700 hover:border-brand-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500" aria-live="polite">
        {results.length} {results.length === 1 ? "doctor" : "doctors"} found
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((d) => (
            <DoctorCard key={d.slug} doctor={d} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No doctors match your search. Try a different name or speciality.
        </div>
      )}
    </div>
  );
}
