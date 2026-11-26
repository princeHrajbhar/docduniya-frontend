import { LockIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/primitives";

export function NoAccess({ permission }: { permission: string }) {
  return (
    <EmptyState icon={<LockIcon className="h-6 w-6" />} title="You don't have access to this section">
      It needs the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{permission}</code> permission. Ask a super admin to add it to your role.
    </EmptyState>
  );
}
