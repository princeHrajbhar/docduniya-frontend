import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const contract = JSON.parse(
  readFileSync(
    new URL("../../docduniya-backend/docs/api/openapi.json", import.meta.url),
    "utf8",
  ),
);
function resolve(value, depth = 0) {
  if (depth > 24) throw new Error("Contract reference cycle");
  if (Array.isArray(value)) return value.map((v) => resolve(v, depth + 1));
  if (!value || typeof value !== "object") return value;
  if (value.$ref)
    return resolve(
      value.$ref
        .split("/")
        .slice(1)
        .reduce((v, key) => v[key], contract),
      depth + 1,
    );
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k]) => !["$schema", "responses"].includes(k))
      .map(([k, v]) => [k, resolve(v, depth + 1)]),
  );
}
const operations = Object.entries(contract.paths).flatMap(([path, methods]) =>
  Object.entries(methods)
    .filter(([method]) =>
      ["get", "post", "put", "patch", "delete"].includes(method),
    )
    .map(([method, op]) => ({
      id: op.operationId,
      path,
      method: method.toUpperCase(),
      title:
        op.summary ||
        path
          .split("/")
          .filter((p) => !p.startsWith("{"))
          .slice(-1)[0]
          .replaceAll("-", " "),
      group: op.tags?.[0] || "Other",
      description: op.description,
      parameters: resolve(op.parameters || []),
      body:
        path === "/assets/{id}/file"
          ? undefined
          : resolve(op.requestBody?.content?.["application/json"]?.schema),
      multipart: resolve(
        // The replacement controller consumes req.file; the published contract currently says JSON.
        path === "/assets/{id}/file"
          ? { type: "object" }
          : op.requestBody?.content?.["multipart/form-data"]?.schema,
      ),
      permissions: op["x-permissions"] || [],
    })),
);
mkdirSync(new URL("../src/generated/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../src/generated/operations.json", import.meta.url),
  `${JSON.stringify(operations, null, 2)}\n`,
);
console.log(
  `Synchronized ${operations.length} operations from backend contract`,
);
