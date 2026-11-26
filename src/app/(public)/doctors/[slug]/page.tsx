import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BuildingIcon, GraduationIcon, LanguagesIcon, MapPinIcon, ShieldCheckIcon, StarIcon } from "@/components/ui/icons";
import { Avatar, Badge, Card, Skeleton } from "@/components/ui/primitives";
import { BookingWidget, type BookableOffering } from "@/features/booking/BookingWidget";
import { cityOf, groupListings } from "@/features/doctor/listing";
import { dateLabel, doctorHref, doctorIdFromParam, modeLabel, money } from "@/lib/format";
import { getSession } from "@/lib/session";
import { discoverDoctors, getDoctorReviews } from "@/services/catalog";

async function loadDoctor(param: string) {
  const doctorId = doctorIdFromParam(param);
  if (!doctorId) return null;
  const page = await discoverDoctors({ doctorId, limit: 25 }).catch(() => null);
  return page?.items.length ? groupListings(page.items)[0] : null;
}

export async function generateMetadata({ params }: PageProps<"/doctors/[slug]">) {
  const doctor = await loadDoctor((await params).slug);
  if (!doctor) return { title: "Doctor not found – DocDuniya" };
  const specialty = doctor.specialties[0]?.name;
  const city = cityOf(doctor.locations[0]);
  return {
    title: `${doctor.publicName}${specialty ? `, ${specialty}` : ""}${city ? ` in ${city}` : ""} – DocDuniya`,
    description: doctor.bio.slice(0, 160),
  };
}

export default function DoctorPage({ params }: PageProps<"/doctors/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Suspense fallback={<ProfileSkeleton />}>
        <DoctorProfile params={params} />
      </Suspense>
    </div>
  );
}

async function DoctorProfile({ params }: { params: PageProps<"/doctors/[slug]">["params"] }) {
  const { slug } = await params;
  const d = await loadDoctor(slug);
  if (!d) notFound();

  const session = await getSession();
  const viewer = !session ? "guest" : session.role === "patient" ? "patient" : "other";
  const href = doctorHref(d.slug, d.doctorId);
  const offerings: BookableOffering[] = d.locations.flatMap((l) =>
    l.offerings.map((o) => ({
      id: o.id,
      name: o.name,
      mode: o.mode,
      durationMinutes: o.durationMinutes,
      paymentPolicy: o.paymentPolicy,
      priceMinor: o.price?.totalMinor,
      facilityName: l.facility.name,
    })),
  );

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/doctors" className="hover:text-brand-700">Doctors</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{d.publicName}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row">
              <Avatar name={d.publicName} seed={d.doctorId} size="xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{d.publicName}</h1>
                  <Badge tone="success">
                    <ShieldCheckIcon className="h-3.5 w-3.5" /> Verified
                  </Badge>
                </div>
                <p className="mt-1 font-medium text-brand-700">{d.specialties.map((s) => s.name).join(" · ") || d.locations[0].department}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  {d.rating && d.rating.count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <strong className="text-slate-900">{d.rating.average.toFixed(1)}</strong>
                      <span className="text-slate-500">({d.rating.count} reviews)</span>
                    </span>
                  )}
                  {d.languages.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <LanguagesIcon className="h-4 w-4 text-slate-400" />
                      {d.languages.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-6 leading-relaxed whitespace-pre-line text-slate-700">{d.bio}</p>
          </Card>

          {d.qualifications.length > 0 && (
            <Card className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Education &amp; training</h2>
              <ul className="mt-4 space-y-3">
                {d.qualifications.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <GraduationIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{q.name}</p>
                      <p className="text-sm text-slate-500">
                        {q.institution}
                        {q.awardYear && ` · ${q.awardYear}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Where {d.publicName.replace(/^Dr\.?\s*/, "Dr. ").split(" ").slice(0, 2).join(" ")} consults</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {d.locations.map((l) => {
                const a = l.facility.address;
                return (
                  <li key={l.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <BuildingIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{l.facility.name}</p>
                      <p className="text-sm text-slate-500">
                        {l.organization.name} · {l.title}, {l.department}
                      </p>
                      {a && (
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
                          <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {[a.line1, a.locality, a.city, a.postalCode].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {l.offerings.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {l.offerings.map((o) => (
                            <Badge key={o.id}>
                              {modeLabel(o.mode)} · {money(o.price?.totalMinor)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Suspense fallback={<Skeleton className="h-40 rounded-2xl" />}>
            <Reviews doctorId={d.doctorId} />
          </Suspense>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Book an appointment</h2>
            <p className="mt-1 mb-5 text-sm text-slate-500">Times are shown in India Standard Time.</p>
            {d.bookable && offerings.length > 0 ? (
              <BookingWidget offerings={offerings} viewer={viewer} loginHref={`/login/patient?next=${encodeURIComponent(href)}`} />
            ) : (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Online booking isn&apos;t open for this doctor yet. Please contact the clinic directly.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}

async function Reviews({ doctorId }: { doctorId: string }) {
  const reviews = await getDoctorReviews(doctorId);
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Patient reviews</h2>
      {reviews.items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No reviews yet. Reviews come only from patients who completed a visit.</p>
      ) : (
        <ul className="mt-4 space-y-5">
          {reviews.items.map((r) => (
            <li key={r.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="flex" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  ))}
                </span>
                <span className="text-sm font-medium text-slate-700">{r.author}</span>
                <span className="text-xs text-slate-400">· {dateLabel(r.createdAt)}</span>
              </div>
              {r.text && <p className="mt-2 text-sm text-slate-700">{r.text}</p>}
              {r.providerReply && (
                <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-xs font-semibold text-slate-500">Reply from the clinic</p>
                  <p className="mt-1 text-slate-700">{r.providerReply.text}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true">
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-[32rem] rounded-2xl" />
    </div>
  );
}
