import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RULES, RULE_DOCS, RECORD_TYPES, detectRecordType, validate } from "../dist/index.js";

const example = (t, f) => JSON.parse(readFileSync(new URL(`../examples/${t}/${f}`, import.meta.url), "utf8"));

test("detectRecordType reads $schema first, then recordType", () => {
  assert.equal(detectRecordType({ $schema: "https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v9.9.9/schemas/board-action.schema.json" }), "board-action");
  assert.equal(detectRecordType({ recordType: "permit-application" }), "permit-application");
  assert.equal(detectRecordType({ $schema: "https://example.org/other.json", recordType: "vendor-risk-review" }), "vendor-risk-review");
  for (const x of [null, [], "x", {}, { recordType: "unknown" }]) assert.equal(detectRecordType(x), null);
});

test("validate explains a record it can't classify instead of throwing", () => {
  const r = validate({ hello: "world" });
  assert.equal(r.valid, false);
  assert.equal(r.recordType, null);
  assert.match(r.errors[0].message, /recordType/);
});

test("the recordType option overrides detection", () => {
  const r = validate(example("board-action", "valid-corporate-board-consent.json"), { recordType: "permit-application" });
  assert.equal(r.valid, false);
  assert.equal(r.recordType, "permit-application");
});

test("schemaOnly skips the cross-field rules", () => {
  const record = example("board-action", "invalid-tally-mismatch.json");
  assert.equal(validate(record).valid, false);
  assert.equal(validate(record, { schemaOnly: true }).valid, true);
});

test("unknown fields are named in the message", () => {
  const record = { ...example("vendor-risk-review", "valid-due-diligence-minimal.json"), riskScore: 7 };
  const r = validate(record);
  assert.ok(r.errors.some((e) => e.keyword === "additionalProperties" && e.message.includes("riskScore")));
});

test("namespaced extensions are allowed; bare ones are not", () => {
  const base = example("permit-application", "valid-skip-licence-minimal.json");
  assert.equal(validate({ ...base, extensions: { "examplecity:ward": "3" } }).valid, true);
  assert.equal(validate({ ...base, extensions: { ward: "3" } }).valid, false);
});

test("money amounts are decimal strings", () => {
  const base = example("permit-application", "valid-skip-licence-minimal.json");
  const withAmount = (amount) => ({ ...base, fees: [{ ...base.fees[0], amount: { currency: "GBP", amount } }] });
  for (const ok of ["0", "45.00", "-12.5", "1000000"]) assert.equal(validate(withAmount(ok)).valid, true, ok);
  for (const bad of ["45.", "+45", "1e3", "045", "45,00", ""]) assert.equal(validate(withAmount(bad)).valid, false, bad);
});

test("every rule the validator can report is documented", () => {
  const source = readFileSync(new URL("../src/rules.ts", import.meta.url), "utf8");
  const used = new Set([...source.matchAll(/rule: "([a-z-]+)"/g)].map((m) => m[1]));
  const documented = new Set(RECORD_TYPES.flatMap((t) => Object.keys(RULE_DOCS[t])));
  for (const r of used) assert.ok(documented.has(r), `${r} is not in RULE_DOCS`);
  for (const r of documented) assert.ok(used.has(r), `${r} is documented but never reported`);
  assert.deepEqual(Object.keys(RULES).sort(), [...RECORD_TYPES].sort());
});

test("board-action rules catch voting problems", () => {
  const base = example("board-action", "valid-council-contract-award.json");
  const withVotes = (votes) => ({ ...base, motions: [{ ...base.motions[0], votes, tally: undefined }] });
  const keywords = (r) => r.errors.map((e) => e.keyword);
  const ok = base.motions[0].votes;
  assert.deepEqual(keywords(validate(withVotes(ok))), []);
  assert.ok(keywords(validate(withVotes([...ok, { memberId: "m1", vote: "no" }]))).includes("one-vote-each"));
  assert.ok(keywords(validate(withVotes(ok.map((v) => (v.memberId === "m3" ? { ...v, vote: "recused" } : v))))).includes("recusal-recorded"));
});
