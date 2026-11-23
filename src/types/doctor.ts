export type Doctor = {
  slug: string;
  name: string;
  speciality: string;
  hospital: string;
  city: string;
  exp: number;
  rating: number;
  reviews: number;
  fee: number;
  color: string;
  languages: string[];
  education: string[];
  services: string[];
  about: string;
  /** Days the doctor consults, e.g. ["Mon", "Wed", "Fri"]. */
  days: string[];
  hours: string;
  video: boolean;
};
