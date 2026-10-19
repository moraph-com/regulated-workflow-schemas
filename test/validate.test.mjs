// Unit tests for validate(), detectRecordType() and the cross-field rules: format detection, option handling, the
// wording of errors people will read, and the edge cases of each rule that the example files don't cover.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { RULES, RULE_DOCS, RECORD_TYPES, detectRecordType, schemas, validate } from "../dist/index.js";

const example = (t, f) => JSON.parse(readFileSync(new URL(`../examples/${t}/${f}`, import.meta.url), "utf8"));

test("detectRecordType reads $schema first, then recordType", () => {
  assert.equal(
    detectRecordType({
      $schema:
        "https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v9.9.9/schemas/board-action.schema.json",
    }),
    "board-action",
  );
  assert.equal(detectRecordType({ recordType: "permit-application" }), "permit-application");
  assert.equal(
    detectRecordType({ $schema: "https://example.org/other.json", recordType: "vendor-risk-review" }),
    "vendor-risk-review",
  );
  for (const x of [null, [], "x", {}, { recordType: "unknown" }]) assert.equal(detectRecordType(x), null);
});

test("validate explains a record it can't classify instead of throwing", () => {
  const r = validate({ hello: "world" });
  assert.equal(r.valid, false);
  assert.equal(r.recordType, null);
  assert.match(r.errors[0].message, /recordType/);
});

test("the recordType option overrides detection", () => {
  const r = validate(example("board-action", "valid-credit-union-board-policy.json"), {
    recordType: "permit-application",
  });
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
  for (const bad of ["45.", "+45", "1e3", "045", "45,00", ""])
    assert.equal(validate(withAmount(bad)).valid, false, bad);
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
  assert.ok(
    keywords(validate(withVotes(ok.map((v) => (v.memberId === "m3" ? { ...v, vote: "recused" } : v))))).includes(
      "recusal-recorded",
    ),
  );
});

test("a $schema that names a different format than recordType gets one clear error", () => {
  const record = {
    ...example("permit-application", "valid-skip-licence-minimal.json"),
    $schema:
      "https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json",
  };
  const r = validate(record);
  assert.equal(r.valid, false);
  assert.deepEqual(
    r.errors.map((e) => [e.path, e.keyword]),
    [["/$schema", "$schema"]],
  );
  assert.match(r.errors[0].message, /board-action.*permit-application/);
  // Forcing a format still checks against it.
  assert.equal(validate(record, { recordType: "permit-application" }).recordType, "permit-application");
});

test("statusHistory entries must use the format's own statuses", () => {
  const base = example("vendor-risk-review", "valid-due-diligence-minimal.json");
  const at = "2026-01-05T09:00:00Z";
  assert.equal(
    validate({
      ...base,
      statusHistory: [
        { status: "draft", at },
        { status: "in-review", at },
      ],
    }).valid,
    true,
  );
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
  // 3 yes of 5 voting members is a majority of the entire membership but not two-thirds of it.
  assert.deepEqual(keywords(validate(motion({ threshold: "majority-of-entire-membership" }))), []);
  assert.ok(keywords(validate(motion({ threshold: "two-thirds-of-entire-membership" }))).includes("threshold-met"));
  // No threshold stated: nothing to check.
  const { threshold, ...noThreshold } = base.motions[0];
  assert.deepEqual(
    keywords(validate({ ...base, outcome: { result: "denied" }, motions: [{ ...noThreshold, result: "failed" }] })),
    [],
  );
  // Ids must be unique.
  assert.ok(
    keywords(
      validate({ ...base, members: [...base.members, { ...base.members[0], name: "Another Example" }] }),
    ).includes("unique-ids"),
  );
});

test("patient-safety rules tie event type to whether the event reached a patient", () => {
  const base = example("patient-safety-incident", "valid-inpatient-fall.json");
  const keywords = (r) => r.errors.map((e) => e.keyword);
  assert.ok(keywords(validate({ ...base, eventType: "unsafe-condition" })).includes("unsafe-condition-no-patient"));
  const { harm, reachedPatient, patient, ...noPatient } = base;
  assert.deepEqual(keywords(validate({ ...noPatient, eventType: "unsafe-condition" })), []);
  // A harm rating needs an event that reached the patient, whatever the event type says.
  assert.ok(
    keywords(validate({ ...base, reachedPatient: false, eventType: "incident" })).includes("harm-only-if-reached"),
  );
});

test("permit and vendor status must agree with the decision", () => {
  const permit = example("permit-application", "valid-residential-addition.json");
  const keywords = (r) => r.errors.map((e) => e.keyword);
  assert.ok(keywords(validate({ ...permit, status: "revoked" })).includes("status-matches-decision"));
  assert.deepEqual(
    keywords(validate({ ...permit, status: "revoked", decision: { ...permit.decision, outcome: "revoked" } })),
    [],
  );
  const { decision, ...undecided } = permit;
  assert.ok(keywords(validate({ ...undecided, status: "under-inspection" })).includes("issued-has-decision"));
  const vendor = example("vendor-risk-review", "valid-payroll-provider.json");
  assert.ok(
    keywords(validate({ ...vendor, status: "rejected", decision: { outcome: "approved" } })).includes(
      "status-matches-decision",
    ),
  );
});

