import { Suspense } from "react";
import { OnboardingForm } from "@/features/auth/components/OnboardingForm";
import { AuthFallback } from "@/features/auth/components/LoginPage";


export const metadata = { title: "Complete your profile – DocDuniya" };

export default function PatientOnboardingPage({ searchParams }: PageProps<"/onboarding/patient">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Onboarding searchParams={searchParams} />
    </Suspense>
  );
}

async function Onboarding({ searchParams }: { searchParams: PageProps<"/onboarding/patient">["searchParams"] }) {
  const { retry } = await searchParams;
  return <OnboardingForm kind="patient" retry={Boolean(retry)} />;
}
