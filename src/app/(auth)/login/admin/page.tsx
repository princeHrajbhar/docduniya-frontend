import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Admin Login – DocDuniya" };

export default function AdminLoginPage() {
  return <LoginForm role="admin" />;
}
