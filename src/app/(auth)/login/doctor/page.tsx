import { LoginPage } from "@/features/auth/components/LoginPage";

export const metadata = { title: "Doctor sign in – DocDuniya" };

export default function DoctorLoginPage({ searchParams }: PageProps<"/login/doctor">) {
  return <LoginPage role="doctor" searchParams={searchParams} />;
}
