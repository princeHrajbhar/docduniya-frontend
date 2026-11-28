"use client";
import { useState, useMemo, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  availableOperations,
  defaults,
  label,
  type Operation,
  type Schema,
} from "@/lib/workspace/contract";
import {
  setContext,
  setSearch,
  clearContext,
  platformApi,
  useCommandMutation,
  useLazyReadQuery,
  type RootState,
  type AppDispatch,
  type ApiResult,
} from "@/lib/store/store";
import { SchemaField } from "./SchemaField";
import { Results } from "./Results";
import { Messages } from "./Messages";
import { ContextPicker } from "./ContextPicker";
import { RecordPicker } from "./RecordPicker";
export function Workspace({
  area,
  patientId,
}: {
  area: "patient" | "provider" | "admin";
  patientId?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const context = useSelector((state: RootState) => state.workspace.context);
  const search = useSelector((state: RootState) => state.workspace.search);
  const operations = useMemo(() => availableOperations(area), [area]);
  const groups = [...new Set(operations.map((op) => op.group))];
  const [group, setGroup] = useState(
    area === "provider" &&
      groups.includes("Organizations, patients and practitioners")
      ? "Organizations, patients and practitioners"
      : groups[0],
  );
  const [selected, setSelected] = useState<string>();
  const [messages, setMessages] = useState(false);
  const options = operations.filter((op) =>
    search
      ? `${op.title} ${op.group}`.toLowerCase().includes(search.toLowerCase())
      : op.group === group,
  );
  const operation = operations.find((op) => op.id === selected);
  const heading =
    area === "provider"
      ? "Practice workspace"
      : area === "patient"
        ? "My care services"
        : "Platform administration";
  return (
    <div className="workspace">
      <header className="ws-hero">
        <div>
          <span className="ws-eyebrow">DOCDUNIYA · CONNECTED CARE</span>
          <h1>{heading}</h1>
          <p>
            {area === "provider"
              ? "Care delivery, people and operations. Together in one place."
              : area === "patient"
                ? "Manage your care, conversations, insurance and privacy."
                : "Review, govern and manage your healthcare marketplace."}
          </p>
        </div>
        <div className="ws-hero-mark" aria-hidden="true">
          +
        </div>
      </header>
      {area !== "patient" && (
        <ContextPicker onSwitch={() => setSelected(undefined)} />
      )}
      <section className="ws-context" aria-label="Current workspace">
        <div>
          <strong>Working context</strong>
          <p>Selections carry across workflows in this session.</p>
        </div>
        <label>
          Organization reference
          <input
            value={context.organizationId || ""}
            onChange={(e) => {
              dispatch(platformApi.util.resetApiState());
              dispatch(clearContext());
              dispatch(setContext({ organizationId: e.target.value }));
              setSelected(undefined);
            }}
          />
        </label>
        <label>
          Patient reference
          <input
            value={context.patientId ?? patientId ?? ""}
            onChange={(e) => {
              dispatch(platformApi.util.resetApiState());
              dispatch(setContext({ patientId: e.target.value }));
              setSelected(undefined);
            }}
          />
        </label>
        <button
          className="ws-text"
          onClick={() => {
            dispatch(clearContext());
            dispatch(platformApi.util.resetApiState());
            setSelected(undefined);
          }}
        >
          Clear selections
        </button>
      </section>
      <div className="ws-memberships">
        {area === "patient" ? (
          <RecordPicker kind="patient" onPick={() => setSelected(undefined)} />
        ) : (
          <>
            <RecordPicker
              key={`facilities:${context.organizationId}`}
              kind="facility"
              organizationId={context.organizationId}
              onPick={() => setSelected(undefined)}
            />
            <RecordPicker
              key={`patients:${context.organizationId}`}
              kind="registration"
              organizationId={context.organizationId}
              onPick={() => setSelected(undefined)}
            />
          </>
        )}
      </div>
      <div className="ws-layout">
        <nav className="ws-nav" aria-label="Service areas">
          <label className="ws-search">
            Find a workflow
            <input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => {
                dispatch(setSearch(e.target.value));
                setMessages(false);
                setSelected(undefined);
              }}
            />
          </label>
          <button
            aria-current={messages ? "page" : undefined}
            onClick={() => {
              setMessages(true);
              setSelected(undefined);
            }}
          >
            Messages
          </button>
          {groups.map((name) => (
            <button
              key={name}
              aria-current={!messages && group === name ? "page" : undefined}
              onClick={() => {
                setGroup(name);
                setMessages(false);
                setSelected(undefined);
                dispatch(setSearch(""));
              }}
            >
              {name}
              <span>{operations.filter((o) => o.group === name).length}</span>
            </button>
          ))}
        </nav>
        <section className="ws-main">
          {messages ? (
            <Messages
              key={`${context.organizationId}:${context.patientId}`}
              area={area}
              context={{ ...(patientId ? { patientId } : {}), ...context }}
            />
          ) : operation ? (
            <>
              <button
                className="ws-text"
                onClick={() => setSelected(undefined)}
              >
                Back to {group.toLowerCase()}
              </button>
              <OperationForm
                key={`${operation.id}:${context.organizationId}:${context.patientId}`}
                operation={operation}
                context={{ ...(patientId ? { patientId } : {}), ...context }}
              />
            </>
          ) : (
            <>
              <div className="ws-section-title">
                <div>
                  <h2>{search ? "Search results" : group}</h2>
                  <p>Choose what you would like to do.</p>
                </div>
                <span>{options.length} workflows</span>
              </div>
              <div className="ws-cards">
                {options.map((op) => (
                  <button
                    className="ws-card"
                    key={op.id}
                    onClick={() => setSelected(op.id)}
                  >
                    <span
                      className={`ws-kind ${op.method === "GET" ? "ws-view" : ""}`}
                    >
                      {op.method === "GET" ? "View & search" : "Manage"}
                    </span>
                    <h3>{label(op.title)}</h3>
                    <p>
                      {op.description ||
                        (op.method === "GET"
                          ? "View current records and find the information you need."
                          : "Complete this workflow with your provider’s current records.")}
                    </p>
                    <span className="ws-open">Open workflow</span>
                  </button>
                ))}
              </div>
              {!options.length && (
                <p className="ws-empty">No matching workflows.</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
function OperationForm({
  operation: op,
  context,
}: {
  operation: Operation;
  context: Record<string, string>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const pathFields = Object.fromEntries(
    op.parameters
      .filter((p) => p.in === "path")
      .map((p) => [p.name!, p.schema || { type: "string" }]),
  );
  const queryFields = Object.fromEntries(
    op.parameters
      .filter((p) => p.in === "query")
      .map((p) => [p.name!, p.schema || { type: "string" }]),
  );
  const [path, setPath] = useState<Record<string, unknown>>(context);
  const [query, setQuery] = useState<Record<string, unknown>>({});
  const [body, setBody] = useState<unknown>(() => {
    const initial = defaults(op.body || op.multipart || {}) as
      Record<string, unknown> | undefined;
    return {
      ...initial,
      ...Object.fromEntries(
        Object.entries(context).filter(([k]) => op.body?.properties?.[k]),
      ),
    };
  });
  const [read, reading] = useLazyReadQuery();
  const [command, writing] = useCommandMutation();
  const [result, setResult] = useState<ApiResult>();
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [file, setFile] = useState<File>();
  const [identity, setIdentity] = useState<{
    fingerprint: string;
    key: string;
  }>();
  const busy = reading.isFetching || writing.isLoading;
  async function execute(event?: FormEvent, cursor?: string, page?: number) {
    event?.preventDefault();
    setError("");
    if (op.method !== "GET" && !confirm) {
      setConfirm(true);
      return;
    }
    const q = {
      ...query,
      ...(cursor ? { before: cursor } : {}),
      ...(page ? { page } : {}),
    };
    const fingerprint = JSON.stringify({
      path,
      q,
      body,
      file: file ? [file.name, file.size, file.lastModified] : null,
    });
    const key =
      identity?.fingerprint === fingerprint
        ? identity.key
        : crypto.randomUUID();
    setIdentity({ fingerprint, key });
    try {
      const call = {
        operationId: op.id,
        path,
        query: q,
        body: op.method === "GET" ? undefined : body,
        file,
        key,
      };
      const response = await (
        op.method === "GET" ? read(call, false) : command(call)
      ).unwrap();
      setResult(response);
      setConfirm(false);
    } catch (failure) {
      const issue = failure as {
        status?: number;
        data?: { message?: string; errors?: unknown };
      };
      setError(
        issue.status === 401
          ? "Your session expired. Sign in again to continue."
          : issue.status === 403
            ? "Your account does not have permission for this workflow."
            : issue.status === 409
              ? "The record changed or this action is not available in its current state. Reload the record before trying again."
              : issue.data?.message || "Request failed. Please retry.",
      );
      setConfirm(false);
    }
  }
  function select(row: Record<string, unknown>) {
    const values = Object.fromEntries(
      Object.entries(row).filter(
        ([key, v]) => key.endsWith("Id") && typeof v === "string",
      ),
    ) as Record<string, string>;
    if (row.id) {
      const name =
        op.path
          .split("/")
          .filter((p) => !p.startsWith("{"))
          .at(-1) || "";
      const names: Record<string, string> = {
        organizations: "organizationId",
        patients: "patientId",
        "patient-registrations": "registrationId",
        facilities: "facilityId",
        memberships: "membershipId",
        encounters: "encounterId",
        prescriptions: "prescriptionId",
        invoices: "invoiceId",
        claims: "claimId",
        admissions: "admissionId",
        procedures: "caseId",
        conversations: "conversationId",
        orders: "orderId",
        reports: "reportId",
        locations: "locationId",
        offerings: "offeringId",
        appointments: "appointmentId",
      };
      if (names[name]) values[names[name]] = String(row.id);
    }
    dispatch(setContext(values));
    setPath((p) => ({ ...p, ...values }));
  }
  const schema = (
    properties: Record<string, Schema>,
    required: string[] = [],
  ): Schema => ({ type: "object", properties, required });
  const data = result?.data as Record<string, unknown> | undefined;
  const pagination = result?.pagination as
    { page?: number; pages?: number } | undefined;
  return (
    <div className="ws-operation">
      <h2>{label(op.title)}</h2>
      {op.description && <p className="ws-help">{op.description}</p>}
      <form
        onSubmit={execute}
        onChange={() => {
          setConfirm(false);
          setResult(undefined);
        }}
      >
        <fieldset disabled={busy}>
          {Object.keys(pathFields).length > 0 && (
            <SchemaField
              name="Selected records"
              schema={schema(pathFields, Object.keys(pathFields))}
              value={path}
              required
              onChange={(v) => setPath(v as Record<string, unknown>)}
            />
          )}{" "}
          {Object.keys(queryFields).length > 0 && (
            <SchemaField
              name="Filters"
              schema={schema(
                queryFields,
                op.parameters
                  .filter((p) => p.in === "query" && p.required)
                  .map((p) => p.name!),
              )}
              value={query}
              required
              onChange={(v) => setQuery(v as Record<string, unknown>)}
            />
          )}{" "}
          {(op.body || op.multipart) && (
            <SchemaField
              name="Details"
              schema={(op.body || op.multipart)!}
              value={body}
              onChange={setBody}
              required
            />
          )}
          {op.multipart && (
            <label>
              File (up to 20 MB)
              <input
                required
                type="file"
                className="ws-input"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </label>
          )}{" "}
          {confirm && (
            <div className="ws-confirm" role="status">
              <strong>Review before submitting</strong>
              <p>
                This will update the selected records. Check the details above
                before confirming.
              </p>
              <button
                type="button"
                className="ws-text"
                onClick={() => setConfirm(false)}
              >
                Keep editing
              </button>
            </div>
          )}
          <button
            className="ws-primary"
            disabled={busy || (Boolean(op.multipart) && !file)}
            type="submit"
          >
            {busy
              ? "Please wait…"
              : op.method === "GET"
                ? "Load records"
                : confirm
                  ? "Confirm and submit"
                  : "Review and continue"}
          </button>
        </fieldset>
      </form>
      {error && (
        <div className="ws-alert" role="alert">
          {error}
        </div>
      )}
      {result && (
        <section aria-live="polite" className="ws-response">
          <h3>{op.method === "GET" ? "Records" : "Request completed"}</h3>
          {result.message && <p>{result.message}</p>}
          <Results value={result.data} select={select} />
          {data && typeof data.id === "string" && (
            <button
              type="button"
              className="ws-secondary"
              onClick={() => select(data)}
            >
              Use this record
            </button>
          )}
          {pagination?.page &&
          pagination.pages &&
          pagination.page < pagination.pages ? (
            <button
              className="ws-secondary"
              disabled={busy}
              onClick={() =>
                execute(undefined, undefined, pagination.page! + 1)
              }
            >
              Next page
            </button>
          ) : null}
          {typeof data?.nextCursor === "string" && (
            <button
              className="ws-secondary"
              disabled={busy}
              onClick={() => execute(undefined, data.nextCursor as string)}
            >
              Next page
            </button>
          )}
        </section>
      )}
    </div>
  );
}
