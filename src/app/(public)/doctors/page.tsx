import { PageHero } from "@/components/ui/PageHero";
import { DoctorDirectory } from "@/features/doctor/components/DoctorDirectory";
import { doctors } from "@/features/doctor/data";

export const metadata = {
  title: "Find Doctors – DocDuniya",
  description: "Browse verified doctors across India by speciality, city and hospital.",
};

export default function DoctorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Doctors"
        title="Find the right doctor"
        sub="Verified specialists from leading hospitals, available in-clinic and over video."
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <DoctorDirectory doctors={doctors} />
      </div>
    </>
  );
}
