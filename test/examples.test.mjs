import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { RECORD_TYPES, validate, detectRecordType } from "../dist/index.js";

const dir = (t) => new URL(`../examples/${t}/`, import.meta.url);
const json = (url) => JSON.parse(readFileSync(url, "utf8"));

for (const t of RECORD_TYPES) {
  const files = readdirSync(dir(t));
  const valid = files.filter((f) => /^valid-.*\.json$/.test(f));
  const invalid = files.filter((f) => /^invalid-.*\.json$/.test(f) && !f.endsWith(".expect.json"));

  test(`${t}: has at least two valid and two invalid examples, each invalid one with an .expect.json`, () => {
    assert.ok(valid.length >= 2, `${valid.length} valid`);
    assert.ok(invalid.length >= 2, `${invalid.length} invalid`);
    for (const f of invalid) assert.ok(existsSync(new URL(f.replace(/\.json$/, ".expect.json"), dir(t))), `${f} has no .expect.json`);
    for (const f of files.filter((x) => x.endsWith(".expect.json"))) assert.ok(files.includes(f.replace(".expect.json", ".json")), `${f} has no example`);
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
    test(`${t}: ${f} fails for its stated reason`, () => {
      const { reason, expect } = json(new URL(f.replace(/\.json$/, ".expect.json"), dir(t)));
      assert.ok(reason.length > 10, "the .expect.json explains the reason");
      const r = validate(json(new URL(f, dir(t))));
      assert.equal(r.valid, false);
      assert.ok(
        r.errors.some((e) => e.source === expect.source && e.keyword === expect.keyword && e.path === expect.path),
        `expected ${expect.source}:${expect.keyword} at "${expect.path}", got ${JSON.stringify(r.errors)}`,
      );
    });
  }
}
