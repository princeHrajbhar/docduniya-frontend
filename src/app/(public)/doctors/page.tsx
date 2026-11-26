import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { ButtonLink, EmptyState, LoadError, Skeleton, cx } from "@/components/ui/primitives";
import { StethoscopeIcon } from "@/components/ui/icons";
import { DoctorDirectory } from "@/features/doctor/components/DoctorDirectory";
import { groupListings } from "@/features/doctor/listing";
import { friendlyMessage } from "@/lib/api/errors";
import { discoverDoctors, getSpecialties } from "@/services/catalog";

export const metadata = {
  title: "Find doctors – DocDuniya",
  description: "Browse manually verified doctors across India by speciality and book in-clinic or online visits.",
};

type Search = PageProps<"/doctors">["searchParams"];

export default function DoctorsPage({ searchParams }: PageProps<"/doctors">) {
  return (
    <>
      <PageHero
        eyebrow="Find a doctor"
        title="Doctors you can trust"
        sub="Every doctor is manually verified against their medical council registration before they appear here."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Suspense fallback={<DirectorySkeleton />}>
          <Directory searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function Directory({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const specialtyId = one(sp.specialty);
  const before = one(sp.before);
  const [specialties, result] = await Promise.all([
    getSpecialties(),
    discoverDoctors({ specialtyId, before }).then(
      (page) => ({ ok: true as const, page }),
      (error: unknown) => ({ ok: false as const, error: friendlyMessage(error) }),
    ),
  ]);

  const href = (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])));
    return qs.size ? `/doctors?${qs}` : "/doctors";
  };

  return (
    <div className="space-y-8">
      {specialties.length > 0 && (
        <nav aria-label="Filter by speciality" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: undefined, name: "All specialities" }, ...specialties].map((s) => {
            const active = s.id === specialtyId;
            return (
              <Link
                key={s.id ?? "all"}
                href={href({ specialty: s.id, q: one(sp.q) })}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400",
                )}
              >
                {s.name}
              </Link>
            );
          })}
        </nav>
      )}

      {!result.ok ? (
        <LoadError title="We couldn't load doctors right now" message={result.error} />
      ) : result.page.items.length === 0 ? (
        <EmptyState icon={<StethoscopeIcon className="h-6 w-6" />} title={specialtyId ? "No verified doctors in this speciality yet" : "No doctors are listed yet"} action={specialtyId ? <ButtonLink href="/doctors" variant="secondary">See all doctors</ButtonLink> : undefined}>
          New doctors join as soon as their verification is complete. Please check back soon.
        </EmptyState>
      ) : (
        <>
          <DoctorDirectory doctors={groupListings(result.page.items)} initialQuery={one(sp.q)} />
          {(before || result.page.nextCursor) && (
            <div className="flex justify-center gap-3">
              {before && (
                <ButtonLink href={href({ specialty: specialtyId })} variant="secondary">
                  ← First page
                </ButtonLink>
              )}
              {result.page.nextCursor && (
                <ButtonLink href={href({ specialty: specialtyId, before: result.page.nextCursor })} variant="secondary">
                  More doctors →
                </ButtonLink>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading doctors">
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-60 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
