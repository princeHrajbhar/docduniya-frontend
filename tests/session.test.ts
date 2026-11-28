import { test } from "node:test";
import assert from "node:assert/strict";
import { ADMIN_LOGIN_PATH, loginPathFor, safeNext } from "../src/lib/session-core";

test("administrators sign in through the separate portal; others keep their sign-in pages", () => {
  assert.equal(ADMIN_LOGIN_PATH, "/administrator/login");
  assert.equal(loginPathFor("admin"), "/administrator/login");
  assert.equal(loginPathFor("patient"), "/login/patient");
  assert.equal(loginPathFor("doctor"), "/login/doctor");
});

test("after the administrator sign-in only same-site console paths are followed", () => {
  assert.equal(safeNext("/admin/users", "admin"), "/admin/users");
  assert.equal(safeNext("/patient/dashboard", "admin"), "/admin/dashboard");
  assert.equal(safeNext("//evil.example/admin", "admin"), "/admin/dashboard");
  assert.equal(safeNext("https://evil.example", "admin"), "/admin/dashboard");
});
