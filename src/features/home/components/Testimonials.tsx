"use client";

import { useState } from "react";
import { doctorTestimonials, patientTestimonials, type Testimonial } from "@/features/home/data";
import { initials } from "@/lib/utils";

export function Testimonials() {
  // Moving content needs a way to stop it (WCAG 2.2.2); hover alone doesn't help keyboard or touch users.
  const [paused, setPaused] = useState(false);

  return (
    <section id="testimonials" className="overflow-hidden bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Loved by Patients &amp; Doctors</h2>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 motion-reduce:hidden"
          >
            {paused ? "▶ Play" : "❚❚ Pause"}
          </button>
        </div>
      </div>

      {/* Fades the cards out at both edges. Users who prefer reduced motion get a strip they can scroll sideways instead. */}
      <div className="marquee-track relative mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <ul data-paused={paused || undefined} className="marquee flex w-max">
          {/* Two copies of the list make the loop seamless; screen readers only hear the first one. */}
          {[0, 1].map((copy) =>
            testimonials.map(({ t, tone }) => (
              <li
                key={`${copy}-${t.name}`}
                aria-hidden={copy === 1 || undefined}
                className={`w-80 shrink-0 pr-6 sm:w-96 ${copy === 1 ? "motion-reduce:hidden" : ""}`}
              >
                <Card t={t} tone={tone} />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}

type Tone = "patient" | "doctor";

/** Patient and doctor testimonials, alternating. */
const testimonials: { t: Testimonial; tone: Tone }[] = Array.from(
  { length: Math.max(patientTestimonials.length, doctorTestimonials.length) },
  (_, i) => [
    patientTestimonials[i] && { t: patientTestimonials[i], tone: "patient" as const },
    doctorTestimonials[i] && { t: doctorTestimonials[i], tone: "doctor" as const },
  ],
)
  .flat()
  .filter((x) => !!x);

function Card({ t, tone }: { t: Testimonial; tone: Tone }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
        {"★".repeat(t.rating)}
        <span className="text-slate-200">{"★".repeat(5 - t.rating)}</span>
      </div>
      <blockquote className="mt-4 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-full font-semibold ${
            tone === "doctor" ? "bg-accent-100 text-accent-700" : "bg-brand-100 text-brand-700"
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
  );
}
