# Regulated Workflow Schemas

[![CI](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml/badge.svg)](https://github.com/moraph-com/regulated-workflow-schemas/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Open [JSON Schema](https://json-schema.org) (draft 2020-12) record formats for work that regulators, auditors and the
public look at closely: vendor risk reviews, patient safety incidents, permit applications and board actions. Each
format comes with documentation, realistic examples, a validator and TypeScript types.

Maintained by [Moraph](https://www.moraph.com). Contributions welcome.

## Why open formats

If you buy software for a regulated workflow, the records it holds are yours, and you will need them outside that
software: for an examiner, an accreditor, a records request, a migration or a merger. An open, documented format helps:

- **Portability.** Records can move between systems without a custom export project, and a vendor can't hold your
  history hostage.
- **Audit.** Every format has the same status history, audit trail and attachments (with SHA-256 digests), so a reviewer
  can see who did what, when, and check that a file is the one the record refers to.
- **Clarity.** Field-by-field documentation and enumerated values make it plain what a record says, and what it doesn't.
- **Validation anywhere.** JSON Schema validators exist for every major language, so you can check data at the edge of
  any system.

## The formats

| Format | What one record is | Informed by | Docs | Fields |
| --- | --- | --- | --- | --- |
| [`vendor-risk-review`](schemas/vendor-risk-review.schema.json) | One review of a third-party relationship: services, data and access, criticality, inherent and residual risk, assessments, findings and remediation, cadence, decision and approvals | OCC Bulletin 2023-17 (interagency third-party risk guidance), NIST SP 800-161 Rev. 1, ISO/IEC 27036 | [docs](docs/vendor-risk-review.md) | 100 |
| [`patient-safety-incident`](schemas/patient-safety-incident.schema.json) | One patient safety event report: type, category, harm, contributing factors, actions, reporter (may be anonymous), notifications, investigation. Holds no direct patient identifiers. | AHRQ Common Formats, WHO ICPS framework | [docs](docs/patient-safety-incident.md) | 85 |
| [`permit-application`](schemas/permit-application.schema.json) | One permit application from intake to final: parties, site, documents, fees, plan reviews by discipline and cycle, statutory clock, inspections, decision | Local-government permitting practice, BLDS | [docs](docs/permit-application.md) | 123 |
| [`board-action`](schemas/board-action.schema.json) | One agenda item taken up by a board, council or commission: meeting, members, motions, votes, recusals, outcome, minutes | Robert's Rules of Order, open-meetings practice | [docs](docs/board-action.md) | 98 |

Field counts include nested fields. Shared building blocks (people, organizations, money, addresses, jurisdictions,
attachments, status history, audit trail, extensions) are in [`common.schema.json`](schemas/common.schema.json),
documented in [docs/common.md](docs/common.md).

"Informed by" means the formats borrow those documents' concepts and vocabulary. They are not certified against them,
and using them does not by itself make a program compliant with any law, regulation or standard.

## Using the formats

### Any language

The schemas are plain JSON Schema 2020-12 in [`schemas/`](schemas/). Point any 2020-12 validator at the record's schema
with `common.schema.json` registered alongside it. Each schema's `$id` is the raw GitHub URL of the file at its release
tag, for example:

```
https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json
```

Those URLs resolve once the release is tagged; validators should still load the schemas from local files rather than
fetching them at run time.

A record says what it is with `recordType` and `schemaVersion`, and may also carry `$schema` set to the schema's `$id`:

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
  for (const e of result.errors) console.log(e.path, e.message, `${e.source}:${e.keyword}`);
}
```

`validate` checks the JSON Schema first, then cross-field rules that JSON Schema can't express (a tally must match the
votes, a finding must point at a real assessment, a near miss can't have reached the patient). Each format's docs list
its rules. Pass `{ schemaOnly: true }` to skip them, or `{ recordType }` to force a format. `createAjv()` returns a
configured [Ajv](https://ajv.js.org) instance with every schema loaded.

### Command line

```sh
npx rws-validate examples/*/valid-*.json
npx rws-validate --json --schema board-action my-record.json
```

Exit code 0 means every file is valid, 1 means at least one isn't, and 2 means a usage or read error.

## Extensions

Every format closes its objects (`additionalProperties: false`) so typos are caught. For fields you need that a format
doesn't have, use `extensions` with a namespaced key:

```json
"extensions": { "examplecity:councilDistrict": "3" }
```

If several organizations need the same extension, propose it as a field.

## Versioning

Each schema is versioned on its own with [semantic versioning](https://semver.org), in its `schemaVersion` constant:

- **Patch**: descriptions and docs only; every record valid before is valid after, and the reverse.
- **Minor**: new optional fields or new enum values; every record valid before stays valid.
- **Major**: anything that can make a valid record invalid (new required fields, removed fields or values, tighter
  patterns).

Releases of this repository are tagged `vX.Y.Z`, and each schema's `$id` points at the tag where that version was
published, so an `$id` always refers to fixed content. Pre-1.0 versions may still change between minor versions; we'll
say so in the [changelog](CHANGELOG.md).

## Proposing a field or a format

Open an issue with the [proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml).
Tell us the workflow, who needs the data and why, and point to the public standard, rule or practice it comes from. See
[CONTRIBUTING.md](CONTRIBUTING.md) for how changes are made.

## Development

```sh
npm ci
npm test            # builds, then runs every test, including the docs and types sync checks
npm run typecheck
npm run types       # regenerate types/ after editing a schema
npm run docs        # regenerate docs/ after editing a schema or rule
```

Example data is fictional. Names of people, organizations and places in the examples are made up; identifiers are
placeholders.

## Security

See [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE). Copyright 2026 Moraph.
