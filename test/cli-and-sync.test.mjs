// Tests for the rws-validate command line (exit codes, output, stdin, globbing, byte order marks), for the
// published package's entry points, and that the generated types/ and docs/ match the schemas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const run = (args) => spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });

test("rws-validate exits 0 when every file is valid", () => {
  const r = run([
    "dist/cli.js",
    "examples/board-action/valid-council-contract-award.json",
    "examples/permit-application/valid-skip-licence-minimal.json",
  ]);
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
  const missing = run(["dist/cli.js", "does-not-exist.json"]);
  assert.equal(missing.status, 2);
  assert.match(missing.stdout, /does-not-exist\.json: can't check: file not found/);
  assert.equal(run(["dist/cli.js", "-", "-"]).status, 2);
});

test("rws-validate reports a file that isn't JSON without hiding the other results", () => {
  const dir = mkdtempSync(join(tmpdir(), "rws-"));
  writeFileSync(join(dir, "broken.json"), "{ not json");
  const r = run(["dist/cli.js", join(dir, "broken.json"), "examples/board-action/valid-council-contract-award.json"]);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /broken\.json: can't check: not valid JSON/);
  assert.match(r.stdout, /✓ .*valid-council-contract-award\.json/);
  assert.match(r.stdout, /1 valid, 0 invalid, 1 not checked \(2 files\)/);
});

test("rws-validate accepts files saved with a UTF-8 byte order mark", () => {
  const dir = mkdtempSync(join(tmpdir(), "rws-"));
  const file = join(dir, "bom.json");
  writeFileSync(
    file,
    `\uFEFF${readFileSync(new URL("../examples/board-action/valid-council-contract-award.json", import.meta.url), "utf8")}`,
  );
  assert.equal(run(["dist/cli.js", file]).status, 0);
});

test(
  "rws-validate expands a quoted * pattern itself when the shell didn't",
  { skip: typeof (await import("node:fs")).globSync !== "function" && "needs Node.js 22" },
  () => {
    const r = run(["dist/cli.js", "examples/*/valid-*.json"]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /8 valid, 0 invalid \(8 files\)/);
  },
);

test("generated TypeScript types are up to date", () => {
  const r = run(["scripts/build-types.mjs", "--check"]);
  assert.equal(r.status, 0, r.stderr);
});

test("generated docs are up to date", () => {
  const r = run(["scripts/build-docs.mjs", "--check"]);
  assert.equal(r.status, 0, r.stderr);
});

test("rws-validate reads a record from stdin with -", () => {
  const input = readFileSync(
    new URL("../examples/board-action/valid-council-contract-award.json", import.meta.url),
    "utf8",
  );
  const r = spawnSync(process.execPath, ["dist/cli.js", "-"], { cwd: root, encoding: "utf8", input });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /✓ - \(board-action\)/);
});

test("the package's exports resolve by name", async () => {
  const pkg = await import("@moraph/regulated-workflow-schemas");
  assert.equal(typeof pkg.validate, "function");
  const { createAjv } = await import("@moraph/regulated-workflow-schemas/ajv");
  assert.equal(typeof createAjv().getSchema(pkg.schemas["board-action"].$id), "function");
  const schemaPath = new URL(
    import.meta.resolve("@moraph/regulated-workflow-schemas/schemas/board-action.schema.json"),
  );
  assert.equal(JSON.parse(readFileSync(schemaPath, "utf8")).title, "Board action");
  const { default: meta } = await import("@moraph/regulated-workflow-schemas/package.json", { with: { type: "json" } });
  assert.equal(meta.name, "@moraph/regulated-workflow-schemas");
});

test("the README's field counts match the docs", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  for (const t of ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"]) {
    const doc = readFileSync(new URL(`../docs/${t}.md`, import.meta.url), "utf8");
    const fields = doc
      .split("## Fields")[1]
      .split("## Conditional requirements")[0]
      .split("\n")
      .filter((l) => l.startsWith("| `")).length;
    const row = readme.split("\n").find((l) => l.startsWith(`| [\`${t}\`]`));
    assert.equal(Number(row.split("|").at(-2).trim()), fields, t);
  }
});
