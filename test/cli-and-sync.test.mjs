import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

test("rws-validate reads a record from stdin with -", () => {
  const input = readFileSync(new URL("../examples/board-action/valid-council-contract-award.json", import.meta.url), "utf8");
  const r = spawnSync(process.execPath, ["dist/cli.js", "-"], { cwd: root, encoding: "utf8", input });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /✓ - \(board-action\)/);
});

test("the package's exports resolve by name", async () => {
  const pkg = await import("@moraph/regulated-workflow-schemas");
  assert.equal(typeof pkg.validate, "function");
  const schemaPath = new URL(import.meta.resolve("@moraph/regulated-workflow-schemas/schemas/board-action.schema.json"));
  assert.equal(JSON.parse(readFileSync(schemaPath, "utf8")).title, "Board action");
  const { default: meta } = await import("@moraph/regulated-workflow-schemas/package.json", { with: { type: "json" } });
  assert.equal(meta.name, "@moraph/regulated-workflow-schemas");
});

test("the README's field counts match the docs", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  for (const t of ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"]) {
    const doc = readFileSync(new URL(`../docs/${t}.md`, import.meta.url), "utf8");
    const fields = doc.split("## Fields")[1].split("## Conditional requirements")[0].split("\n").filter((l) => l.startsWith("| `")).length;
    const row = readme.split("\n").find((l) => l.startsWith(`| [\`${t}\`]`));
    assert.equal(Number(row.split("|").at(-2).trim()), fields, t);
  }
});
