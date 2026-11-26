import { Suspense } from "react";
import { ListSkeleton, LoadError, PageHeader } from "@/components/ui/primitives";
import { api, attempt } from "@/lib/api/server";
import type { AuthSession, MfaStatus } from "@/lib/api/types";
import type { Role } from "@/types/auth";
import { requireSession } from "@/lib/session";
import { MfaPanel, PasswordPanel, SessionsPanel } from "./SecurityPanels";

/** The security settings page shared by every role. */
export function AccountSecurity({ role }: { role: Role }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Manage your password, two-step verification and signed-in devices." />
      <PasswordPanel />
      <Suspense fallback={<ListSkeleton rows={3} />}>
        <SecurityData role={role} />
      </Suspense>
    </div>
  );
}

async function SecurityData({ role }: { role: Role }) {
  await requireSession(role);
  const result = await attempt(Promise.all([api<MfaStatus>("/auth/mfa"), api<{ sessions: AuthSession[] }>("/auth/sessions")]));
  if (!result.ok) return <LoadError message={result.error} />;
  const [mfa, sessions] = result.data;
  return (
    <>
      <MfaPanel status={mfa} />
      <SessionsPanel sessions={sessions.sessions} />
    </>
  );
}
