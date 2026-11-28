import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  operations,
  availableOperations,
  defaults,
  pathFor,
} from "../src/lib/workspace/contract";

test("generated manifest covers every published operation without duplicates", () => {
  const source = JSON.parse(
    readFileSync("../docduniya-backend/docs/api/openapi.json", "utf8"),
  );
  const published = Object.entries(source.paths)
    .flatMap(([path, methods]) =>
      Object.keys(methods as object)
        .filter((m) => ["get", "post", "put", "patch", "delete"].includes(m))
        .map((m) => `${m.toUpperCase()} ${path}`),
    )
    .sort();
  assert.deepEqual(
    operations.map((o) => `${o.method} ${o.path}`).sort(),
    published,
  );
  assert.equal(new Set(operations.map((o) => o.id)).size, operations.length);
});
test("interactive operations are reachable in a workspace, with server-only endpoints excluded", () => {
  const reachable = new Set(
    ["patient", "provider", "admin"].flatMap((area) =>
      availableOperations(area).map((o) => o.id),
    ),
  );
  for (const op of operations) {
    const external = /^\/(auth|webhooks|health)(\/|$)/.test(op.path);
    assert.equal(reachable.has(op.id), !external, op.path);
  }
});
test("path construction rejects missing identifiers and URL traversal", () => {
  const op = operations.find(
    (o) => o.path === "/organizations/{organizationId}/claims",
  )!;
  assert.throws(() => pathFor(op, {}));
  for (const value of [
    "..",
    "../auth/me",
    "%2e%2e",
    "a/b",
    "https://example.test",
  ])
    assert.throws(() => pathFor(op, { organizationId: value }));
  assert.equal(
    pathFor(op, { organizationId: "012345678901234567890123" }),
    "/organizations/012345678901234567890123/claims",
  );
  const emailOperation = operations.find(
    (o) => o.path === "/email/suppressions/{email}",
  )!;
  assert.equal(
    pathFor(emailOperation, { email: "review+test@example.test" }),
    "/email/suppressions/review%2Btest%40example.test",
  );
});
test("asset replacement uses the multipart controller contract", () => {
  const op = operations.find((o) => o.path === "/assets/{id}/file")!;
  assert.ok(op.multipart);
  assert.equal(op.body, undefined);
});
test("discriminated forms retain literal values and do not invent optional fields", () => {
  assert.deepEqual(
    defaults({
      anyOf: [
        {
          type: "object",
          properties: {
            kind: { const: "PATIENT" },
            privateNote: { type: "string" },
          },
          required: ["kind"],
        },
      ],
    }),
    { kind: "PATIENT" },
  );
  assert.deepEqual(
    defaults({
      type: "array",
      minItems: 2,
      items: { type: "object", properties: { confirmed: { default: false } } },
    }),
    [{ confirmed: false }, { confirmed: false }],
  );
});
