// Checks on the schema files themselves: they compile in Ajv's strict mode, work unchanged in a second, independent
// JSON Schema implementation, carry pinned $ids, and follow the repository's design rules (every property described,
// every object closed, enum values in kebab-case, sensitivity annotations from the allowed set).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { registerSchema, validate as hyperjumpValidate } from "@hyperjump/json-schema/draft-2020-12";
import { RECORD_TYPES, commonSchema, schemas, validate } from "../dist/index.js";
import { ANNOTATION_KEYWORDS, STRICT, createAjv } from "../dist/ajv.js";

const read = (f) => JSON.parse(readFileSync(new URL(`../schemas/${f}`, import.meta.url), "utf8"));
const ALL = ["common", ...RECORD_TYPES];

test("the schemas directory holds exactly common plus one schema per record type", () => {
  const files = readdirSync(new URL("../schemas/", import.meta.url)).sort();
  assert.deepEqual(files, ALL.map((t) => `${t}.schema.json`).sort());
});

test("the bundled schemas are identical to the files in schemas/", () => {
  assert.deepEqual(commonSchema, read("common.schema.json"));
  for (const t of RECORD_TYPES) assert.deepEqual(schemas[t], read(`${t}.schema.json`), t);
});

test("every schema compiles in Ajv strict mode", () => {
  const ajv = new Ajv2020({ ...STRICT });
  addFormats(ajv);
  ajv.addVocabulary([...ANNOTATION_KEYWORDS]);
  ajv.addSchema(read("common.schema.json"));
  for (const t of RECORD_TYPES) assert.doesNotThrow(() => ajv.compile(read(`${t}.schema.json`)), t);
  assert.doesNotThrow(() => createAjv());
});

// Interoperability: the schemas are meant for validators in any language. @hyperjump/json-schema is an independent
// 2020-12 implementation; if it and Ajv disagree on any example, the schemas rely on something Ajv-specific.
test("a second JSON Schema implementation agrees with Ajv on every example", async () => {
  for (const f of ALL) registerSchema(read(`${f}.schema.json`));
  for (const t of RECORD_TYPES) {
    const dir = new URL(`../examples/${t}/`, import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && !x.endsWith(".expect.json"))) {
      const record = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
      const ours = validate(record, { schemaOnly: true }).valid;
      const theirs = (await hyperjumpValidate(schemas[t].$id, record)).valid;
      assert.equal(theirs, ours, `${t}/${f}`);
    }
  }
});

test("createAjv() and the precompiled validators accept exactly the same examples", () => {
  const ajv = createAjv();
  for (const t of RECORD_TYPES) {
    const check = ajv.getSchema(schemas[t].$id);
    const dir = new URL(`../examples/${t}/`, import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json") && !x.endsWith(".expect.json"))) {
      const record = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
      assert.equal(check(record), validate(record, { schemaOnly: true }).valid, `${t}/${f}`);
    }
  }
});

test("every schema is draft 2020-12 with an $id pinned to a release tag", () => {
  for (const f of ALL) {
    const s = read(`${f}.schema.json`);
    assert.equal(s.$schema, "https://json-schema.org/draft/2020-12/schema", f);
    assert.match(
      s.$id,
      new RegExp(
        `^https://raw\\.githubusercontent\\.com/moraph-com/regulated-workflow-schemas/v\\d+\\.\\d+\\.\\d+/schemas/${f}\\.schema\\.json$`,
      ),
      f,
    );
  }
});

test("every record schema has the common envelope", () => {
  for (const t of RECORD_TYPES) {
    const s = schemas[t];
    assert.equal(s.additionalProperties, false, t);
    assert.equal(s.properties.recordType.const, t, t);
    assert.match(s.properties.schemaVersion.const, /^\d+\.\d+\.\d+$/, t);
    for (const k of ["recordType", "schemaVersion", "id", "status"])
      assert.ok(s.required.includes(k), `${t} requires ${k}`);
    for (const k of [
      "$schema",
      "externalIds",
      "createdAt",
      "updatedAt",
      "statusHistory",
      "attachments",
      "auditTrail",
      "extensions",
    ])
      assert.ok(s.properties[k], `${t} has ${k}`);
  }
});

test("every property and definition has a description, and every object closes its properties", () => {
  const problems = [];
  const visit = (node, path) => {
    if (!node || typeof node !== "object") return;
    // A $ref with sibling properties narrows a closed shared definition (statusHistory items), so it stays closed.
    if (node.type === "object" && node.properties && node.additionalProperties !== false && !node.$ref)
      problems.push(`${path} allows unknown properties`);
    for (const [k, v] of Object.entries(node.properties ?? {})) {
      if (!v.description || v.description.length < 10) problems.push(`${path}.${k} has no useful description`);
      visit(v, `${path}.${k}`);
      visit(v.items, `${path}.${k}[]`);
    }
    for (const [k, v] of Object.entries(node.$defs ?? {})) {
      if (!v.description) problems.push(`${path}#${k} has no description`);
      visit(v, `${path}#${k}`);
    }
  };
  for (const f of ALL) visit(read(`${f}.schema.json`), f);
  assert.deepEqual(problems, []);
});

test("every enum value is a lower-case kebab-case token and is explained in its description", () => {
  const bad = [];
  const visit = (node, path) => {
    if (Array.isArray(node)) return node.forEach((n, i) => visit(n, `${path}/${i}`));
    if (!node || typeof node !== "object") return;
    for (const v of node.enum ?? []) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) bad.push(`${path}: ${v} is not kebab-case`);
      if (node.description && !node.description.includes(v)) bad.push(`${path}: description doesn't mention ${v}`);
    }
    for (const [k, v] of Object.entries(node)) visit(v, `${path}/${k}`);
  };
  for (const f of ALL) visit(read(`${f}.schema.json`), f);
  assert.deepEqual(bad, []);
});

test("x-sensitivity annotations use only the documented values, and every long text field has one", () => {
  const bad = [];
  const visit = (node, path) => {
    if (Array.isArray(node)) return node.forEach((n, i) => visit(n, `${path}/${i}`));
    if (!node || typeof node !== "object") return;
    const s = node["x-sensitivity"];
    if (s !== undefined && !["personal", "free-text"].includes(s)) bad.push(`${path}: ${s}`);
    if (node.type === "string" && (node.maxLength ?? 0) >= 2000 && !node.enum && !node.format && !node.pattern && !s)
      bad.push(`${path}: long text without x-sensitivity`);
    for (const [k, v] of Object.entries(node)) visit(v, `${path}/${k}`);
  };
  for (const f of ALL) visit(read(`${f}.schema.json`), f);
  assert.deepEqual(bad, []);
});

test("the patient block can't hold direct identifiers", () => {
  const patient = schemas["patient-safety-incident"].properties.patient;
  assert.equal(patient.additionalProperties, false);
  assert.deepEqual(Object.keys(patient.properties).sort(), ["ageBand", "encounterRef", "sex"]);
});
