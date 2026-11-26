import { Suspense } from "react";
import { OnboardingForm } from "@/features/auth/components/OnboardingForm";
import { AuthFallback } from "@/features/auth/components/LoginPage";
import { getSpecialties } from "@/services/catalog";

export const metadata = { title: "Complete your profile – DocDuniya" };

export default function DoctorOnboardingPage({ searchParams }: PageProps<"/onboarding/doctor">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Onboarding searchParams={searchParams} />
    </Suspense>
  );
}

async function Onboarding({ searchParams }: { searchParams: PageProps<"/onboarding/doctor">["searchParams"] }) {
  const { retry } = await searchParams;
  return <OnboardingForm kind="doctor" retry={Boolean(retry)} specialties={await getSpecialties()} />;
}
