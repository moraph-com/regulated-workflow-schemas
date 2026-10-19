// Validate records against the regulated workflow schemas: JSON Schema first, then the cross-field rules in rules.ts.
import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import { RULES, type RuleError } from "./rules.js";
import { RECORD_TYPES, commonSchema, isRecordType, schemas, type RecordType } from "./schemas.js";

export { RECORD_TYPES, commonSchema, isRecordType, schemas, type JsonSchema, type RecordType } from "./schemas.js";
export { RULES, RULE_DOCS, type RuleError } from "./rules.js";

export interface ValidationError {
  /** JSON Pointer to the value that failed, "" for the whole record. */
  path: string;
  /** "schema" for JSON Schema errors, "rule" for cross-field rules. */
  source: "schema" | "rule";
  /** The JSON Schema keyword (required, enum, ...) or the rule name. */
  keyword: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  /** The format the record was checked against, or null when it couldn't be told. */
  recordType: RecordType | null;
  errors: ValidationError[];
}

export interface ValidateOptions {
  /** Check against this format instead of detecting it from the record. */
  recordType?: RecordType;
  /** Skip the cross-field rules and check JSON Schema only. Default false. */
  schemaOnly?: boolean;
}

// ajv-formats is CommonJS; under NodeNext its default import is the module object.
const addFormats = ((addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ?? addFormatsModule) as unknown as (ajv: Ajv2020) => Ajv2020;

/**
 * A configured Ajv instance with every schema in this package loaded, for callers who want to use Ajv directly (for
 * example to compile a schema that $refs into common.schema.json).
 */
export function createAjv(): Ajv2020 {
  // Strict mode, except strictRequired: the formats use conditional `required` (in if/then and anyOf) for properties
  // declared on the parent object, which is standard JSON Schema but which strictRequired can't see.
  const ajv = new Ajv2020({ ...STRICT, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(commonSchema);
  for (const t of RECORD_TYPES) ajv.addSchema(schemas[t]);
  return ajv;
}

/** The Ajv strict-mode options the schemas are written to pass. */
export const STRICT = { strictSchema: true, strictNumbers: true, strictTypes: true, strictTuples: true, strictRequired: false } as const;

let compiled: Map<RecordType, ValidateFunction> | null = null;
function validator(t: RecordType): ValidateFunction {
  if (!compiled) {
    const ajv = createAjv();
    compiled = new Map(RECORD_TYPES.map((x) => [x, ajv.getSchema(schemas[x].$id)!]));
  }
  return compiled.get(t)!;
}

/**
 * Which format a record follows: from its $schema (this package's $id for the format, at any version) or else its
 * recordType. Null when neither names a known format.
 */
export function detectRecordType(record: unknown): RecordType | null {
  const { fromSchema, fromRecordType } = declared(record);
  return fromSchema ?? fromRecordType;
}

/** The format named by the record's $schema and by its recordType, each null when absent or unknown. */
function declared(record: unknown): { fromSchema: RecordType | null; fromRecordType: RecordType | null } {
  if (!record || typeof record !== "object" || Array.isArray(record)) return { fromSchema: null, fromRecordType: null };
  const r = record as Record<string, unknown>;
  const m = typeof r.$schema === "string" ? /\/([a-z-]+)\.schema\.json(?:#.*)?$/.exec(r.$schema) : null;
  return { fromSchema: m && isRecordType(m[1]) ? m[1] : null, fromRecordType: isRecordType(r.recordType) ? r.recordType : null };
}

const fromAjv = (e: ErrorObject): ValidationError => {
  let message = e.message ?? "is invalid";
  if (e.keyword === "additionalProperties") message = `has an unknown field "${(e.params as { additionalProperty: string }).additionalProperty}"`;
  if (e.keyword === "enum") message = `must be one of: ${(e.params as { allowedValues: unknown[] }).allowedValues.join(", ")}`;
  if (e.keyword === "const") message = `must be ${JSON.stringify((e.params as { allowedValue: unknown }).allowedValue)}`;
  return { path: e.instancePath, source: "schema", keyword: e.keyword, message };
};
const fromRule = (e: RuleError): ValidationError => ({ path: e.path, source: "rule", keyword: e.rule, message: e.message });

/** Check one record. Never throws on bad input; returns the problems instead. */
export function validate(record: unknown, options: ValidateOptions = {}): ValidationResult {
  const { fromSchema, fromRecordType } = declared(record);
  if (!options.recordType && fromSchema && fromRecordType && fromSchema !== fromRecordType) {
    // Checking against either format would bury the real problem under dozens of unrelated errors.
    return {
      valid: false,
      recordType: null,
      errors: [{ path: "/$schema", source: "schema", keyword: "$schema", message: `names ${fromSchema} but recordType is ${fromRecordType}` }],
    };
  }
  const recordType = options.recordType ?? fromSchema ?? fromRecordType;
  if (!recordType) {
    return {
      valid: false,
      recordType: null,
      errors: [{ path: "", source: "schema", keyword: "recordType", message: `can't tell the format: set recordType to one of ${RECORD_TYPES.join(", ")}` }],
    };
  }
  const check = validator(recordType);
  // "must match then schema" only repeats the error that caused it, so leave it out.
  if (!check(record)) return { valid: false, recordType, errors: (check.errors ?? []).filter((e) => e.keyword !== "if").map(fromAjv) };
  const ruleErrors = options.schemaOnly ? [] : RULES[recordType](record as Record<string, unknown>).map(fromRule);
  return { valid: ruleErrors.length === 0, recordType, errors: ruleErrors };
}
