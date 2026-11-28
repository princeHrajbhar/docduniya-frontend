import catalog from "@/generated/operations.json";
export type Schema = {
  type?: string | string[];
  additionalProperties?: boolean | Schema;
  title?: string;
  description?: string;
  format?: string;
  pattern?: string;
  default?: unknown;
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  anyOf?: Schema[];
  oneOf?: Schema[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
};
export type Operation = {
  id: string;
  path: string;
  method: string;
  title: string;
  group: string;
  description?: string;
  permissions: string[];
  parameters: {
    name?: string;
    in?: string;
    required?: boolean;
    schema?: Schema;
  }[];
  body?: Schema;
  multipart?: Schema;
};
export const operations = catalog as unknown as Operation[];
export const label = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\bId\b/g, "reference")
    .replace(/^./, (s) => s.toUpperCase());
export function defaults(schema: Schema): unknown {
  if (schema.oneOf || schema.anyOf)
    return defaults((schema.oneOf || schema.anyOf)![0]);
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.type === "object" || schema.properties)
    return Object.fromEntries(
      Object.entries(schema.properties || {})
        .filter(
          ([key, v]) =>
            schema.required?.includes(key) || v.default !== undefined,
        )
        .map(([k, v]) => [k, defaults(v)]),
    );
  if (schema.type === "array")
    return Array.from({ length: schema.minItems || 0 }, () =>
      defaults(schema.items || {}),
    );
  if (schema.type === "boolean") return false;
  return undefined;
}
export function pathFor(operation: Operation, values: Record<string, unknown>) {
  return operation.path.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = values[key];
    if (
      !value ||
      [".", ".."].includes(String(value)) ||
      !/^[a-zA-Z0-9_.@+-]+$/.test(String(value))
    )
      throw new Error(`Choose ${label(key).toLowerCase()}`);
    return encodeURIComponent(String(value));
  });
}
export function availableOperations(area: string) {
  return operations.filter(
    (op) =>
      !/^\/(auth|webhooks|health)(\/|$)/.test(op.path) &&
      (area === "provider"
        ? /^\/(organizations|me\/(memberships|workspaces)|practitioners|doctors\/me)/.test(
            op.path,
          )
        : area === "patient"
          ? /^\/(patients|me\/(patients|appointments|notifications)|appointments|waitlist|conversations|documents|notifications|support|payment-intents|discovery)/.test(
              op.path,
            )
          : !op.path.startsWith("/organizations/")),
  );
}
