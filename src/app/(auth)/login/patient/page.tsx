import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Patient Login – DocDuniya" };

export default function PatientLoginPage() {
  return <LoginForm role="patient" />;
}
