// Loads the JSON Schemas that ship in ../schemas, so the package works from any install location.
import { readFileSync } from "node:fs";

/** The record formats in this package, by recordType. */
export const RECORD_TYPES = ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

export type JsonSchema = { $id: string; title: string; [key: string]: unknown };

const load = (file: string): JsonSchema => JSON.parse(readFileSync(new URL(`../schemas/${file}`, import.meta.url), "utf8")) as JsonSchema;

/** The shared definitions every record format refers to. */
export const commonSchema: JsonSchema = load("common.schema.json");

/** Every record format's schema, by recordType. */
export const schemas: Readonly<Record<RecordType, JsonSchema>> = Object.freeze(
  Object.fromEntries(RECORD_TYPES.map((t) => [t, load(`${t}.schema.json`)])) as Record<RecordType, JsonSchema>,
);

export const isRecordType = (v: unknown): v is RecordType => typeof v === "string" && (RECORD_TYPES as readonly string[]).includes(v);
