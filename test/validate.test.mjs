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

test("a $schema that names a different format than recordType gets one clear error", () => {
  const record = {
    ...example("permit-application", "valid-skip-licence-minimal.json"),
    $schema: "https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json",
  };
  const r = validate(record);
  assert.equal(r.valid, false);
  assert.deepEqual(r.errors.map((e) => [e.path, e.keyword]), [["/$schema", "$schema"]]);
  assert.match(r.errors[0].message, /board-action.*permit-application/);
  // Forcing a format still checks against it.
  assert.equal(validate(record, { recordType: "permit-application" }).recordType, "permit-application");
});

test("statusHistory entries must use the format's own statuses", () => {
  const base = example("vendor-risk-review", "valid-due-diligence-minimal.json");
  const at = "2026-01-05T09:00:00Z";
  assert.equal(validate({ ...base, statusHistory: [{ status: "draft", at }, { status: "in-review", at }] }).valid, true);
  const r = validate({ ...base, statusHistory: [{ status: "finaled", at }] });
  assert.ok(r.errors.some((e) => e.path === "/statusHistory/0/status" && e.keyword === "enum"));
});

test("the cross-field rules don't throw on records that aren't schema-valid", () => {
  for (const t of RECORD_TYPES) {
    for (const x of [{}, { members: "x", motions: [null], attachments: 3 }]) assert.doesNotThrow(() => RULES[t](x), t);
  }
});

test("board-action rules catch motions that contradict themselves", () => {
  const base = example("board-action", "valid-council-contract-award.json");
  const motion = (patch) => ({ ...base, motions: [{ ...base.motions[0], ...patch }] });
  const keywords = (r) => r.errors.map((e) => e.keyword);
  assert.ok(keywords(validate(motion({ result: "died-for-lack-of-second" }))).includes("no-second-recorded"));
  assert.ok(keywords(validate(motion({ appliesToMotionId: base.motions[0].id }))).includes("motion-exists"));
  // 3 yes, 0 no: adopted under every threshold the record can count, and failing it is wrong.
  for (const threshold of ["majority-of-votes-cast", "two-thirds-of-votes-cast", "unanimous"]) {
    assert.deepEqual(keywords(validate(motion({ threshold }))), [], threshold);
    assert.ok(keywords(validate(motion({ threshold, result: "failed" }))).includes("threshold-met"), threshold);
  }
  // 3 yes of 5 voting members is a majority of members but not two-thirds of them.
  assert.deepEqual(keywords(validate(motion({ threshold: "majority-of-members" }))), []);
  assert.ok(keywords(validate(motion({ threshold: "two-thirds-of-members" }))).includes("threshold-met"));
  // No threshold stated: nothing to check.
  const { threshold, ...noThreshold } = base.motions[0];
  assert.deepEqual(keywords(validate({ ...base, motions: [{ ...noThreshold, result: "failed" }] })), []);
  // Ids must be unique.
  assert.ok(keywords(validate({ ...base, members: [...base.members, { ...base.members[0], name: "Another Example" }] })).includes("unique-ids"));
});

test("patient-safety rules tie event type to whether the event reached a patient", () => {
  const base = example("patient-safety-incident", "valid-inpatient-fall.json");
  const keywords = (r) => r.errors.map((e) => e.keyword);
  assert.ok(keywords(validate({ ...base, eventType: "unsafe-condition" })).includes("unsafe-condition-no-patient"));
  const { harm, reachedPatient, ...noPatient } = base;
  assert.deepEqual(keywords(validate({ ...noPatient, eventType: "unsafe-condition" })), []);
});

test("permit and vendor status must agree with the decision", () => {
  const permit = example("permit-application", "valid-residential-addition.json");
  const keywords = (r) => r.errors.map((e) => e.keyword);
  assert.ok(keywords(validate({ ...permit, status: "revoked" })).includes("status-matches-decision"));
  assert.deepEqual(keywords(validate({ ...permit, status: "revoked", decision: { ...permit.decision, outcome: "revoked" } })), []);
  const { decision, ...undecided } = permit;
  assert.ok(keywords(validate({ ...undecided, status: "under-inspection" })).includes("issued-has-decision"));
  const vendor = example("vendor-risk-review", "valid-payroll-provider.json");
  assert.ok(keywords(validate({ ...vendor, status: "rejected", decision: { outcome: "approved" } })).includes("status-matches-decision"));
});

test("the statutory clock's time zone is an IANA name", () => {
  const base = example("permit-application", "valid-residential-addition.json");
  const withZone = (timeZone) => ({ ...base, statutoryClock: { ...base.statutoryClock, timeZone } });
  for (const ok of ["America/Chicago", "Europe/London", "America/Argentina/Buenos_Aires", "UTC", "Etc/GMT+5"]) assert.equal(validate(withZone(ok)).valid, true, ok);
  for (const bad of ["CST", "-05:00", "america/chicago", ""]) assert.equal(validate(withZone(bad)).valid, false, bad);
});
