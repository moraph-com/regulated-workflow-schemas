# Regulated Workflow Schemas

[![CI](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml/badge.svg)](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![JSON Schema 2020-12](https://img.shields.io/badge/JSON%20Schema-2020--12-informational.svg)](https://json-schema.org/draft/2020-12)

Open, documented [JSON Schema](https://json-schema.org) (draft 2020-12) record formats for work that examiners,
accreditors, auditors and the public look at closely:

- **Vendor risk reviews** for bank and healthcare third-party risk teams
- **Patient safety event reports** for hospital patient safety and risk management
- **Permit applications** for building and planning departments
- **Board actions** for clerks and board secretaries

Each format comes with field-by-field documentation, fictional example records, a validator that also checks the
cross-field rules JSON Schema can't express, a command-line checker and TypeScript types.

Maintained by [Moraph](https://www.moraph.com). Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

> **Status: 0.1.0, unreleased draft.** The formats may still change before 1.0. See [Versioning](#versioning).

## Why open formats

If you buy software for a regulated workflow, the records it holds are yours, and you will need them outside that
software: for an examiner, an accreditor, a records request, a migration or a merger. An open, documented format helps:

- **Portability.** Records move between systems without a custom export project, and no vendor can hold your history
  hostage.
- **Audit.** Every format has the same status history, audit trail and attachments (with SHA-256 digests), so a reviewer
  can see who did what and when, and check that a file is the one the record refers to.
- **Clarity.** Every field and every enumerated value is documented, so it is plain what a record says and what it
  doesn't.
- **Validation anywhere.** JSON Schema validators exist for every major language. The schemas are tested with two
  independent implementations.

## The formats

| Format                                                                   | What one record is                                                                                                                                                                                                                                                                           | Informed by                                                                                                     | Docs                                    | Fields |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------ |
| [`vendor-risk-review`](schemas/vendor-risk-review.schema.json)           | One review of a third-party relationship: services, data and access, criticality, inherent and residual risk, assessments, findings and remediation or risk acceptance, cadence, decision and approvals                                                                                      | Interagency guidance on third-party relationships (OCC Bulletin 2023-17), NIST SP 800-161 Rev. 1, ISO/IEC 27036 | [docs](docs/vendor-risk-review.md)      | 96     |
| [`patient-safety-incident`](schemas/patient-safety-incident.schema.json) | One patient safety event report (incident, near miss or unsafe condition): category, harm, contributing factors, actions, reporter (may be anonymous), notifications, investigation. Minimizes patient information by design ([privacy](docs/patient-safety-incident.md#privacy-by-design)). | AHRQ Common Formats for Event Reporting – Hospital, WHO ICPS conceptual framework                               | [docs](docs/patient-safety-incident.md) | 81     |
| [`permit-application`](schemas/permit-application.schema.json)           | One permit application from intake to final: parties, site, documents, fees, plan reviews by discipline and cycle, statutory review clock, inspections, decision                                                                                                                             | Local-government permitting practice; maps to BLDS 1.2                                                          | [docs](docs/permit-application.md)      | 109    |
| [`board-action`](schemas/board-action.schema.json)                       | One agenda item taken up by a board, council or commission: meeting, members, motions, votes, recusals, outcome, minutes                                                                                                                                                                     | Robert's Rules of Order Newly Revised (12th ed.), open-meetings practice                                        | [docs](docs/board-action.md)            | 88     |

Field counts include nested fields. Shared building blocks (identifiers, people, organizations, money, addresses,
jurisdictions, attachments, status history, audit trail, extensions) are in
[`common.schema.json`](schemas/common.schema.json), documented in [docs/common.md](docs/common.md).

**"Informed by" means the formats borrow those documents' concepts and vocabulary, and the docs say exactly which.**
The formats are not endorsed or certified by the organizations that publish those documents, a record in one of these
formats is not a submission in any of them, and using the formats does not by itself make a program compliant with any
law, regulation, standard or guidance.

## Quick start

Check the example records from a clone of this repository (Node.js 20 or later):

```sh
git clone https://github.com/moraph-com/regulated-workflow-schemas.git
cd regulated-workflow-schemas
npm ci
npx rws-validate examples/*/valid-*.json
```

```
✓ examples/board-action/valid-council-contract-award.json (board-action)
✓ examples/board-action/valid-credit-union-board-policy.json (board-action)
...
8 valid, 0 invalid (8 files)
```

Then try an invalid one to see what a problem looks like:

```sh
npx rws-validate examples/board-action/invalid-adopted-without-quorum.json
```

```
✗ examples/board-action/invalid-adopted-without-quorum.json (board-action)
    /motions/0/result the motion is recorded as adopted, but only 3 voting members were present and the quorum is 4 [rule:quorum-for-action]
```

## Using the formats

### A record

A record says what it is with `recordType` and `schemaVersion`, and may also carry `$schema` set to the schema's `$id`.
This is a complete, valid permit application:

```json
{
  "recordType": "permit-application",
  "schemaVersion": "0.1.0",
  "id": "ROW-2026-0090",
  "jurisdiction": { "country": "GB", "subdivision": "GB-ENG", "authority": "Highways" },
  "permitType": { "category": "right-of-way", "subtype": "Skip on the highway" },
  "applicant": { "role": "contractor", "organization": { "name": "Fenwick Skip Hire (fictional)" } },
  "site": { "address": { "lines": ["14 Example Terrace"], "country": "GB" } },
  "status": "submitted"
}
```

### Any language

The schemas are plain JSON Schema 2020-12 in [`schemas/`](schemas/). Load the record's schema and
`common.schema.json` into any 2020-12 validator; the record schemas refer to common with the relative reference
`common.schema.json#/$defs/...`, which resolves against their `$id`. Each `$id` is the raw GitHub URL of the file at the
release tag where that version was published, for example:

```
https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json
```

Those URLs resolve once the release is tagged. Load the schemas from local files rather than fetching them at run time.
For example, in Python with [`jsonschema`](https://python-jsonschema.readthedocs.io):

```python
import json
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

load = lambda name: json.load(open(f"schemas/{name}.schema.json"))
common, permit = load("common"), load("permit-application")
registry = Registry().with_resources([(s["$id"], Resource.from_contents(s)) for s in (common, permit)])
validator = Draft202012Validator(permit, registry=registry, format_checker=Draft202012Validator.FORMAT_CHECKER)
for error in validator.iter_errors(json.load(open("my-record.json"))):
    print(error.json_path, error.message)
```

Other validators check the JSON Schema only. The cross-field rules (below) are implemented in this package's
JavaScript validator; each format's docs list them so they can be implemented elsewhere.

The schemas use one annotation keyword beyond the standard, `x-sensitivity` (`personal` or `free-text`), to mark
fields that hold personal data or narrative. Validators ignore it; export and redaction tools can use it.

### JavaScript and TypeScript

The package isn't on npm yet; install it from GitHub:

```sh
npm install github:moraph-com/regulated-workflow-schemas
```

```ts
import { validate } from "@moraph/regulated-workflow-schemas";
import type { BoardAction } from "@moraph/regulated-workflow-schemas/types";

const result = validate(record); // detects the format from $schema or recordType
if (!result.valid) {
  for (const e of result.errors) console.log(e.path, e.message, `[${e.source}:${e.keyword}]`);
}
```

`validate` checks the JSON Schema first, then, if that passes, the cross-field rules JSON Schema can't express: a tally
must match the votes and the result must meet the motion's threshold, a motion can't be adopted without a quorum, a
finding must point at a real assessment, a near miss can't have reached the patient or have a harm rating, a status
history must end at the current status. Each format's docs list its rules. Errors have a JSON Pointer `path`, a
`source` (`schema` or `rule`), a stable `keyword` for programs and a plain-language `message` for people.

- `validate(record, { recordType })` forces a format; `{ schemaOnly: true }` skips the cross-field rules.
- If a record's `$schema` and `recordType` name different formats, `validate` reports that one problem instead of
  checking against either.
- `schemas`, `commonSchema` and `RULE_DOCS` export the schemas (read-only) and the rule descriptions.
- `createAjv()` from `@moraph/regulated-workflow-schemas/ajv` returns an [Ajv](https://ajv.js.org) instance with every
  schema loaded, for compiling your own schemas against the common definitions.

**Runs anywhere.** The validators are precompiled from the schemas at build time, so `validate` needs no file system
access and no `eval`. It works in Node.js 20 or later, in browsers through any bundler (about 80 KB minified and
gzipped, schemas included) and in runtimes that forbid run-time code generation, such as Cloudflare Workers and pages
with a strict Content-Security-Policy. The `/ajv` entry point does compile at run time, so it is for Node.js and
browsers only.

### Command line

```sh
npx rws-validate examples/*/valid-*.json
npx rws-validate --json --schema board-action my-record.json
some-export-command | npx rws-validate -    # read one record from standard input
```

| Option            | Meaning                                                  |
| ----------------- | -------------------------------------------------------- |
| `--schema <type>` | Check against this format instead of detecting it        |
| `--schema-only`   | Check JSON Schema only; skip the cross-field rules       |
| `--json`          | Print an array of results, one per file, for other tools |

Exit code 0 means every file is valid, 1 that at least one isn't, and 2 a usage error or a file that couldn't be read
or isn't JSON. Files saved with a UTF-8 byte order mark are accepted. Where the shell doesn't expand `*` (Windows
`cmd.exe`), `rws-validate` expands it itself on Node.js 22 or later.

## Privacy

The formats hold sensitive information about real people, so they are designed to carry as little as the workflow
needs:

- Every field that can identify or contact a person is annotated `x-sensitivity: personal`, and every narrative field
  `x-sensitivity: free-text`. The docs show both.
- `patient-safety-incident` has no fields for patient names, dates of birth, contact details or record numbers, and its
  `patient` block is closed so such fields are rejected. That does not make records de-identified: event dates, the
  facility and free text can still identify a patient. See
  [privacy by design](docs/patient-safety-incident.md#privacy-by-design) for exactly what the format does and doesn't
  do.
- Example data is fictional. Never put real records, even redacted ones, in issues, pull requests or examples.

## Extensions

Every format closes its objects (`additionalProperties: false`), so a misspelled field is an error instead of silently
ignored data. For fields you need that a format doesn't have, use `extensions` with a key namespaced by your
organization:

```json
"extensions": { "examplecity:councilDistrict": "3" }
```

Enumerated values (statuses, categories) are closed lists so that every system reading a record understands it; each
list has an `other` value where real-world variety demands one, usually paired with a free-text field for the detail.
If several organizations need the same extension or value, [propose it](#proposing-a-change).

## Versioning

Each schema is versioned on its own with [semantic versioning](https://semver.org), in its `schemaVersion` constant:

- **Patch**: descriptions and docs only; every record valid before is valid after, and the reverse.
- **Minor**: new optional fields or new enum values; every record valid before stays valid.
- **Major**: anything that can make a valid record invalid (new required fields, removed fields or values, tighter
  patterns, new cross-field rules).

Repository releases are tagged `vX.Y.Z`, and each schema's `$id` points at the tag where that version was published, so
an `$id` always refers to fixed content. Before 1.0, minor versions may also include breaking changes; the
[changelog](CHANGELOG.md) will say so. How changes are decided is described in [GOVERNANCE.md](GOVERNANCE.md).

## Proposing a change

Open an issue with the
[proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml).
Tell us the workflow, who needs the data and why, and point to the public standard, rule or practice it comes from.
Domain corrections are especially welcome: if a description gets your field wrong, tell us.

## Development

```sh
npm ci
npm test               # builds, then runs every test, including the docs and types sync checks
npm run typecheck
npm run lint && npm run format:check
npm run types          # regenerate types/ after editing a schema
npm run docs           # regenerate docs/ after editing a schema or a rule
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the design rules and the review checklist.

## Security

Please report vulnerabilities privately; see [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE). Copyright 2026 Moraph. See [NOTICE](NOTICE).
