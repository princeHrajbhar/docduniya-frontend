import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { api } from "@/lib/api/server";
import type { CurrentUser } from "@/lib/api/types";
import { StoreProvider } from "@/lib/store/Provider";
import { Workspace } from "@/features/workspace/Workspace";
import "@/features/workspace/workspace.css";
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  await connection();
  const { area } = await params;
  if (area !== "patient" && area !== "provider" && area !== "admin") notFound();
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await api<CurrentUser>("/auth/me");
  if (area === "admin" && !user.permissions.length)
    redirect(`/${session.role}/dashboard`);
  // A workspace is not an authorization grant. Every operation is checked by the backend.
  return (
    <main className="ws-page">
      <div className="ws-top">
        <Link href={`/${session.role}/dashboard`}>
          DocDuniya / My dashboard
        </Link>
        <span>{session.name}</span>
      </div>
      <StoreProvider key={`${session.userId}:${area}`}>
        <Workspace
          area={area}
          patientId={area === "patient" ? session.patientId : undefined}
        />
      </StoreProvider>
    </main>
  );
}
