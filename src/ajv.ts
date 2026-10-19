/**
 * A configured Ajv instance, for callers who want to use Ajv directly: to compile their own schema that `$ref`s into
 * `common.schema.json`, to validate a fragment such as one motion, or to use Ajv features this package doesn't wrap.
 *
 * Import it from `@moraph/regulated-workflow-schemas/ajv`. It lives on its own entry point because Ajv compiles
 * schemas at run time with `new Function`, which some runtimes (Cloudflare Workers, strict Content-Security-Policy
 * pages) forbid, and because it pulls the whole Ajv compiler into a bundle. The main entry point's `validate()` uses
 * validators precompiled at build time instead and needs neither.
 *
 * @module
 */
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import { RECORD_TYPES, commonSchema, schemas } from "./schemas.js";

/**
 * The Ajv options the schemas are written to pass: Ajv's strict mode, except `strictRequired`. The formats use
 * conditional `required` (inside `if`/`then` and `anyOf`) for properties declared on the parent object, which is
 * standard JSON Schema but which `strictRequired` can't see. `scripts/build-generated.mjs` precompiles with the same
 * options, so `createAjv()` and `validate()` accept exactly the same records.
 */
export const STRICT = {
  strictSchema: true,
  strictNumbers: true,
  strictTypes: true,
  strictTuples: true,
  strictRequired: false,
} as const;

/**
 * Annotation keywords the schemas use beyond JSON Schema 2020-12. They don't affect validation; Ajv's strict mode only
 * needs to be told they exist. `x-sensitivity` marks fields that hold personal data (`personal`) or unstructured
 * narrative that may contain anything (`free-text`), so redaction and export tools can find them. Validators in other
 * languages ignore unknown keywords, as the specification requires.
 */
export const ANNOTATION_KEYWORDS = ["x-sensitivity"] as const;

// ajv-formats is CommonJS; under NodeNext its default import is the module object, so unwrap `.default` when present.
const addFormats = ((addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ??
  addFormatsModule) as unknown as (ajv: Ajv2020) => Ajv2020;

/**
 * A new Ajv (JSON Schema 2020-12) instance with formats enabled and every schema in this package registered under its
 * `$id`, so `ajv.getSchema(schemas["board-action"].$id)` returns a ready validator and your own schemas can `$ref`
 * `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/common.schema.json#/$defs/money`.
 *
 * Each call returns a fresh instance; cache it if you call it often, since compiling is the slow part.
 *
 * @example
 * ```ts
 * import { commonSchema, createAjv } from "@moraph/regulated-workflow-schemas/ajv";
 * const ajv = createAjv();
 * const checkMoney = ajv.compile({ $ref: `${commonSchema.$id}#/$defs/money` });
 * checkMoney({ currency: "USD", amount: "12.50" }); // true
 * ```
 */
export function createAjv(): Ajv2020 {
  const ajv = new Ajv2020({ ...STRICT, allErrors: true });
  addFormats(ajv);
  ajv.addVocabulary([...ANNOTATION_KEYWORDS]);
  ajv.addSchema(commonSchema);
  for (const t of RECORD_TYPES) ajv.addSchema(schemas[t]);
  return ajv;
}

export { commonSchema, schemas, RECORD_TYPES } from "./schemas.js";
