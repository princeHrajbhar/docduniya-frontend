"use client";
import { label } from "@/lib/workspace/contract";
export function Results({
  value,
  select,
}: {
  value: unknown;
  select?: (row: Record<string, unknown>) => void;
}) {
  if (value === undefined || value === null)
    return <p className="ws-help">No records to display.</p>;
  if (Array.isArray(value))
    return value.length ? (
      <div className="ws-results">
        {value.map((row, i) => (
          <article
            className="ws-record"
            key={String((row as Record<string, unknown>)?.id || i)}
          >
            {select && row && typeof row === "object" && (
              <button
                className="ws-secondary"
                type="button"
                onClick={() => select(row as Record<string, unknown>)}
              >
                Select record
              </button>
            )}
            <Results value={row} />
          </article>
        ))}
      </div>
    ) : (
      <p className="ws-empty">
        No records found. Change your filters or create a record to get started.
      </p>
    );
  if (typeof value === "object")
    return (
      <dl className="ws-details">
        {Object.entries(value)
          .filter(
            ([key]) =>
              !/token|secret|password|authorizationFence|createdBy|updatedBy/i.test(
                key,
              ),
          )
          .map(([key, item]) => (
            <div key={key}>
              <dt>{label(key)}</dt>
              <dd>
                <Results value={item} select={select} />
              </dd>
            </div>
          ))}
      </dl>
    );
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (typeof value === "string" && /^https:\/\//i.test(value))
    return (
      <a
        className="ws-text"
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
      >
        Open resource ↗
      </a>
    );
  return <span className="ws-value">{String(value)}</span>;
}
