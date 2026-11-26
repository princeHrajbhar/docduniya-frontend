import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/lib/api/server";
import type { Page, PublicDoctorListing, PublicOffering, PublicReview, Specialty } from "@/lib/api/types";

/*
 * Public catalogue reads. They need no session, so they are cached on the server for a few
 * minutes: fast pages for visitors and far fewer calls to the API. Booking always re-checks
 * live availability and prices, so a slightly stale directory can't cause a wrong booking.
 */

export async function getSpecialties(): Promise<Specialty[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("specialties");
  try {
    const page = await api<Page<Specialty>>("/specialties", { auth: false, forwardClient: false, query: { limit: 100 } });
    return [...page.items].sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function discoverDoctors(query: { specialtyId?: string; before?: string; limit?: number; doctorId?: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("discovery");
  return api<Page<PublicDoctorListing>>("/discovery/doctors", {
    auth: false,
    forwardClient: false,
    query: { limit: 24, ...query },
  });
}

/**
 * Doctors for the home page. Never throws: the home page prerenders, possibly while the API
 * is unreachable (e.g. at build time), and then simply hides the section until it revalidates.
 */
export async function featuredDoctors(): Promise<PublicDoctorListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("discovery");
  try {
    const page = await api<Page<PublicDoctorListing>>("/discovery/doctors", { auth: false, forwardClient: false, query: { limit: 12 } });
    return page.items;
  } catch {
    return [];
  }
}

export async function getDoctorReviews(doctorId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`reviews:${doctorId}`);
  try {
    return await api<Page<PublicReview>>(`/doctors/${doctorId}/reviews`, { auth: false, forwardClient: false, query: { limit: 10 } });
  } catch {
    return { items: [] };
  }
}

/** Offering names, doctor and clinic for an appointment card. Cached briefly. */
export async function getOffering(offeringId: string): Promise<PublicOffering | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api<PublicOffering>(`/offerings/${offeringId}`, { auth: false, forwardClient: false });
  } catch {
    return null;
  }
}
