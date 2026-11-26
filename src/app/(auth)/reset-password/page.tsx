import { Suspense } from "react";
import { AuthFallback } from "@/features/auth/components/LoginPage";
import { ResetPasswordForm } from "@/features/auth/components/PasswordForms";

export const metadata = { title: "Choose a new password – DocDuniya" };

/** Opened from the backend's reset email: /reset-password?token=…&email=… */
export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Reset searchParams={searchParams} />
    </Suspense>
  );
}

async function Reset({ searchParams }: { searchParams: PageProps<"/reset-password">["searchParams"] }) {
  const { token, email } = await searchParams;
  return <ResetPasswordForm token={typeof token === "string" ? token : undefined} email={typeof email === "string" ? email : undefined} />;
}
