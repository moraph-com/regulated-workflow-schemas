# Fusion Center Labs — regulated-workflow-schemas

Open JSON Schema record formats for regulated workflows: vendor risk reviews, patient safety incidents, permit applications and board actions. With a validator, TypeScript types and docs.

[![CI](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml/badge.svg)](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![JSON Schema 2020-12](https://img.shields.io/badge/JSON%20Schema-2020--12-informational.svg)](https://json-schema.org/draft/2020-12)

> Part of the Moraph portfolio · Project board: [Moraph · Fusion Center Labs](https://github.com/orgs/moraph-com/projects/4) · Initiative: [moraph-com/mcp-worker-kit#6](https://github.com/moraph-com/mcp-worker-kit/issues/6)

## Overview

Open, documented [JSON Schema](https://json-schema.org) (draft 2020-12) record formats for work that examiners,
accreditors, auditors and the public look at closely:

- **Vendor risk reviews** for bank and healthcare third-party risk teams
- **Patient safety event reports** for hospital patient safety and risk management
- **Permit applications** for building and planning departments
- **Board actions** for clerks and board secretaries

Each format comes with field-by-field documentation, fictional example records, a validator that also checks the
cross-field rules JSON Schema can't express, a command-line checker and TypeScript types.

Maintained by [Moraph](https://www.moraph.com). Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

> **Status: 0.1.0, first public draft.** The formats may still change before 1.0. See [Versioning](#versioning).

The formats are published by Fusion Center Labs, the open-source work of the [Moraph Fusion Center](https://www.moraph.com/fusioncenter), Moraph's engineering unit. The current release is [v0.1.0](https://github.com/moraph-com/regulated-workflow-schemas/releases/tag/v0.1.0) (2026-10-19); see [CHANGELOG.md](CHANGELOG.md).

### Why open formats

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

## Features

- **Four record formats** in JSON Schema draft 2020-12, plus shared building blocks in `common.schema.json`.
- **Field-by-field documentation** for every format, generated into [`docs/`](docs/) and checked in CI.
- **Cross-field rules** JSON Schema can't express (tallies, quorum, status history order, date order, near-miss harm), in the JavaScript validator.
- **`validate()` library** with precompiled validators: no file system access and no `eval`, so it runs in Node.js 20+, browsers and Cloudflare Workers.
- **`rws-validate` command line** with `--schema`, `--schema-only` and `--json`, reading files or standard input.
- **TypeScript types** generated from the schemas (`@moraph/regulated-workflow-schemas/types`).
- **Fictional example records**, valid and invalid with expected errors, under [`examples/`](examples/).
- **Privacy annotations** (`x-sensitivity: personal | free-text`) on every sensitive field.

### The formats

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

## Tech stack

- **Formats:** JSON Schema draft 2020-12.
- **Library and CLI:** TypeScript compiled with `tsc`; [Ajv](https://ajv.js.org) 8 and `ajv-formats` (validators precompiled at build time by `scripts/build-generated.mjs`).
- **Types and docs:** generated by `json-schema-to-typescript` (`scripts/build-types.mjs`) and `scripts/build-docs.mjs`.
- **Tests:** `node:test`, with a second JSON Schema implementation (`@hyperjump/json-schema`) for cross-checking.
- **Tooling:** ESLint (typescript-eslint), Prettier, GitHub Actions CI on Node 20, 22 and 24, Dependabot.
- **Runtime:** Node.js 20 or later (`engines`); no Cloudflare bindings or services.

## Repository structure

```
schemas/      The JSON Schemas: four record formats and common.schema.json
docs/         Field-by-field documentation, generated from the schemas (npm run docs)
types/        TypeScript types, generated from the schemas (npm run types)
src/          Validator library (index, rules, schemas, ajv entry point) and the rws-validate CLI
scripts/      Build scripts for precompiled validators, types and docs
examples/     Fictional valid and invalid records per format, with expected errors
test/         node:test suites: schemas, validator, examples, CLI and docs/types sync
.github/      CI workflow, Dependabot config, issue forms and PR template
```

## Getting started

### Prerequisites

Node.js 20 or later (`engines` in `package.json`); `rws-validate` expands `*` itself on Node.js 22 or later.

### Quick start

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

### Development

```sh
npm ci
npm test               # builds, then runs every test, including the docs and types sync checks
npm run typecheck
npm run lint && npm run format:check
npm run types          # regenerate types/ after editing a schema
npm run docs           # regenerate docs/ after editing a schema or a rule
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the design rules and the review checklist.

`npm run validate:examples` builds and checks every valid example. No environment variables or secrets are needed.

## Deployment

Nothing is deployed: this repository ships a package and schema files.

- CI (`.github/workflows/ci.yml`) runs on Node 20, 22 and 24: `npm ci`, lint, format check, typecheck, tests, and the types and docs sync checks.
- Releases are tagged `vX.Y.Z` on GitHub; each schema's `$id` points at the tag where that version was published (see [Versioning](#versioning)). `prepublishOnly` runs lint, format check, typecheck, tests and the sync checks.
- The package is not on npm yet; publishing is tracked in [#10](https://github.com/moraph-com/regulated-workflow-schemas/issues/10) and the [v0.2.0 milestone](https://github.com/moraph-com/regulated-workflow-schemas/milestone/1).

## Project management

Work is tracked on the [Moraph · Fusion Center Labs](https://github.com/orgs/moraph-com/projects/4) project board, under the initiative [moraph-com/mcp-worker-kit#6](https://github.com/moraph-com/mcp-worker-kit/issues/6).

- **Hierarchy:** Initiative > Epic > Feature / Task / Bug, built with sub-issues and GitHub issue types (no type labels). This repo's Epic: [Publish to npm and chart the path to 1.0](https://github.com/moraph-com/regulated-workflow-schemas/issues/8).
- **Issue forms:** [Bug report](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=bug-report.yml) and [Propose a field or schema](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml). How proposals are decided is in [GOVERNANCE.md](GOVERNANCE.md).
- **Labels:** `needs-triage`, `needs-info`, `blocked`, `security`, `documentation`, `dependencies`, `good first issue`, `help wanted`, plus `area:schemas`, `area:validator`, `area:ci`, `area:release`.
- **Board fields:** Status (Backlog, Ready, In progress, In review, Done), Priority (P0–P3), Size (XS–XL), Iteration (two weeks), Start and Target date, Platform, Area.
- **Pull requests:** link the issue with `Closes #n` so merging moves it to Done. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Reference

### Using the formats

#### A record

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

#### Any language

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

#### JavaScript and TypeScript

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

#### Command line

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

### Privacy

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

### Extensions

Every format closes its objects (`additionalProperties: false`), so a misspelled field is an error instead of silently
ignored data. For fields you need that a format doesn't have, use `extensions` with a key namespaced by your
organization:

```json
"extensions": { "examplecity:councilDistrict": "3" }
```

Enumerated values (statuses, categories) are closed lists so that every system reading a record understands it; each
list has an `other` value where real-world variety demands one, usually paired with a free-text field for the detail.
If several organizations need the same extension or value, [propose it](#proposing-a-change).

### Versioning

Each schema is versioned on its own with [semantic versioning](https://semver.org), in its `schemaVersion` constant:

- **Patch**: descriptions and docs only; every record valid before is valid after, and the reverse.
- **Minor**: new optional fields or new enum values; every record valid before stays valid.
- **Major**: anything that can make a valid record invalid (new required fields, removed fields or values, tighter
  patterns, new cross-field rules).

Repository releases are tagged `vX.Y.Z`, and each schema's `$id` points at the tag where that version was published, so
an `$id` always refers to fixed content. Before 1.0, minor versions may also include breaking changes; the
[changelog](CHANGELOG.md) will say so. How changes are decided is described in [GOVERNANCE.md](GOVERNANCE.md).

### Proposing a change

Open an issue with the
[proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml).
Tell us the workflow, who needs the data and why, and point to the public standard, rule or practice it comes from.
Domain corrections are especially welcome: if a description gets your field wrong, tell us.

## Related repositories

- [moraph-com/mcp-worker-kit](https://github.com/moraph-com/mcp-worker-kit) — remote MCP server on Cloudflare Workers with OAuth 2.1, consent tiers and an audit trail.
- [moraph-com/moraph-internal-experts](https://github.com/moraph-com/moraph-internal-experts) (private) — build system for Moraph's model briefings.
- [moraph-com/adv-research](https://github.com/moraph-com/adv-research) (private) — D1 research database built from public regulatory filings.

## Security

Please report vulnerabilities privately; see [SECURITY.md](SECURITY.md). Email **security@moraph.com** or use GitHub's [private vulnerability reporting](https://github.com/moraph-com/regulated-workflow-schemas/security/advisories/new).

## License / ownership

[Apache License 2.0](LICENSE). Copyright 2026 Moraph. See [NOTICE](NOTICE).
