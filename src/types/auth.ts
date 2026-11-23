export const ROLES = ["patient", "doctor", "admin"] as const;

export type Role = (typeof ROLES)[number];

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
