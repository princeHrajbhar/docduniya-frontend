import { Suspense } from "react";
import { ListSkeleton, LoadError, PageHeader } from "@/components/ui/primitives";
import { ProfileForm } from "@/features/patient/ProfileForm";

import { api, attempt } from "@/lib/api/server";
import type { Patient } from "@/lib/api/types";
import { patientContext } from "@/services/patient";

export const metadata = { title: "Profile – DocDuniya" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" description="Personal details shared with clinics when you book." />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <Profile />
      </Suspense>
    </div>
  );
}

async function Profile() {
  const { patientId } = await patientContext();
  const patient = await attempt(api<Patient>(`/patients/${patientId}/profile`));
  return patient.ok ? <ProfileForm patient={patient.data} /> : <LoadError message={patient.error} />;
}
