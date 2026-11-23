import Link from "next/link";
import { DoctorCard } from "@/features/doctor/components/DoctorCard";
import { doctors } from "@/features/doctor/data";
import { PatientLeadForm } from "@/features/leads/components/PatientLeadForm";
import {
  howItWorks,
  stats,
  treatmentCategories,
  whyChooseUs,
} from "@/features/home/data";

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-slate-600">{sub}</p>}
    </div>
  );
}

/* 1. Hero banner */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-stretch lg:gap-16 lg:py-24">
        <div className="flex flex-col justify-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm">
              🇮🇳 Trusted by 5 lakh+ patients across India
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Your health, <br />
              <span className="text-accent-200">our priority.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-brand-50/90">
              Find and book India&apos;s top verified doctors for in-clinic visits or video
              consultations, all in one place.
            </p>

            <form action="#doctors" className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
              <input
                name="q"
                placeholder="Search doctors, specialities, symptoms…"
                className="flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none"
              />
              <button className="rounded-xl bg-brand-600 px-6 py-3 font-semibold hover:bg-brand-700">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {["Fever", "Back pain", "Skin rash", "Diabetes", "Anxiety"].map((s) => (
                <span key={s} className="rounded-full border border-white/30 px-3 py-1 text-brand-50">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div id="callback" className="w-full max-w-xl lg:ml-auto">
          <PatientLeadForm />
        </div>
      </div>
    </section>
  );
}

/* 1b. Thin stats strip under the hero */
const heroStats = [
  { icon: "🩺", value: "10,000+", label: "Verified doctors" },
  { icon: "😊", value: "5 Lakh+", label: "Happy patients" },
  { icon: "📍", value: "120+", label: "Cities covered" },
  { icon: "⏱️", value: "60 sec", label: "Avg. booking time" },
];

export function StatsStrip() {
  return (
    <section aria-label="DocDuniya in numbers" className="border-b border-accent-100 bg-accent-50">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-6 py-5 lg:grid-cols-4 lg:divide-x lg:divide-accent-200">
        {heroStats.map((s) => (
          <li key={s.label} className="flex items-center justify-center gap-3">
            <span className="text-2xl" aria-hidden="true">{s.icon}</span>
            <p>
              <span className="block text-xl font-bold text-accent-700 sm:text-2xl">{s.value}</span>
              <span className="block text-xs font-medium text-slate-600 sm:text-sm">{s.label}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 2. Categories of treatments */
export function TreatmentCategories() {
  return (
    <section id="treatments" className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Specialities"
        title="Browse by Treatment"
        sub="Consult experienced specialists across 30+ fields of medicine."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {treatmentCategories.map((c) => (
          <a
            key={c.name}
            href="#doctors"
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl transition group-hover:bg-brand-100">
              {c.icon}
            </span>
            <h3 className="mt-4 font-semibold">{c.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
            <p className="mt-2 text-xs font-medium text-brand-600">{c.doctors}+ doctors</p>
          </a>
        ))}
      </div>
    </section>
  );
}

/* 3. CTA + stats */
export function CtaStats() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="overflow-hidden rounded-3xl bg-slate-900 text-white">
        <div className="grid items-center gap-10 p-10 lg:grid-cols-2 lg:p-14">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Talk to a doctor <span className="text-accent-300">in 10 minutes</span>
            </h2>
            <p className="mt-4 text-slate-300">
              Skip the queue. Get a video consultation with a verified doctor from the comfort
              of your home, starting at just ₹199.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#doctors"
                className="rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white hover:bg-accent-700"
              >
                Consult Now
              </a>
              <a
                href="#treatments"
                className="rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Book Clinic Visit
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-3xl font-extrabold text-accent-300">{s.value}</p>
                <p className="mt-1 text-sm text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* 4. Why choose us */
export function WhyChooseUs() {
  return (
    <section id="why-us" className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Why DocDuniya"
        title="Why Choose Us"
        sub="Healthcare that's simple, affordable and built around you."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((w) => (
          <div key={w.title} className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-lg">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-xl">{w.icon}</span>
            <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
            <p className="mt-2 text-slate-600">{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 5. How we work */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-50/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Simple Process" title="How We Work" sub="Getting care takes just four easy steps." />
        <div className="relative mt-14 grid gap-10 md:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-0.5 bg-brand-200 md:block" />
          {howItWorks.map((s) => (
            <div key={s.step} className="relative text-center">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white ring-8 ring-brand-50">
                {s.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 6. India's top doctors */
export function TopDoctors() {
  return (
    <section id="doctors" className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeading
        eyebrow="Meet the Experts"
        title="India's Top Doctors"
        sub="Highly rated specialists from leading hospitals across the country."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((d) => (
          <DoctorCard key={d.slug} doctor={d} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/doctors"
          className="inline-block rounded-xl border border-brand-600 px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
        >
          View all doctors →
        </Link>
      </div>
    </section>
  );
}
