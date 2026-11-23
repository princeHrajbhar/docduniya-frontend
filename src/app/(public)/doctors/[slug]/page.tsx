import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildingIcon, CalendarIcon, ClockIcon, VideoIcon } from "@/components/ui/icons";
import { DoctorCard } from "@/features/doctor/components/DoctorCard";
import { doctors, getDoctor } from "@/features/doctor/data";
import { initials } from "@/lib/utils";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function generateStaticParams() {
  return doctors.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/doctors/[slug]">) {
  const doctor = getDoctor((await params).slug);
  if (!doctor) return { title: "Doctor not found – DocDuniya" };
  return {
    title: `${doctor.name}, ${doctor.speciality} in ${doctor.city} – DocDuniya`,
    description: `Book an appointment with ${doctor.name}, ${doctor.speciality} at ${doctor.hospital}, ${doctor.city}. ${doctor.exp} years of experience.`,
  };
}

export default async function DoctorPage({ params }: PageProps<"/doctors/[slug]">) {
  const doctor = getDoctor((await params).slug);
  if (!doctor) notFound();
  const d = doctor;

  const related = doctors.filter((x) => x.slug !== d.slug && x.speciality === d.speciality);
  const others = related.length > 0 ? related : doctors.filter((x) => x.slug !== d.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/doctors" className="hover:text-brand-700">Doctors</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{d.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Profile header */}
          <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:p-8">
            <span className={`grid h-28 w-28 shrink-0 place-items-center rounded-3xl text-4xl font-bold ${d.color}`}>
              {initials(d.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{d.name}</h1>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  ✓ Verified
                </span>
              </div>
              <p className="mt-1 font-medium text-brand-600">{d.speciality}</p>
              <p className="mt-1 text-slate-600">
                {d.hospital}, {d.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span><strong>{d.exp}</strong> <span className="text-slate-500">years experience</span></span>
                <span>
                  <strong className="text-amber-500">★ {d.rating}</strong>{" "}
                  <span className="text-slate-500">({d.reviews.toLocaleString("en-IN")} reviews)</span>
                </span>
                <span><span className="text-slate-500">Speaks</span> {d.languages.join(", ")}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-3 text-slate-600">{d.about}</p>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Education</h2>
              <ul className="mt-3 space-y-2 text-slate-600">
                {d.education.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="text-brand-600">🎓</span>
                    {e}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Services</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.services.map((s) => (
                  <li key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Booking card */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-slate-500">Consultation fee</p>
          <p className="text-3xl font-bold">₹{d.fee.toLocaleString("en-IN")}</p>

          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex gap-3">
              <BuildingIcon className="h-5 w-5 shrink-0 text-brand-600" />
              <span>In-clinic at {d.hospital}</span>
            </li>
            <li className="flex gap-3">
              <VideoIcon className="h-5 w-5 shrink-0 text-brand-600" />
              <span>{d.video ? "Video consultation available" : "In-clinic visits only"}</span>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="h-5 w-5 shrink-0 text-brand-600" />
              <span>{d.hours}</span>
            </li>
            <li className="flex gap-3">
              <CalendarIcon className="h-5 w-5 shrink-0 text-brand-600" />
              <div className="flex flex-wrap gap-1.5">
                {WEEK.map((day) => (
                  <span
                    key={day}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      d.days.includes(day) ? "bg-brand-50 text-brand-700" : "bg-slate-50 text-slate-300 line-through"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </li>
          </ul>

          {/* Signed-out visitors are sent to the patient login by the proxy. */}
          <Link
            href="/patient/appointments"
            className="mt-6 block rounded-xl bg-brand-600 py-3 text-center font-semibold text-white hover:bg-brand-700"
          >
            Book appointment
          </Link>
        </aside>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">
          {related.length > 0 ? `More ${d.speciality}s` : "Other doctors you may like"}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((x) => (
            <DoctorCard key={x.slug} doctor={x} />
          ))}
        </div>
      </section>
    </div>
  );
}
