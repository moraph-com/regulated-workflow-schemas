/**
 * Validate records against the regulated workflow schemas.
 *
 * {@link validate} checks a record in two stages:
 *
 * 1. **JSON Schema.** The record's format is detected from `$schema` or `recordType`, and the record is checked with a
 *    validator that was precompiled from `schemas/` at build time (see `scripts/build-generated.mjs`). Precompiling
 *    means no `eval`/`new Function` at run time, so this module works in Node.js, browsers, Deno, Bun and Cloudflare
 *    Workers.
 * 2. **Cross-field rules** (`rules.ts`): checks JSON Schema can't express, such as "the tally matches the individual
 *    votes" or "a finding points at an assessment that exists". They run only when the schema passes, so they can
 *    rely on the record's shape.
 *
 * Errors from both stages share one shape, {@link ValidationError}, with messages written for the people who fill in
 * the records (clerks, analysts, safety officers), not only for programmers.
 *
 * @module
 */
import * as compiled from "./generated/validators.js";
import { RULES, type RuleError } from "./rules.js";
import { RECORD_TYPES, isRecordType, schemas, type RecordType } from "./schemas.js";

export { RECORD_TYPES, commonSchema, isRecordType, schemas, type JsonSchema, type RecordType } from "./schemas.js";
export { RULES, RULE_DOCS, type RuleCheck, type RuleError } from "./rules.js";

/** One problem with a record. */
export interface ValidationError {
  /** JSON Pointer (RFC 6901) to the value that failed, for example `/motions/0/secondedBy`; `""` for the whole record. */
  path: string;
  /** `"schema"` for JSON Schema errors, `"rule"` for the cross-field rules in this package. */
  source: "schema" | "rule";
  /**
   * What failed, for programs: the JSON Schema keyword (`required`, `enum`, `format`, ...) when `source` is
   * `"schema"`, or the rule's stable name (`tally-matches-votes`, ...) when it is `"rule"`. Rule names are listed in
   * {@link RULE_DOCS} and in each format's docs.
   */
  keyword: string;
  /** What is wrong, in plain words, for people. Wording may change between releases; match on `keyword` instead. */
  message: string;
}

/** The outcome of {@link validate}. */
export interface ValidationResult {
  /** True when there are no errors. */
  valid: boolean;
  /** The format the record was checked against, or `null` when it couldn't be told. */
  recordType: RecordType | null;
  /** Every problem found; empty when `valid` is true. */
  errors: ValidationError[];
}

/** Options for {@link validate}. */
export interface ValidateOptions {
  /** Check against this format instead of detecting it from the record's `$schema` or `recordType`. */
  recordType?: RecordType;
  /** Skip the cross-field rules and check JSON Schema only, as any other JSON Schema validator would. Default false. */
  schemaOnly?: boolean;
}

/** The subset of an Ajv error object this module reads. Ajv's standalone validators produce exactly this shape. */
interface AjvError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
}

/** A precompiled validator: a function that returns whether the data is valid and leaves its errors on itself. */
type CompiledValidator = ((data: unknown) => boolean) & { errors?: AjvError[] | null };

const VALIDATORS: Record<RecordType, CompiledValidator> = {
  "vendor-risk-review": compiled.vendorRiskReview as CompiledValidator,
  "patient-safety-incident": compiled.patientSafetyIncident as CompiledValidator,
  "permit-application": compiled.permitApplication as CompiledValidator,
  "board-action": compiled.boardAction as CompiledValidator,
};

/**
 * Which format a record follows: the format named by its `$schema` (this package's `$id` for that format, at any
 * version), or else by its `recordType`. Returns `null` when neither names a known format.
 *
 * @example
 * ```ts
 * detectRecordType({ recordType: "board-action" }); // "board-action"
 * detectRecordType({ hello: "world" });             // null
 * ```
 */
export function detectRecordType(record: unknown): RecordType | null {
  const { fromSchema, fromRecordType } = declared(record);
  return fromSchema ?? fromRecordType;
}

