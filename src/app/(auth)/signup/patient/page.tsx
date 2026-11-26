import { SignupWizard } from "@/features/auth/components/SignupWizard";

export const metadata = { title: "Create a patient account – DocDuniya" };

export default function PatientSignupPage() {
  return <SignupWizard kind="patient" />;
}
