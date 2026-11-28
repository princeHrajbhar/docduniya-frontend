import { Suspense } from "react";
import { AuthFallback } from "@/features/auth/components/LoginPage";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";

export const metadata = { title: "Administrator sign in – DocDuniya" };

/** Reads ?next= and ?expired= from the URL, so it renders per request. */
export default function AdministratorLoginPage({ searchParams }: PageProps<"/administrator/login">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <WithParams searchParams={searchParams} />
    </Suspense>
  );
}

async function WithParams({ searchParams }: { searchParams: PageProps<"/administrator/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return <AdminLoginForm next={next} notice={sp.expired ? "expired" : undefined} />;
}
