// Generates TypeScript types for every schema into types/. With --check, fails if the committed types are stale.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { compile } from "json-schema-to-typescript";

const RECORD_TYPES = ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"];
const check = process.argv.includes("--check");
const schemaUrl = (f) => new URL(`../schemas/${f}`, import.meta.url);
const typesUrl = (f) => new URL(`../types/${f}`, import.meta.url);
const commonText = readFileSync(schemaUrl("common.schema.json"), "utf8");

const BANNER = "/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */";
const pascal = (s) => s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

// Resolve "common.schema.json#/..." refs from the local file, never over the network.
const localCommon = {
  order: 1,
  canRead: (file) => /common\.schema\.json$/.test(file.url),
  read: () => untitlePrimitives(JSON.parse(commonText)),
};

// Keep titles only on object types, so they become named interfaces; strings, enums and arrays are inlined with their
// descriptions as doc comments instead of each becoming a type alias.
function untitlePrimitives(node) {
  if (Array.isArray(node)) return node.map(untitlePrimitives);
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [k, v] of Object.entries(node))
    out[k] =
      k === "properties" || k === "$defs"
        ? Object.fromEntries(Object.entries(v).map(([n, s]) => [n, untitlePrimitives(s)]))
        : untitlePrimitives(v);
  if (out.title && !(out.type === "object" && out.properties)) delete out.title;
  return out;
}

// statusHistory items narrow common's statusChange to the format's own statuses with properties beside the $ref. That
// is valid JSON Schema, but the type generator drops a $ref that has siblings, and its ref parser resolves local refs
// beside an external one inside the external file. So rewrite { $ref, properties } as an intersection with the local
// refs inlined.
function narrowRefs(node, root) {
  if (Array.isArray(node)) return node.map((n) => narrowRefs(n, root));
  if (!node || typeof node !== "object") return node;
  if (typeof node.$ref === "string" && !node.$ref.startsWith("#") && node.properties) {
    const inline = (v) =>
      typeof v.$ref === "string" && v.$ref.startsWith("#/$defs/")
        ? (({ $ref, ...rest }) => ({ ...root.$defs[$ref.slice(8)], ...rest }))(v)
        : v;
    const props = Object.fromEntries(Object.entries(node.properties).map(([k, v]) => [k, inline(v)]));
    return { allOf: [{ $ref: node.$ref }, { type: "object", properties: props }] };
  }
  return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, narrowRefs(v, root)]));
}

const outputs = new Map();
for (const t of RECORD_TYPES) {
  const raw = JSON.parse(readFileSync(schemaUrl(`${t}.schema.json`), "utf8"));
  const schema = untitlePrimitives(narrowRefs(raw, raw));
  const ts = await compile(schema, pascal(t), {
    bannerComment: BANNER,
    cwd: new URL("../schemas/", import.meta.url).pathname,
    declareExternallyReferenced: true,
    additionalProperties: false,
    style: { singleQuote: false, printWidth: 120 },
    $refOptions: { resolve: { file: localCommon, http: localCommon } },
  });
  outputs.set(`${t}.d.ts`, ts);
}
outputs.set(
  "index.d.ts",
  `${BANNER}\n${RECORD_TYPES.map((t) => `export type { ${pascal(t)} } from "./${t}.js";`).join("\n")}\n\nimport type { ${RECORD_TYPES.map(pascal).join(", ")} } from "./index.js";\n/** Any record in one of this package's formats. */\nexport type AnyRecord = ${RECORD_TYPES.map(pascal).join(" | ")};\n`,
);

let stale = [];
for (const [file, text] of outputs) {
  const url = typesUrl(file);
  if (check) {
    if (!existsSync(url) || readFileSync(url, "utf8") !== text) stale.push(file);
  } else writeFileSync(url, text);
}
if (check && stale.length) {
  console.error(`Types are out of date: ${stale.join(", ")}. Run npm run types and commit the result.`);
  process.exit(1);
}
console.log(check ? "Types are up to date." : `Wrote ${outputs.size} files to types/.`);
