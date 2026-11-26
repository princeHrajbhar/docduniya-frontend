import { Suspense } from "react";
import { Alert } from "@/components/ui/primitives";
import { RoleChooser } from "@/features/auth/components/RoleChooser";

export const metadata = { title: "Sign in – DocDuniya" };

export default function ChooseRolePage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
      <Suspense>
        <Notice searchParams={searchParams} />
      </Suspense>
      <RoleChooser mode="login" />
    </div>
  );
}

async function Notice({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const sp = await searchParams;
  if (sp.reset) return <Alert tone="success" className="mb-6">Password updated. Choose how you sign in and use your new password.</Alert>;
  if (sp.expired) return <Alert tone="warning" className="mb-6">Your session ended. Please sign in again.</Alert>;
  return null;
}
