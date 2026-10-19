import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const run = (args) => spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });

test("rws-validate exits 0 when every file is valid", () => {
  const r = run(["dist/cli.js", "examples/board-action/valid-council-contract-award.json", "examples/permit-application/valid-skip-licence-minimal.json"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /✓ .*valid-council-contract-award\.json \(board-action\)/);
});

test("rws-validate exits 1 and explains when a file is invalid", () => {
  const r = run(["dist/cli.js", "examples/board-action/invalid-self-second.json"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /\/motions\/0\/secondedBy .*\[rule:second-differs\]/);
});

test("rws-validate --json prints machine-readable results", () => {
  const r = run(["dist/cli.js", "--json", "examples/vendor-risk-review/invalid-unknown-criticality.json"]);
  assert.equal(r.status, 1);
  const [result] = JSON.parse(r.stdout);
  assert.equal(result.recordType, "vendor-risk-review");
  assert.equal(result.errors[0].keyword, "enum");
});

test("rws-validate exits 2 on usage and read errors", () => {
  assert.equal(run(["dist/cli.js"]).status, 2);
  assert.equal(run(["dist/cli.js", "--schema", "nope", "x.json"]).status, 2);
  assert.equal(run(["dist/cli.js", "does-not-exist.json"]).status, 2);
});

test("generated TypeScript types are up to date", () => {
  const r = run(["scripts/build-types.mjs", "--check"]);
  assert.equal(r.status, 0, r.stderr);
});

test("generated docs are up to date", () => {
  const r = run(["scripts/build-docs.mjs", "--check"]);
  assert.equal(r.status, 0, r.stderr);
});
