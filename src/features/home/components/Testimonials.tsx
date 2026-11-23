"use client";

import { useState } from "react";
import { doctorTestimonials, initials, patientTestimonials } from "@/lib/data";

const tabs = [
  { id: "patients", label: "What Patients Say", data: patientTestimonials },
  { id: "doctors", label: "What Doctors Say", data: doctorTestimonials },
] as const;

export function Testimonials() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("patients");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section id="testimonials" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Loved by Patients & Doctors</h2>
        </div>

        <div role="tablist" className="mx-auto mt-8 flex w-fit rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                active === t.id ? "bg-teal-600 text-white shadow" : "text-slate-600 hover:text-teal-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {current.data.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                {"★".repeat(t.rating)}
                <span className="text-slate-200">{"★".repeat(5 - t.rating)}</span>
              </div>
              <blockquote className="mt-4 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full font-semibold ${
                    active === "doctors" ? "bg-sky-100 text-sky-700" : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {initials(t.name)}
                </span>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.meta}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
