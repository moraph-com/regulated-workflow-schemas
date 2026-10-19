/**
 * The JSON Schemas that ship with this package, as plain objects.
 *
 * The objects come from `src/generated/schemas.ts`, which `npm run build` writes from the files in `schemas/`. Bundling
 * them (instead of reading `schemas/*.json` from disk at run time) is what lets the library run in browsers, Deno, Bun
 * and Cloudflare Workers as well as Node.js. The files in `schemas/` remain the source of truth and are published too,
 * for validators in other languages.
 *
 * @module
 */
import { common, records } from "./generated/schemas.js";

/** The record formats in this package, by `recordType`. */
export const RECORD_TYPES = [
  "vendor-risk-review",
  "patient-safety-incident",
  "permit-application",
  "board-action",
] as const;

/** One of the record formats in this package: the value of a record's `recordType`. */
export type RecordType = (typeof RECORD_TYPES)[number];

/**
 * A JSON Schema document as shipped in `schemas/`. Only `$id` and `title` are typed; everything else is standard
 * JSON Schema 2020-12.
 */
export type JsonSchema = { readonly $id: string; readonly title: string; readonly [key: string]: unknown };

/**
 * Freeze an object and everything inside it. The schemas are shared by every caller in the process, and the compiled
 * validators were generated from them, so letting a caller mutate one would make `schemas` disagree with what
 * `validate()` actually checks.
 */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const v of Object.values(value)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

/** The shared definitions (`common.schema.json`) that every record format refers to. Read-only. */
export const commonSchema: JsonSchema = deepFreeze(common as JsonSchema);

/** Every record format's schema, by `recordType`. Read-only. */
export const schemas: Readonly<Record<RecordType, JsonSchema>> = deepFreeze(
  Object.fromEntries(RECORD_TYPES.map((t) => [t, records[t] as JsonSchema])) as Record<RecordType, JsonSchema>,
);

/** Whether a value is one of this package's record types. Narrows `unknown` to {@link RecordType}. */
export const isRecordType = (v: unknown): v is RecordType =>
  typeof v === "string" && (RECORD_TYPES as readonly string[]).includes(v);
