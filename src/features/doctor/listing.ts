import type { PublicDoctorListing } from "@/lib/api/types";

/** A doctor with every clinic they consult at (discovery returns one row per clinic). */
export type DoctorEntry = {
  doctorId: string;
  slug: string;
  publicName: string;
  bio: string;
  specialties: PublicDoctorListing["specialties"];
  qualifications: PublicDoctorListing["qualifications"];
  languages: string[];
  rating?: { average: number; count: number };
  locations: PublicDoctorListing[];
  bookable: boolean;
  fromPriceMinor?: number;
  modes: string[];
};

export function groupListings(listings: PublicDoctorListing[]): DoctorEntry[] {
  const byDoctor = new Map<string, DoctorEntry>();
  for (const listing of listings) {
    const entry =
      byDoctor.get(listing.doctorId) ??
      ({
        doctorId: listing.doctorId,
        slug: listing.slug,
        publicName: listing.publicName,
        bio: listing.bio,
        specialties: listing.specialties,
        qualifications: listing.qualifications,
        languages: listing.languages,
        rating: listing.rating,
        locations: [],
        bookable: false,
        modes: [],
      } satisfies DoctorEntry);
    entry.locations.push(listing);
    entry.bookable ||= listing.bookable;
    for (const offering of listing.offerings) {
      if (!entry.modes.includes(offering.mode)) entry.modes.push(offering.mode);
      const price = offering.price?.totalMinor;
      if (price !== undefined && (entry.fromPriceMinor === undefined || price < entry.fromPriceMinor)) entry.fromPriceMinor = price;
    }
    byDoctor.set(listing.doctorId, entry);
  }
  return [...byDoctor.values()];
}

export const cityOf = (listing: PublicDoctorListing) =>
  listing.facility.address?.city ?? listing.facility.address?.locality ?? undefined;
