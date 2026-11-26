export const ROLES = ["patient", "doctor", "admin"] as const;

export type Role = (typeof ROLES)[number];

/** What the frontend remembers about the signed-in account (see lib/session-core.ts). */
export type Session = {
  role: Role;
  userId: string;
  email: string;
  /** Display name: the patient's or doctor's profile name, or the email for admins. */
  name: string;
  /** The patient profile the account books and views records for (patients only). */
  patientId?: string;
  /** The doctor profile owned by the account (doctors only). */
  doctorId?: string;
  /** Platform permissions (admins only), used to show the sections they can open. */
  permissions?: string[];
};
