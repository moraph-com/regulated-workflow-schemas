import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { RECORD_TYPES, STRICT, commonSchema, createAjv, schemas } from "../dist/index.js";

const read = (f) => JSON.parse(readFileSync(new URL(`../schemas/${f}`, import.meta.url), "utf8"));

test("the schemas directory holds exactly common plus one schema per record type", () => {
  const files = readdirSync(new URL("../schemas/", import.meta.url)).sort();
  assert.deepEqual(files, ["common.schema.json", ...RECORD_TYPES.map((t) => `${t}.schema.json`)].sort());
});

test("every schema compiles in Ajv strict mode", () => {
  const ajv = new Ajv2020({ ...STRICT });
  addFormats(ajv);
  ajv.addSchema(commonSchema);
  for (const t of RECORD_TYPES) assert.doesNotThrow(() => ajv.compile(read(`${t}.schema.json`)), t);
  assert.doesNotThrow(() => createAjv());
});

test("every schema is draft 2020-12 with an $id pinned to a release tag", () => {
  for (const f of ["common", ...RECORD_TYPES]) {
    const s = read(`${f}.schema.json`);
    assert.equal(s.$schema, "https://json-schema.org/draft/2020-12/schema", f);
    assert.match(s.$id, new RegExp(`^https://raw\\.githubusercontent\\.com/moraph-com/regulated-workflow-schemas/v\\d+\\.\\d+\\.\\d+/schemas/${f}\\.schema\\.json$`), f);
  }
});

test("every record schema has the common envelope", () => {
  for (const t of RECORD_TYPES) {
    const s = schemas[t];
    assert.equal(s.additionalProperties, false, t);
    assert.equal(s.properties.recordType.const, t, t);
    assert.match(s.properties.schemaVersion.const, /^\d+\.\d+\.\d+$/, t);
    for (const k of ["recordType", "schemaVersion", "id", "status"]) assert.ok(s.required.includes(k), `${t} requires ${k}`);
    for (const k of ["$schema", "externalIds", "createdAt", "updatedAt", "statusHistory", "attachments", "auditTrail", "extensions"]) assert.ok(s.properties[k], `${t} has ${k}`);
  }
});

test("every property has a description, and every object closes its properties", () => {
  const problems = [];
  const visit = (node, path) => {
    if (!node || typeof node !== "object") return;
    // A $ref with sibling properties narrows a closed shared definition (statusHistory items), so it stays closed.
    if (node.type === "object" && node.properties && node.additionalProperties !== false && !node.$ref) problems.push(`${path} allows unknown properties`);
    for (const [k, v] of Object.entries(node.properties ?? {})) {
      if (!v.description) problems.push(`${path}.${k} has no description`);
      visit(v, `${path}.${k}`);
      visit(v.items, `${path}.${k}[]`);
    }
    for (const [k, v] of Object.entries(node.$defs ?? {})) visit(v, `${path}#${k}`);
  };
  for (const f of ["common", ...RECORD_TYPES]) visit(read(`${f}.schema.json`), f);
  assert.deepEqual(problems, []);
});

test("every enum value is a lower-case kebab-case token", () => {
  const bad = [];
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    for (const v of node.enum ?? []) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) bad.push(v);
    Object.values(node).forEach(visit);
  };
  for (const f of ["common", ...RECORD_TYPES]) visit(read(`${f}.schema.json`));
  assert.deepEqual(bad, []);
});
