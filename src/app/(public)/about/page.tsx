import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { stats } from "@/features/home/data";

export const metadata = {
  title: "About Us – DocDuniya",
  description:
    "DocDuniya makes it simple to find and consult trusted doctors across India. Meet our team, our vision and the cities we serve.",
};

const values = [
  { icon: "🤝", title: "Trust first", desc: "Every doctor is verified against medical council records before they can accept bookings." },
  { icon: "🌏", title: "Care for all of India", desc: "From metros to smaller towns, in Hindi, English and regional languages." },
  { icon: "🔍", title: "Radical transparency", desc: "Real fees, real reviews and real availability, shown upfront." },
  { icon: "🔒", title: "Privacy by design", desc: "Health records are encrypted and only shared with your consent." },
];

const team = [
  {
    name: "Prince",
    role: "Founder & CEO",
    bio: "Started DocDuniya to make finding a trusted doctor as easy as booking a cab. Leads product vision and strategy.",
    color: "bg-brand-600",
  },
  {
    name: "Dinesh",
    role: "Co-Founder & COO",
    bio: "Builds our network of doctors and hospitals across India and keeps day-to-day operations running smoothly.",
    color: "bg-emerald-600",
  },
  {
    name: "Ananya Sharma",
    role: "Head of Technology",
    bio: "Leads the engineering team building a fast, secure and reliable platform for patients and doctors.",
    color: "bg-indigo-600",
  },
  {
    name: "Dr. Rahul Verma",
    role: "Chief Medical Advisor",
    bio: "Ensures clinical quality and guides our doctor verification and care standards.",
    color: "bg-rose-600",
  },
  {
    name: "Neha Gupta",
    role: "Head of Design",
    bio: "Designs simple, accessible experiences that work for every patient, in every language.",
    color: "bg-amber-600",
  },
  {
    name: "Arjun Mehta",
    role: "Head of Partnerships",
    bio: "Partners with hospitals, clinics and diagnostic labs to bring more care options to our users.",
    color: "bg-sky-600",
  },
];

const regions = [
  { region: "North India", cities: ["Delhi NCR", "Jaipur", "Lucknow", "Chandigarh", "Kanpur", "Dehradun"] },
  { region: "West India", cities: ["Mumbai", "Pune", "Ahmedabad", "Surat", "Nagpur", "Indore"] },
  { region: "South India", cities: ["Bengaluru", "Hyderabad", "Chennai", "Kochi", "Coimbatore", "Visakhapatnam"] },
  { region: "East & Central India", cities: ["Kolkata", "Patna", "Bhubaneswar", "Guwahati", "Bhopal", "Ranchi"] },
];

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Healthcare that's easy to reach"
        sub="DocDuniya connects patients with verified doctors for in-clinic visits and video consultations, so good care is never far away."
      />

      {/* About the company */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Who we are</p>
          <h2 className="mt-2 text-3xl font-bold">About DocDuniya</h2>
          <div className="mt-4 space-y-4 text-slate-600">
            <p>
              DocDuniya is an Indian healthcare platform that brings patients, doctors and hospitals
              together in one place. Finding the right doctor often means long queues, unclear fees
              and a lot of guesswork. We started DocDuniya to change that.
            </p>
            <p>
              Today, patients use DocDuniya to compare specialists, book appointments in under a
              minute, consult over video and keep their prescriptions and reports in one place.
              Doctors use it to manage their schedule, grow their practice and reach patients beyond
              their city.
            </p>
            <p>
              Every doctor on our platform is verified, every fee is shown upfront, and every
              patient&apos;s data is kept private and secure.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-3xl font-bold text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & vision */}
      <section className="bg-brand-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <span className="text-3xl">🎯</span>
            <h2 className="mt-4 text-2xl font-bold">Our mission</h2>
            <p className="mt-3 text-slate-600">
              To make quality healthcare simple, affordable and accessible for every Indian, by
              connecting people with the right doctor at the right time, online or in person.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <span className="text-3xl">🔭</span>
            <h2 className="mt-4 text-2xl font-bold">Our vision</h2>
            <p className="mt-3 text-slate-600">
              An India where no one has to delay care because a good doctor is too far, too hard to
              find or too costly to reach. We aim to be the most trusted healthcare companion for a
              billion people, from the biggest metros to the smallest towns.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">What we stand for</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our team</p>
            <h2 className="mt-2 text-3xl font-bold">The people behind DocDuniya</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              A small team of builders, doctors and designers working to make healthcare easier for everyone.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${m.color}`}
                  aria-hidden="true"
                >
                  {initials(m.name)}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{m.name}</h3>
                <p className="text-sm font-medium text-brand-600">{m.role}</p>
                <p className="mt-3 text-sm text-slate-600">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas covered */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Areas we cover</p>
            <h2 className="mt-2 text-3xl font-bold">Serving patients across India</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              DocDuniya is live in 120+ cities, including every major metro. Video consultations are
              available anywhere in India.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((r) => (
              <div key={r.region} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">📍 {r.region}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {r.cities.map((c) => (
                    <li key={c} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to find your doctor?</h2>
        <p className="mt-3 text-slate-600">Browse verified specialists and book in under a minute.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/doctors" className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            Find a doctor
          </Link>
          <Link href="/contact" className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
