"use client";
import { useId, useState } from "react";
import { defaults, label, type Schema } from "@/lib/workspace/contract";
export function SchemaField({
  name,
  schema,
  value,
  onChange,
  required = false,
}: {
  name: string;
  schema: Schema;
  value: unknown;
  onChange: (value: unknown) => void;
  required?: boolean;
}) {
  const id = useId();
  const variants = schema.oneOf || schema.anyOf;
  const [variant, setVariant] = useState(0);
  const [entryKey, setEntryKey] = useState("");
  if (Array.isArray(schema.type))
    return (
      <SchemaField
        name={name}
        schema={{ ...schema, type: schema.type.find((t) => t !== "null") }}
        value={value}
        onChange={onChange}
        required={required}
      />
    );
  if (variants)
    return (
      <fieldset className="ws-fieldset">
        <legend>{label(name)}</legend>
        <select
          aria-label={`${label(name)} type`}
          value={variant}
          onChange={(e) => {
            const i = Number(e.target.value);
            setVariant(i);
            onChange(defaults(variants[i]));
          }}
        >
          {variants.map((s, i) => (
            <option key={i} value={i}>
              {s.title ||
                String(
                  s.properties?.kind?.const ||
                    s.properties?.type?.const ||
                    `Option ${i + 1}`,
                )}
            </option>
          ))}
        </select>
        <SchemaField
          name={name}
          schema={variants[variant]}
          value={value}
          onChange={onChange}
          required={required}
        />
      </fieldset>
    );
  if (schema.const !== undefined)
    return (
      <p className="ws-help">
        {label(name)}: {String(schema.const)}
      </p>
    );
  if (schema.type === "object" || schema.properties) {
    const object = (value || {}) as Record<string, unknown>;
    return (
      <fieldset className="ws-fieldset">
        <legend>
          {label(name)}
          {required ? " *" : ""}
        </legend>
        {!required && value === undefined ? (
          <button
            type="button"
            className="ws-secondary"
            onClick={() => onChange(defaults(schema) || {})}
          >
            Add {label(name).toLowerCase()}
          </button>
        ) : (
          <>
            <div className="ws-fields">
              {Object.entries(schema.properties || {}).map(([key, field]) => (
                <SchemaField
                  key={key}
                  name={key}
                  schema={field}
                  value={object[key]}
                  required={schema.required?.includes(key)}
                  onChange={(next) => {
                    const updated = { ...object, [key]: next };
                    if (next === undefined) delete updated[key];
                    onChange(updated);
                  }}
                />
              ))}
            </div>
            {schema.additionalProperties && (
              <div className="ws-field">
                {Object.entries(object)
                  .filter(([key]) => !schema.properties?.[key])
                  .map(([key, item]) => (
                    <div key={key} className="ws-array">
                      <SchemaField
                        name={key}
                        schema={
                          typeof schema.additionalProperties === "object"
                            ? schema.additionalProperties
                            : { type: "string" }
                        }
                        value={item}
                        onChange={(next) =>
                          onChange({ ...object, [key]: next })
                        }
                      />
                      <button
                        type="button"
                        className="ws-text"
                        onClick={() => {
                          const updated = { ...object };
                          delete updated[key];
                          onChange(updated);
                        }}
                      >
                        Remove entry
                      </button>
                    </div>
                  ))}
                <label htmlFor={`${id}-key`}>New entry name</label>
                <input
                  id={`${id}-key`}
                  className="ws-input"
                  value={entryKey}
                  onChange={(e) => setEntryKey(e.target.value)}
                />
                <button
                  type="button"
                  className="ws-secondary"
                  disabled={
                    !entryKey.trim() ||
                    Object.hasOwn(object, entryKey.trim()) ||
                    ["__proto__", "constructor", "prototype"].includes(
                      entryKey.trim(),
                    )
                  }
                  onClick={() => {
                    onChange({ ...object, [entryKey.trim()]: "" });
                    setEntryKey("");
                  }}
                >
                  Add entry
                </button>
              </div>
            )}
            {!required && (
              <button
                type="button"
                className="ws-text"
                onClick={() => onChange(undefined)}
              >
                Remove section
              </button>
            )}
          </>
        )}
      </fieldset>
    );
  }
  if (schema.type === "array") {
    const values = (Array.isArray(value) ? value : []) as unknown[];
    return (
      <fieldset className="ws-fieldset">
        <legend>
          {label(name)}
          {required ? " *" : ""}
        </legend>
        {values.map((item, i) => (
          <div key={i} className="ws-array">
            <SchemaField
              name={`${name} ${i + 1}`}
              schema={schema.items || { type: "string" }}
              value={item}
              onChange={(next) =>
                onChange(values.map((v, j) => (i === j ? next : v)))
              }
              required
            />
            <button
              type="button"
              className="ws-text"
              disabled={values.length <= (schema.minItems || 0)}
              onClick={() => onChange(values.filter((_, j) => i !== j))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ws-secondary"
          disabled={values.length >= (schema.maxItems || 100)}
          onClick={() => onChange([...values, defaults(schema.items || {})])}
        >
          Add {label(name).toLowerCase()}
        </button>
      </fieldset>
    );
  }
  const input = { id, required, className: "ws-input" };
  if (schema.type === "boolean")
    return (
      <label className="ws-check" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label(name)}
      </label>
    );
  return (
    <div className="ws-field">
      <label htmlFor={id}>
        {label(name)}
        {required ? " *" : ""}
      </label>
      {schema.enum ? (
        <select
          {...input}
          value={value === undefined ? "" : String(value)}
          onChange={(e) =>
            onChange(schema.enum!.find((v) => String(v) === e.target.value))
          }
        >
          <option value="">Choose…</option>
          {schema.enum.map((v) => (
            <option key={String(v)} value={String(v)}>
              {label(String(v))}
            </option>
          ))}
        </select>
      ) : (schema.maxLength || 0) > 500 ? (
        <textarea
          {...input}
          rows={4}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      ) : (
        <input
          {...input}
          type={
            schema.type === "integer" || schema.type === "number"
              ? "number"
              : schema.format === "date"
                ? "date"
                : schema.format === "date-time"
                  ? "datetime-local"
                  : schema.format === "email"
                    ? "email"
                    : /password|secret/i.test(name)
                      ? "password"
                      : "text"
          }
          step={schema.type === "integer" ? 1 : "any"}
          min={schema.minimum}
          max={schema.maximum}
          minLength={schema.minLength}
          maxLength={schema.maxLength}
          value={
            schema.format === "date-time" && value
              ? toLocal(String(value))
              : String(value ?? "")
          }
          onChange={(e) =>
            onChange(
              !e.target.value
                ? undefined
                : schema.type === "integer" || schema.type === "number"
                  ? Number(e.target.value)
                  : schema.format === "date-time"
                    ? new Date(e.target.value).toISOString()
                    : e.target.value,
            )
          }
        />
      )}{" "}
      {schema.description && <small>{schema.description}</small>}
      {/Minor$/.test(name) && <small>Amount in paise. ₹1 = 100 paise.</small>}
    </div>
  );
}
function toLocal(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
}
