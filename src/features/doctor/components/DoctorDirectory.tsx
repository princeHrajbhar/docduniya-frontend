"use client";

import { useDeferredValue, useState } from "react";
import { SearchIcon, StethoscopeIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/primitives";
import { cityOf, type DoctorEntry } from "../listing";
import { DoctorCard } from "./DoctorCard";

/** Instant text filtering over the doctors already loaded for the chosen speciality. */
export function DoctorDirectory({ doctors, initialQuery = "" }: { doctors: DoctorEntry[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());

  const results = doctors.filter((d) => {
    if (onlineOnly && !d.modes.some((m) => m !== "IN_PERSON")) return false;
    if (!q) return true;
    const haystack = [
      d.publicName,
      ...d.specialties.map((s) => s.name),
      ...d.locations.flatMap((l) => [l.facility.name, l.organization.name, cityOf(l) ?? "", l.department]),
      ...d.languages,
    ]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor, clinic, city or language"
            aria-label="Search doctors"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pr-4 pl-12 text-sm shadow-xs outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <label className="flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs">
          <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Online consultations
        </label>
      </div>

      <p className="mt-5 text-sm text-slate-500" aria-live="polite">
        {results.length} {results.length === 1 ? "doctor" : "doctors"}
        {q && ` matching “${query.trim()}”`}
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => (
            <DoctorCard key={d.doctorId} doctor={d} />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-4" icon={<StethoscopeIcon className="h-6 w-6" />} title="No doctors match your search">
          Try a different name, city or speciality{onlineOnly ? ", or include in-clinic visits" : ""}.
        </EmptyState>
      )}
    </div>
  );
}