/** The format named by the record's `$schema` and by its `recordType`, each null when absent or unknown. */
function declared(record: unknown): { fromSchema: RecordType | null; fromRecordType: RecordType | null } {
  if (!isObject(record)) return { fromSchema: null, fromRecordType: null };
  // Match on the file name only, so a record that names any release of the schema (or a local copy of it) is detected.
  const m = typeof record.$schema === "string" ? /\/([a-z-]+)\.schema\.json(?:#.*)?$/.exec(record.$schema) : null;
  return {
    fromSchema: m && isRecordType(m[1]) ? m[1] : null,
    fromRecordType: isRecordType(record.recordType) ? record.recordType : null,
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Look up the schema node an Ajv `schemaPath` (such as `#/properties/decision/if`) points at.
 *
 * Ajv writes `schemaPath` relative to the schema resource it was evaluating, and for a local `$ref` (such as
 * `#/$defs/party`) that is the referenced definition, not the record schema's root. So try the root and each of the
 * record schema's `$defs`, and use the result only when exactly one of them resolves; otherwise return undefined and
 * let the caller fall back to Ajv's own wording. Paths into common.schema.json never resolve here, which is fine: the
 * conditional keywords this is used for live in the record schemas.
 */
function schemaAt(schema: unknown, schemaPath: string): unknown {
  if (!schemaPath.startsWith("#/") || !isObject(schema)) return undefined;
  const keys = schemaPath
    .slice(2)
    .split("/")
    .map((raw) => decodeURIComponent(raw).replace(/~1/g, "/").replace(/~0/g, "~"));
  const resolve = (root: unknown): unknown =>
    keys.reduce<unknown>(
      (node, key) => (isObject(node) || Array.isArray(node) ? (node as Record<string, unknown>)[key] : undefined),
      root,
    );
  const roots = [schema, ...(isObject(schema.$defs) ? Object.values(schema.$defs) : [])];
  const hits = roots.map(resolve).filter((n) => n !== undefined);
  return hits.length === 1 ? hits[0] : undefined;
}

/** Plain-words versions of the JSON types, for messages. */
const TYPE_WORDS: Record<string, string> = {
  string: "text (a JSON string)",
  integer: "a whole number",
  number: "a number",
  boolean: "true or false",
  object: "an object ({ ... })",
  array: "a list ([ ... ])",
  null: "null",
};

/** What each format the schemas use looks like, for messages. */
const FORMAT_WORDS: Record<string, string> = {
  date: "a date written YYYY-MM-DD, for example 2026-03-04",
  "date-time": "a date and time with a UTC offset, for example 2026-03-04T15:20:00Z or 2026-03-04T09:20:00-06:00",
  email: "an email address",
  uri: "an absolute URI, for example https://example.org/file.pdf",
};

/** What each pattern the schemas use means, keyed by the pattern itself, for messages. */
const PATTERN_WORDS: Record<string, string> = {
  "^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$":
    "an identifier: letters, digits and . _ : - only, starting with a letter or digit, at most 128 characters",
  "^[A-Z]{2}$": "a two-letter ISO 3166-1 country code in capitals, for example US or GB",
  "^[A-Z]{2}-[A-Z0-9]{1,3}$": "an ISO 3166-2 subdivision code, for example US-CA or GB-ENG",
  "^[A-Z]{3}$": "a three-letter ISO 4217 currency code in capitals, for example USD",
  "^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$":
    'a decimal amount written as text, for example "1250.00" (no currency symbol, commas or exponent)',
  "^[a-f0-9]{64}$": "a SHA-256 digest: 64 lower-case hexadecimal characters",
  "^[a-z]+/[A-Za-z0-9.+-]+$": "a media type, for example application/pdf",
};

const plural = (n: unknown, word: string) => `${String(n)} ${word}${n === 1 ? "" : "s"}`;

/** Describe an `if` condition from the schemas (`{ properties: { outcome: { const: "issued" } } }`) in words. */
function describeCondition(ifSchema: unknown): string | null {
  if (!isObject(ifSchema)) return null;
  if (isObject(ifSchema.contains) && "const" in ifSchema.contains)
    return `it contains ${JSON.stringify(ifSchema.contains.const)}`;
  const props = isObject(ifSchema.properties) ? Object.entries(ifSchema.properties) : [];
  const parts = props
    .filter(([, v]) => isObject(v) && "const" in v)
    .map(([k, v]) => `${k} is ${JSON.stringify((v as { const: unknown }).const)}`);
  return parts.length ? parts.join(" and ") : null;
}

/**
 * Turn Ajv's errors into {@link ValidationError}s a person can act on:
 *
 * - An `anyOf` whose branches each just require one field ("give a parcel number, an address or coordinates") becomes
 *   one message naming the choices, instead of one "missing" error per branch plus "must match a schema in anyOf".
 * - Errors caused by an `if`/`then` say which condition triggered them, and the bare "must match then schema" that Ajv
 *   adds on top is dropped.
 * - Type, format, enum, const, unknown-field and `not` messages are reworded in plain language.
 */
function fromAjv(errors: AjvError[], schema: unknown): ValidationError[] {
  const anyOfRequired = new Map<string, string[]>(); // schemaPath of the anyOf -> the fields it offers
  const conditions = new Map<string, string>(); // schemaPath prefix of a `then` -> the condition in words
  for (const e of errors) {
    if (e.keyword === "anyOf") {
      // Summarize when every branch failed only because it required one field (the "give at least one of" pattern).
      const children = errors.filter((c) => c.schemaPath.startsWith(`${e.schemaPath}/`));
      const fields = children.map((c) =>
        c.keyword === "required" && c.instancePath === e.instancePath ? String(c.params.missingProperty) : null,
      );
      if (children.length > 1 && fields.every((f) => f !== null)) anyOfRequired.set(e.schemaPath, fields as string[]);
    }
    if (e.keyword === "if") {
      const condition = describeCondition(schemaAt(schema, e.schemaPath));
      if (condition) conditions.set(`${e.schemaPath.replace(/\/if$/, "/then")}/`, condition);
    }
  }

  const out: ValidationError[] = [];
  for (const e of errors) {
    if (e.keyword === "if") continue;
    // Drop the per-branch errors of an anyOf we summarize below.
    if ([...anyOfRequired.keys()].some((p) => e.schemaPath.startsWith(`${p}/`))) continue;
    let message = e.message ?? "is invalid";
    const p = e.params;
    switch (e.keyword) {
      case "anyOf": {
        const fields = anyOfRequired.get(e.schemaPath);
        if (fields) message = `needs at least one of: ${fields.join(", ")}`;
        break;
      }
      case "required":
        message = `is missing the required field "${String(p.missingProperty)}"`;
        break;
      case "dependentRequired":
        message = `needs "${String(p.missingProperty)}" whenever "${String(p.property)}" is given`;
        break;
      case "additionalProperties":
        message = `has a field this format doesn't define: "${String(p.additionalProperty)}". Check the spelling, or put local fields in extensions`;
        break;
      case "enum":
        message = `must be one of: ${(p.allowedValues as unknown[]).join(", ")}`;
        break;
      case "const":
        message = `must be ${JSON.stringify(p.allowedValue)}`;
        break;
      case "type":
        message = `must be ${String(p.type)
          .split(",")
          .map((t) => TYPE_WORDS[t] ?? t)
          .join(" or ")}`;
        break;
      case "format":
        message = `must be ${FORMAT_WORDS[String(p.format)] ?? `in ${String(p.format)} format`}`;
        break;
      case "minItems":
        message =
          p.limit === 1
            ? "must not be empty"
            : `must have at least ${plural(p.limit, "entry").replace("entrys", "entries")}`;
        break;
      case "maxItems":
        message = `must have at most ${plural(p.limit, "entry").replace("entrys", "entries")}`;
        break;
      case "minLength":
        if (p.limit === 1) message = "must not be empty";
        break;
      case "pattern": {
        const words = PATTERN_WORDS[String(p.pattern)];
        if (words) message = `must be ${words}`;
        break;
      }
      case "not": {
        const forbidden = schemaAt(schema, e.schemaPath);
        if (isObject(forbidden) && Array.isArray(forbidden.required))
          message = `must leave out ${forbidden.required.map((f) => `"${String(f)}"`).join(", ")}`;
        break;
      }
    }
    const condition = [...conditions].find(([prefix]) => e.schemaPath.startsWith(prefix))?.[1];
    if (condition) message += ` (because ${condition})`;
    out.push({ path: e.instancePath, source: "schema", keyword: e.keyword, message });
  }
  return out;
}

const fromRule = (e: RuleError): ValidationError => ({
  path: e.path,
  source: "rule",
  keyword: e.rule,
  message: e.message,
});

/**
 * Check one record against its format: JSON Schema first, then the format's cross-field rules.
 *
 * The format is `options.recordType` if given, else the one named by the record's `$schema`, else its `recordType`.
 * A record whose `$schema` and `recordType` name different formats gets that one error instead of dozens of
 * unrelated ones. Never throws on bad input; anything that isn't a valid record comes back as errors.
 *
 * @example
 * ```ts
 * const result = validate(record);
 * if (!result.valid) for (const e of result.errors) console.log(e.path, e.message);
 * ```
 */
export function validate(record: unknown, options: ValidateOptions = {}): ValidationResult {
  const { fromSchema, fromRecordType } = declared(record);
  if (!options.recordType && fromSchema && fromRecordType && fromSchema !== fromRecordType) {
    return {
      valid: false,
      recordType: null,
      errors: [
        {
          path: "/$schema",
          source: "schema",
          keyword: "$schema",
          message: `names ${fromSchema} but recordType is ${fromRecordType}`,
        },
      ],
    };
  }
  const recordType = options.recordType ?? fromSchema ?? fromRecordType;
  if (!recordType) {
    return {
      valid: false,
      recordType: null,
      errors: [
        {
          path: "",
          source: "schema",
          keyword: "recordType",
          message: isObject(record)
            ? `can't tell the format: set recordType to one of ${RECORD_TYPES.join(", ")}`
            : `must be a JSON object (a record), not ${Array.isArray(record) ? "a list" : record === null ? "null" : `a ${typeof record}`}`,
        },
      ],
    };
  }
  const check = VALIDATORS[recordType];
  if (!check(record)) return { valid: false, recordType, errors: fromAjv(check.errors ?? [], schemas[recordType]) };
  const ruleErrors = options.schemaOnly ? [] : RULES[recordType](record as Record<string, unknown>).map(fromRule);
  return { valid: ruleErrors.length === 0, recordType, errors: ruleErrors };
}
