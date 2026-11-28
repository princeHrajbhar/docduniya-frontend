"use client";
import { useDispatch } from "react-redux";
import { operations } from "@/lib/workspace/contract";
import {
  clearContext,
  setContext,
  platformApi,
  useReadQuery,
  type AppDispatch,
} from "@/lib/store/store";
type Membership = {
  membershipId: string;
  organization: { id: string; displayName?: string };
  roles: { name: string }[];
};
export function ContextPicker({ onSwitch }: { onSwitch: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const operation = operations.find(
    (op) => op.path === "/me/workspaces" && op.method === "GET",
  );
  const memberships = useReadQuery(
    { operationId: operation?.id || "", path: {} },
    { skip: !operation },
  );
  const items =
    (memberships.data?.data as { workspaces?: Membership[] } | undefined)
      ?.workspaces || [];
  return (
    <div className="ws-memberships">
      <strong>Your organizations</strong>
      {memberships.isLoading ? (
        <span>Loading…</span>
      ) : (
        items.map((m) => (
          <button
            className="ws-secondary"
            key={m.membershipId}
            title={m.roles.map((role) => role.name).join(", ")}
            onClick={() => {
              dispatch(platformApi.util.resetApiState());
              dispatch(clearContext());
              dispatch(
                setContext({
                  organizationId: m.organization.id,
                  membershipId: m.membershipId,
                }),
              );
              onSwitch();
            }}
          >
            {m.organization.displayName || "Provider organization"}
          </button>
        ))
      )}
      {memberships.isError && (
        <span role="alert">Memberships could not be loaded.</span>
      )}
      {!memberships.isLoading && !memberships.isError && !items.length && (
        <span>Use “Create organization” to register a clinic or hospital.</span>
      )}
    </div>
  );
}
