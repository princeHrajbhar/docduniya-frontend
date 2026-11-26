import Link from "next/link";
import { MapPinIcon, StarIcon, VideoIcon } from "@/components/ui/icons";
import { Avatar, Badge } from "@/components/ui/primitives";
import { doctorHref, money } from "@/lib/format";
import { cityOf, type DoctorEntry } from "../listing";

export function DoctorCard({ doctor: d }: { doctor: DoctorEntry }) {
  const primary = d.locations[0];
  const city = cityOf(primary);
  const extra = d.locations.length - 1;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <Avatar name={d.publicName} seed={d.doctorId} size="lg" className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">
            {/* The stretched link makes the whole card clickable. */}
            <Link href={doctorHref(d.slug, d.doctorId)} className="after:absolute after:inset-0 group-hover:text-brand-700">
              {d.publicName}
            </Link>
          </h3>
          <p className="truncate text-sm font-medium text-brand-700">{d.specialties.map((s) => s.name).join(", ") || primary.department}</p>
          {d.rating && d.rating.count > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              <StarIcon className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900">{d.rating.average.toFixed(1)}</span>
              <span className="text-slate-400">({d.rating.count})</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">New on DocDuniya</p>
          )}
        </div>
      </div>

      <div className="mt-4 mb-5 space-y-1.5 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span className="line-clamp-1">
            {primary.facility.name}
            {city && `, ${city}`}
            {extra > 0 && <span className="text-slate-400"> · +{extra} more</span>}
          </span>
        </p>
        {d.modes.some((m) => m !== "IN_PERSON") && (
          <p className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4 text-slate-400" />
            Online consultation available
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          {d.fromPriceMinor !== undefined ? (
            <>
              <p className="text-xs text-slate-500">Consultation from</p>
              <p className="font-semibold text-slate-900">{money(d.fromPriceMinor)}</p>
            </>
          ) : (
            <Badge>Fees at clinic</Badge>
          )}
        </div>
        {d.bookable ? (
          <span className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition group-hover:bg-brand-700">Book visit</span>
        ) : (
          <span className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700">View profile</span>
        )}
      </div>
    </article>
  );
}
