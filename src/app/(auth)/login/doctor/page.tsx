import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Doctor Login – DocDuniya" };

export default function DoctorLoginPage() {
  return <LoginForm role="doctor" />;
}
