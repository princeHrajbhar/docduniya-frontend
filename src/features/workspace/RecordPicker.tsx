"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { operations } from "@/lib/workspace/contract";
import {
  clearContext,
  platformApi,
  setContext,
  useReadQuery,
  type AppDispatch,
} from "@/lib/store/store";
type Row = {
  id: string;
  patientId?: string;
  primaryFacilityId?: string;
  mrn?: string;
  name?: string | { display?: string };
  demographicSnapshot?: { name?: { display?: string } };
};
export function RecordPicker({
  kind,
  organizationId,
  onPick,
}: {
  kind: "patient" | "registration" | "facility";
  organizationId?: string;
  onPick: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [search, setSearch] = useState("");
  const [mrn, setMrn] = useState("");
  const endpoint =
    kind === "patient"
      ? "/me/patients"
      : kind === "facility"
        ? "/organizations/{organizationId}/facilities"
        : "/organizations/{organizationId}/patient-registrations";
  const operation = operations.find(
    (op) => op.path === endpoint && op.method === "GET",
  );
  const records = useReadQuery(
    {
      operationId: operation?.id || "",
      path: { organizationId },
      query: {
        limit: 25,
        before: cursor,
        ...(kind === "registration" && mrn ? { mrn } : {}),
      },
    },
    { skip: !open || !operation || (kind !== "patient" && !organizationId) },
  );
  const data = records.currentData?.data as
    { items?: Row[]; nextCursor?: string } | undefined;
  const title =
    kind === "facility"
      ? "Choose facility"
      : kind === "registration"
        ? "Find registered patient"
        : "Choose patient profile";
  function choose(row: Row) {
    dispatch(platformApi.util.resetApiState());
    dispatch(clearContext());
    dispatch(
      setContext({
        ...(organizationId ? { organizationId } : {}),
        ...(kind === "facility"
          ? { facilityId: row.id }
          : {
              patientId: row.patientId || row.id,
              ...(kind === "registration"
                ? {
                    registrationId: row.id,
                    ...(row.primaryFacilityId
                      ? { facilityId: row.primaryFacilityId }
                      : {}),
                  }
                : {}),
            }),
      }),
    );
    setOpen(false);
    onPick();
  }
  return (
    <div className="ws-picker">
      <button
        type="button"
        className="ws-secondary"
        aria-expanded={open}
        disabled={kind !== "patient" && !organizationId}
        onClick={() => setOpen(!open)}
      >
        {title}
      </button>
      {open && (
        <section className="ws-picker-panel" aria-label={title}>
          {kind === "registration" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCursor(undefined);
                setMrn(search.trim());
              }}
            >
              <label>
                Search by MRN
                <input
                  className="ws-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="MRN-00000001"
                />
              </label>
              <button className="ws-secondary">Search patients</button>
            </form>
          )}
          {records.isFetching && <p role="status">Loading records…</p>}
          {records.isError && (
            <p role="alert">
              Records could not be loaded. Check your organization permissions.
            </p>
          )}
          {!records.isFetching && !records.isError && !data?.items?.length && (
            <p>No records found.</p>
          )}
          {data?.items?.map((row) => (
            <button
              key={row.id}
              type="button"
              className="ws-thread"
              onClick={() => choose(row)}
            >
              <strong>
                {typeof row.name === "string"
                  ? row.name
                  : row.name?.display ||
                    row.demographicSnapshot?.name?.display ||
                    "Patient profile"}
              </strong>
              {row.mrn && <small>{row.mrn}</small>}
            </button>
          ))}
          {data?.nextCursor && (
            <button
              type="button"
              className="ws-secondary"
              onClick={() => setCursor(data.nextCursor)}
            >
              More records
            </button>
          )}
          {cursor && (
            <button
              type="button"
              className="ws-text"
              onClick={() => setCursor(undefined)}
            >
              First page
            </button>
          )}
        </section>
      )}
    </div>
  );
}