test("the statutory clock's time zone is an IANA name", () => {
  const base = example("permit-application", "valid-residential-addition.json");
  const withZone = (timeZone) => ({ ...base, statutoryClock: { ...base.statutoryClock, timeZone } });
  for (const ok of ["America/Chicago", "Europe/London", "America/Argentina/Buenos_Aires", "UTC", "Etc/GMT+5"])
    assert.equal(validate(withZone(ok)).valid, true, ok);
  for (const bad of ["CST", "-05:00", "america/chicago", ""]) assert.equal(validate(withZone(bad)).valid, false, bad);
});

test("members-present thresholds count abstentions against the motion (RONR 44:9)", () => {
  const base = example("board-action", "valid-council-contract-award.json");
  // m1, m2 yes; m3 abstains; m4 recused; m5 absent. Present and responding: 3.
  const votes = base.motions[0].votes.map((v) => (v.memberId === "m3" ? { ...v, vote: "abstain" } : v));
  const tally = { yes: 2, no: 0, abstain: 1, absent: 1, recused: 1 };
  const motion = (threshold, result) => ({
    ...base,
    motions: [{ ...base.motions[0], votes, tally, threshold, result }],
  });
  const keywords = (r) => r.errors.map((e) => e.keyword);
  // 2 yes, 0 no: a majority of votes cast and two-thirds of votes cast.
  assert.deepEqual(keywords(validate(motion("two-thirds-of-votes-cast", "adopted"))), []);
  // 2 of 3 present is a majority of those present and exactly two-thirds of them.
  assert.deepEqual(keywords(validate(motion("majority-of-members-present", "adopted"))), []);
  assert.deepEqual(keywords(validate(motion("two-thirds-of-members-present", "adopted"))), []);
  // A bare tally can't show who was present, so members-present thresholds aren't checked without votes.
  const tallyOnly = {
    ...base,
    motions: [
      {
        ...base.motions[0],
        votes: undefined,
        tally: { yes: 1, no: 0 },
        threshold: "majority-of-members-present",
        result: "adopted",
      },
    ],
  };
  delete tallyOnly.motions[0].votes;
  assert.deepEqual(keywords(validate(tallyOnly)), []);
});

test("errors are worded for people, not only for programs", () => {
  const permit = example("permit-application", "valid-skip-licence-minimal.json");
  const messages = (r) => r.errors.map((e) => `${e.path} ${e.message}`);
  assert.deepEqual(messages(validate({ ...permit, applicant: { role: "owner" } })), [
    "/applicant needs at least one of: person, organization",
  ]);
  assert.deepEqual(messages(validate({ ...permit, submittedAt: "2026-03-02 17:12" })), [
    "/submittedAt must be a date and time with a UTC offset, for example 2026-03-04T15:20:00Z or 2026-03-04T09:20:00-06:00",
  ]);
  assert.deepEqual(messages(validate({ ...permit, jurisdiction: { country: "uk" } })), [
    "/jurisdiction/country must be a two-letter ISO 3166-1 country code in capitals, for example US or GB",
  ]);
  assert.deepEqual(
    messages(validate({ ...permit, fees: [{ ...permit.fees[0], amount: { currency: "GBP", amount: "£45" } }] })),
    [
      '/fees/0/amount/amount must be a decimal amount written as text, for example "1250.00" (no currency symbol, commas or exponent)',
    ],
  );
  const vendor = example("vendor-risk-review", "valid-payroll-provider.json");
  assert.deepEqual(
    messages(validate({ ...vendor, decision: { outcome: "approved-with-conditions", conditions: [] } })),
    ['/decision/conditions must not be empty (because outcome is "approved-with-conditions")'],
  );
  for (const x of [[1], "x", null, 3]) assert.match(validate(x).errors[0].message, /must be a JSON object/);
});

test("the exported schemas are read-only", () => {
  const before = JSON.stringify(schemas["board-action"]);
  assert.throws(() => schemas["board-action"].required.push("x"));
  assert.throws(() => {
    schemas["board-action"].properties.members.minItems = 0;
  });
  assert.equal(JSON.stringify(schemas["board-action"]), before);
});

// The main entry point must not need eval or new Function, which Cloudflare Workers and strict Content-Security-Policy
// pages forbid. Node's --disallow-code-generation-from-strings makes both throw, like those runtimes do.
test("validate() works where run-time code generation is forbidden", () => {
  const script = `
    import { validate } from "./dist/index.js";
    import { readFileSync } from "node:fs";
    const r = validate(JSON.parse(readFileSync("examples/board-action/valid-council-contract-award.json", "utf8")));
    const bad = validate({ recordType: "board-action" });
    if (!r.valid || bad.valid) process.exit(1);
  `;
  const root = new URL("..", import.meta.url).pathname;
  const r = spawnSync(
    process.execPath,
    ["--disallow-code-generation-from-strings", "--input-type=module", "-e", script],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stderr);
});

test("the main entry point doesn't load the Ajv compiler or node:fs", () => {
  const root = new URL("..", import.meta.url).pathname;
  const sources = ["index.js", "schemas.js", "rules.js"]
    .map((f) => readFileSync(`${root}dist/${f}`, "utf8"))
    .join("\n");
  assert.doesNotMatch(sources, /from "ajv\/dist\/2020|node:fs/);
});
