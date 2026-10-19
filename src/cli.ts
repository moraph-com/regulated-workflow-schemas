#!/usr/bin/env node
// rws-validate: check JSON files against the regulated workflow schemas.
//
//   rws-validate [--schema <recordType>] [--schema-only] [--json] <file.json>...
//
// Exit codes: 0 every file is valid, 1 at least one is invalid, 2 usage or read error.
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { RECORD_TYPES, isRecordType, validate, type ValidationResult } from "./index.js";

const USAGE = `Usage: rws-validate [--schema <type>] [--schema-only] [--json] <file.json>...

Checks each file against its format, detected from $schema or recordType.
  --schema <type>   check against this format: ${RECORD_TYPES.join(", ")}
  --schema-only     skip the cross-field rules
  --json            print results as JSON
`;

function main(argv: string[]): number {
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: { schema: { type: "string" }, "schema-only": { type: "boolean" }, json: { type: "boolean" }, help: { type: "boolean", short: "h" } },
    });
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n\n${USAGE}`);
    return 2;
  }
  const { values, positionals } = args;
  if (values.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (!positionals.length) {
    process.stderr.write(USAGE);
    return 2;
  }
  if (values.schema !== undefined && !isRecordType(values.schema)) {
    process.stderr.write(`Unknown --schema ${values.schema}. Use one of: ${RECORD_TYPES.join(", ")}\n`);
    return 2;
  }
  const results: (ValidationResult & { file: string; readError?: string })[] = [];
  for (const file of positionals) {
    let record: unknown;
    try {
      record = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      results.push({ file, valid: false, recordType: null, errors: [], readError: (e as Error).message });
      continue;
    }
    const opts = { ...(values.schema ? { recordType: values.schema as (typeof RECORD_TYPES)[number] } : {}), schemaOnly: !!values["schema-only"] };
    results.push({ file, ...validate(record, opts) });
  }
  if (values.json) process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  else {
    for (const r of results) {
      if (r.readError) process.stdout.write(`✗ ${r.file}: can't read: ${r.readError}\n`);
      else if (r.valid) process.stdout.write(`✓ ${r.file} (${r.recordType})\n`);
      else {
        process.stdout.write(`✗ ${r.file}${r.recordType ? ` (${r.recordType})` : ""}\n`);
        for (const e of r.errors) process.stdout.write(`    ${e.path || "/"} ${e.message} [${e.source}:${e.keyword}]\n`);
      }
    }
  }
  if (results.some((r) => r.readError)) return 2;
  return results.every((r) => r.valid) ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
