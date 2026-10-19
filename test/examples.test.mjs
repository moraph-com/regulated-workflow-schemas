// Every example record in examples/ is checked here.
//
// - valid-*.json must pass validate() with no errors, and its format must be detectable from the record alone.
// - invalid-*.json must fail with exactly the errors listed in its invalid-*.expect.json (source, keyword and path),
//   no more and no fewer. Exact matching matters: an invalid example that fails for an extra, accidental reason would
//   keep "passing" even after the rule it was written to demonstrate stopped working.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { RECORD_TYPES, validate, detectRecordType } from "../dist/index.js";

const dir = (t) => new URL(`../examples/${t}/`, import.meta.url);
const json = (url) => JSON.parse(readFileSync(url, "utf8"));
const key = (e) => `${e.source}:${e.keyword}@${e.path}`;

for (const t of RECORD_TYPES) {
  const files = readdirSync(dir(t));
  const valid = files.filter((f) => /^valid-.*\.json$/.test(f));
  const invalid = files.filter((f) => /^invalid-.*\.json$/.test(f) && !f.endsWith(".expect.json"));

  test(`${t}: has at least two valid and two invalid examples, each invalid one with an .expect.json`, () => {
    assert.ok(valid.length >= 2, `${valid.length} valid`);
    assert.ok(invalid.length >= 2, `${invalid.length} invalid`);
    for (const f of invalid)
      assert.ok(existsSync(new URL(f.replace(/\.json$/, ".expect.json"), dir(t))), `${f} has no .expect.json`);
    for (const f of files.filter((x) => x.endsWith(".expect.json")))
      assert.ok(files.includes(f.replace(".expect.json", ".json")), `${f} has no example`);
    for (const f of files)
      assert.match(
        f,
        /^(valid|invalid)-[a-z0-9-]+(\.expect)?\.json$/,
        `${f} is not named valid-*.json or invalid-*.json`,
      );
  });

  for (const f of valid) {
    test(`${t}: ${f} is valid`, () => {
      const record = json(new URL(f, dir(t)));
      assert.equal(detectRecordType(record), t);
      const r = validate(record);
      assert.deepEqual(r.errors, []);
      assert.equal(r.valid, true);
    });
  }

  for (const f of invalid) {
    test(`${t}: ${f} fails for exactly its stated reason`, () => {
      const { reason, errors } = json(new URL(f.replace(/\.json$/, ".expect.json"), dir(t)));
      assert.ok(typeof reason === "string" && reason.length > 10, "the .expect.json explains the reason");
      assert.ok(Array.isArray(errors) && errors.length > 0, "the .expect.json lists the errors");
      const r = validate(json(new URL(f, dir(t))));
      assert.equal(r.valid, false);
      assert.deepEqual(r.errors.map(key).sort(), errors.map(key).sort());
      for (const e of r.errors)
        assert.ok(e.message.length > 0 && !/^must match "then" schema$/.test(e.message), e.message);
    });
  }
}
