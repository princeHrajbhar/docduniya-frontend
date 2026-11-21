/**
 * MOCK SESSION — for frontend development only.
 * The cookie is NOT signed or encrypted. Replace with your backend's
 * token (e.g. a JWT issued by the API) before going to production.
 */

export type Role = "patient" | "doctor";

export type PatientProfile = {
  phone: string;
  city: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
};

export type DoctorProfile = {
  phone: string;
  city: string;
  speciality: string;
  registrationNo: string;
  experience: string;
  clinic?: string;
  fee?: string;
};

export type Session = {
  role: Role;
  name: string;
  email: string;
  profile?: PatientProfile | DoctorProfile;
};

export const SESSION_COOKIE = "dd_session";

export function encodeSession(session: Session): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (parsed?.role === "patient" || parsed?.role === "doctor") {
      return parsed as Session;
    }
  } catch {
    // malformed cookie
  }
  return null;
}

export function homeFor(role: Role) {
  return role === "doctor" ? "/doctor" : "/patient";
}
