import {
  howItWorks,
  initials,
  stats,
  topDoctors,
  treatmentCategories,
  whyChooseUs,
} from "@/lib/data";

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-slate-600">{sub}</p>}
    </div>
  );
}

/* 1. Hero banner */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm">
            🇮🇳 Trusted by 5 lakh+ patients across India
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Your health, <br />
            <span className="text-emerald-200">our priority.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-teal-50/90">
            Find and book India&apos;s top verified doctors for in-clinic visits or video
            consultations, all in one place.
          </p>

          <form action="#doctors" className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
            <input
              name="city"
              placeholder="📍 City"
              className="rounded-xl px-4 py-3 text-slate-900 outline-none sm:w-36 sm:border-r sm:border-slate-200"
            />
            <input
              name="q"
              placeholder="Search doctors, specialities, symptoms…"
              className="flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none"
            />
            <button className="rounded-xl bg-teal-600 px-6 py-3 font-semibold hover:bg-teal-700">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {["Fever", "Back pain", "Skin rash", "Diabetes", "Anxiety"].map((s) => (
              <span key={s} className="rounded-full border border-white/30 px-3 py-1 text-teal-50">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-100 text-xl font-bold text-rose-700">
                AS
              </span>
              <div>
                <p className="font-semibold">Dr. Ananya Sharma</p>
                <p className="text-sm text-slate-500">Cardiologist · 18 yrs exp</p>
                <p className="text-sm text-amber-500">★★★★★ 4.9</p>
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-500">Available today</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["10:00 AM", "11:30 AM", "2:00 PM", "4:15 PM", "5:30 PM", "7:00 PM"].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-lg border py-2 text-center text-sm ${
                    i === 2 ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
            <button className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white">
              Book Appointment
            </button>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-5 py-4 text-slate-900 shadow-xl">
            <p className="text-2xl font-bold text-teal-600">60 sec</p>
            <p className="text-xs text-slate-500">Average booking time</p>
          </div>
        </div>
      </div>
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
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-2xl transition group-hover:bg-teal-100">
              {c.icon}
            </span>
            <h3 className="mt-4 font-semibold">{c.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
            <p className="mt-2 text-xs font-medium text-teal-600">{c.doctors}+ doctors</p>
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
              Talk to a doctor <span className="text-emerald-300">in 10 minutes</span>
            </h2>
            <p className="mt-4 text-slate-300">
              Skip the queue. Get a video consultation with a verified doctor from the comfort
              of your home, starting at just ₹199.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#doctors"
                className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-300"
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
                <p className="text-3xl font-extrabold text-emerald-300">{s.value}</p>
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
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-xl">{w.icon}</span>
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
    <section id="how-it-works" className="bg-teal-50/60 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Simple Process" title="How We Work" sub="Getting care takes just four easy steps." />
        <div className="relative mt-14 grid gap-10 md:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-0.5 bg-teal-200 md:block" />
          {howItWorks.map((s) => (
            <div key={s.step} className="relative text-center">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-600 text-2xl font-bold text-white ring-8 ring-teal-50">
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
        {topDoctors.map((d) => (
          <article key={d.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-xl">
            <span className={`grid h-20 w-20 place-items-center rounded-2xl text-2xl font-bold ${d.color}`}>
              {initials(d.name)}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{d.name}</h3>
            <p className="text-sm font-medium text-teal-600">{d.speciality}</p>
            <p className="mt-1 text-sm text-slate-500">{d.hospital}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">{d.exp} yrs exp</span>
              <span className="font-semibold text-amber-500">★ {d.rating}</span>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
              <span className="font-semibold">₹{d.fee}</span>
              <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                Book
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 py-10 text-center text-sm text-slate-400">
      © 2026 DocDuniya. All rights reserved.
    </footer>
  );
}
