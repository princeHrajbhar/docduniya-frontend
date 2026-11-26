import { LoginPage } from "@/features/auth/components/LoginPage";

export const metadata = { title: "Patient sign in – DocDuniya" };

export default function PatientLoginPage({ searchParams }: PageProps<"/login/patient">) {
  return <LoginPage role="patient" searchParams={searchParams} />;
}
