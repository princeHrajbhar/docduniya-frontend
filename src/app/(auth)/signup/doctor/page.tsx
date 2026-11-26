import { SignupWizard } from "@/features/auth/components/SignupWizard";
import { getSpecialties } from "@/services/catalog";

export const metadata = { title: "Join as a doctor – DocDuniya" };

export default async function DoctorSignupPage() {
  // Cached on the server, so this page still prerenders.
  const specialties = await getSpecialties();
  return <SignupWizard kind="doctor" specialties={specialties} />;
}
