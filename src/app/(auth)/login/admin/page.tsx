import { LoginPage } from "@/features/auth/components/LoginPage";

export const metadata = { title: "Admin sign in – DocDuniya" };

export default function AdminLoginPage({ searchParams }: PageProps<"/login/admin">) {
  return <LoginPage role="admin" searchParams={searchParams} />;
}
