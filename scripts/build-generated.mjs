// Generates src/generated/ from schemas/ before TypeScript compiles the library:
//
//   src/generated/schemas.ts     every schema as a plain object, so the library never reads files at run time
//   src/generated/validators.ts  every schema precompiled to JavaScript with Ajv's standalone code generation
//
// Why precompile: Ajv normally compiles a schema at run time with `new Function`, which Cloudflare Workers, Chrome
// extensions and pages with a strict Content-Security-Policy forbid. Standalone code is ordinary JavaScript, so the
// validator runs anywhere ES modules run. The output is derived and git-ignored; `npm run build` regenerates it.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import standaloneCode from "ajv/dist/standalone/index.js";
import addFormats from "ajv-formats";

const RECORD_TYPES = ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"];
const schemaDir = new URL("../schemas/", import.meta.url);
const outDir = new URL("../src/generated/", import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(f, schemaDir), "utf8"));

// Fail loudly if someone adds a schema file without registering its record type here and in src/schemas.ts.
const files = readdirSync(schemaDir)
  .filter((f) => f.endsWith(".schema.json"))
  .sort();
const expected = ["common.schema.json", ...RECORD_TYPES.map((t) => `${t}.schema.json`)].sort();
if (JSON.stringify(files) !== JSON.stringify(expected)) {
  throw new Error(`schemas/ holds ${files.join(", ")}; expected ${expected.join(", ")}`);
}

const common = read("common.schema.json");
const records = Object.fromEntries(RECORD_TYPES.map((t) => [t, read(`${t}.schema.json`)]));
const BANNER = "// Generated from schemas/ by scripts/build-generated.mjs. Do not edit: run npm run build.";
const camel = (t) => t.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

mkdirSync(outDir, { recursive: true });

writeFileSync(
  new URL("schemas.ts", outDir),
  `${BANNER}
/** The shared definitions in schemas/common.schema.json. */
export const common: Record<string, unknown> = ${JSON.stringify(common, null, 2)};

/** Each record format's schema, by recordType. */
export const records: Record<string, Record<string, unknown>> = ${JSON.stringify(records, null, 2)};
`,
);

// Annotations don't affect validation, so leave them out of the compiled code: it keeps the bundle a browser or Worker
// downloads several times smaller. Keyword names are only stripped from schema objects, never from the maps whose keys
// are property names (a property can be called "description").
const ANNOTATIONS = new Set(["title", "description", "examples", "x-sensitivity", "$comment"]);
const MAPS = new Set(["properties", "$defs", "patternProperties", "dependentSchemas"]);
function stripAnnotations(node) {
  if (Array.isArray(node)) return node.map(stripAnnotations);
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (ANNOTATIONS.has(k)) continue;
    out[k] = MAPS.has(k)
      ? Object.fromEntries(Object.entries(v).map(([n, s]) => [n, stripAnnotations(s)]))
      : stripAnnotations(v);
  }
  return out;
}

// These options must match createAjv() in src/ajv.ts so both paths accept exactly the same records.
const ajv = new Ajv2020({
  strict: true,
  strictRequired: false,
  allErrors: true,
  // Compile each shared definition once and call it, instead of copying it into every place that refers to it.
  inlineRefs: false,
  code: { source: true, esm: true, lines: false },
});
addFormats.default(ajv);
ajv.addVocabulary(["x-sensitivity"]); // annotation only; keep in step with ANNOTATION_KEYWORDS in src/ajv.ts
ajv.addSchema(stripAnnotations(common));
for (const s of Object.values(records)) ajv.addSchema(stripAnnotations(s));
let code = standaloneCode.default(ajv, Object.fromEntries(RECORD_TYPES.map((t) => [camel(t), records[t].$id])));

// Even with esm: true, Ajv emits require() calls for its small runtime helpers and for ajv-formats. Rewrite them as
// imports. `ns.default.__esModule ? ns.default : ns` picks the CommonJS exports object both under Node (where the
// namespace's default is module.exports) and under bundlers such as esbuild (where the namespace is the exports).
const imports = new Map();
code = code.replace(/require\("([^"]+)"\)/g, (_, spec) => {
  if (!imports.has(spec)) imports.set(spec, `__cjs${imports.size}`);
  return imports.get(spec);
});
const header = [...imports]
  .map(
    ([spec, name]) =>
      `import * as ${name}_ns from "${spec}.js";\nconst ${name} = (${name}_ns as any).default?.__esModule ? (${name}_ns as any).default : ${name}_ns;`,
  )
  .join("\n");
code = code.replace(/^"use strict";/, "");

writeFileSync(
  new URL("validators.ts", outDir),
  `${BANNER}
// @ts-nocheck -- machine-generated JavaScript; its behavior is covered by the tests, not by the type checker.
/* eslint-disable */
${header}
${code}
`,
);

console.log(`Wrote src/generated/schemas.ts and src/generated/validators.ts (${RECORD_TYPES.length} formats).`);
