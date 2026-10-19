#!/usr/bin/env node
/**
 * `rws-validate`: check JSON record files against the regulated workflow schemas from the command line.
 *
 * ```
 * rws-validate [--schema <recordType>] [--schema-only] [--json] <file.json | ->...
 * ```
 *
 * Each file holds one record. The format is detected from the record's `$schema` or `recordType`, or forced with
 * `--schema`. `-` reads one record from standard input, so exports can be piped in.
 *
 * Exit codes, for scripts and CI:
 *
 * - `0` every file is valid
 * - `1` at least one file is invalid
 * - `2` a usage error, or a file that couldn't be read or isn't JSON (checked files are still reported)
 *
 * @module
 */
import * as fs from "node:fs";
import { parseArgs } from "node:util";
import { RECORD_TYPES, isRecordType, validate, type RecordType, type ValidationResult } from "./index.js";

const USAGE = `Usage: rws-validate [options] <file.json | ->...

Checks each JSON file against its record format, detected from $schema or recordType.
Use - to read one record from standard input.

Options:
  --schema <type>   check against this format: ${RECORD_TYPES.join(", ")}
  --schema-only     check JSON Schema only; skip the cross-field rules
  --json            print the results as JSON (an array, one entry per file)
  -h, --help        show this help

Exit codes: 0 all valid, 1 some invalid, 2 usage or read error.
`;

/** One file's result, as printed by --json. */
export type FileResult = ValidationResult & {
  /** The path as given on the command line, or "-" for standard input. */
  file: string;
  /** Why the file couldn't be checked (not found, not JSON); absent when it was checked. */
  readError?: string;
};

/**
 * Expand a `*` pattern when the shell didn't (Windows `cmd.exe` passes patterns through literally). Uses
 * `fs.globSync`, available from Node.js 22; on older versions the pattern is left as is and reported as not found.
 */
function expand(arg: string): string[] {
  if (arg === "-" || !arg.includes("*") || fs.existsSync(arg)) return [arg];
  const globSync = (fs as unknown as { globSync?: (p: string) => string[] }).globSync;
  const matches = globSync ? globSync(arg).sort() : [];
  return matches.length ? matches : [arg];
}

/** Read and parse one record. A UTF-8 byte order mark (common in files saved by Windows tools) is ignored. */
function readRecord(file: string): unknown {
  const text = fs.readFileSync(file === "-" ? 0 : file, "utf8");
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

function main(argv: string[]): number {
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        schema: { type: "string" },
        "schema-only": { type: "boolean" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
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
  if (positionals.filter((p) => p === "-").length > 1) {
    process.stderr.write("Standard input (-) can only be read once.\n");
    return 2;
  }

  const options = {
    ...(values.schema ? { recordType: values.schema as RecordType } : {}),
    schemaOnly: !!values["schema-only"],
  };
  const results: FileResult[] = positionals.flatMap(expand).map((file) => {
    let record: unknown;
    try {
      record = readRecord(file);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      const readError =
        err.code === "ENOENT"
          ? "file not found"
          : err instanceof SyntaxError
            ? `not valid JSON: ${err.message}`
            : err.message;
      return { file, valid: false, recordType: null, errors: [], readError };
    }
    return { file, ...validate(record, options) };
  });

  if (values.json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } else {
    for (const r of results) {
      if (r.readError) process.stdout.write(`✗ ${r.file}: can't check: ${r.readError}\n`);
      else if (r.valid) process.stdout.write(`✓ ${r.file} (${String(r.recordType)})\n`);
      else {
        process.stdout.write(`✗ ${r.file}${r.recordType ? ` (${r.recordType})` : ""}\n`);
        for (const e of r.errors)
          process.stdout.write(`    ${e.path || "/"} ${e.message} [${e.source}:${e.keyword}]\n`);
      }
    }
    const valid = results.filter((r) => r.valid).length;
    const unread = results.filter((r) => r.readError).length;
    const invalid = results.length - valid - unread;
    if (results.length > 1) {
      process.stdout.write(
        `\n${valid} valid, ${invalid} invalid${unread ? `, ${unread} not checked` : ""} (${results.length} files)\n`,
      );
    }
  }
  if (results.some((r) => r.readError)) return 2;
  return results.every((r) => r.valid) ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
