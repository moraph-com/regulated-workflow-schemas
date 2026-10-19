# Changelog

All notable changes are recorded here. Each schema is versioned separately (see the README); repository releases are
tagged `vX.Y.Z`.

## 0.1.0 (unreleased)

First public draft.

- `vendor-risk-review` 0.1.0, `patient-safety-incident` 0.1.0, `permit-application` 0.1.0, `board-action` 0.1.0.
- `common.schema.json`: identifiers, dates, codes, people, organizations, money, addresses, places, jurisdictions,
  attachments, status history, audit trail, extensions.
- Detailed descriptions on every property and definition: why the field exists, how to fill it in, and the outside
  concept it maps to, with `examples`. Fields holding personal data or narrative carry an `x-sensitivity` annotation
  (`personal` or `free-text`), shown in the docs.
- Validator library and `rws-validate` command line, with cross-field rules for each format. The validators are
  precompiled at build time, so `validate()` runs without file access or `eval`: in Node.js, browsers and Cloudflare
  Workers. `createAjv()` moved to the `@moraph/regulated-workflow-schemas/ajv` entry point.
- Errors in plain language: a choice between fields is one message, conditional requirements say which condition
  applied, and type, format, pattern and list errors explain the expected form.
- `rws-validate` accepts files with a UTF-8 byte order mark, reports unreadable files without hiding other results,
  prints a summary, and expands `*` itself where the shell doesn't (Node.js 22 or later).
- Rules shared by every format: `statusHistory` and `auditTrail` are oldest first, `statusHistory` ends at the current
  status, `updatedAt` is not before `createdAt`.
- `board-action`: thresholds renamed and extended to follow Robert's Rules of Order Newly Revised (majority or
  two-thirds of votes cast, of members present, or of the entire membership); new rules for quorum, absent members
  moving or seconding, complete roll calls, and outcomes backed by an adopted motion. Recusal and abstention are
  distinguished in the descriptions.
- `patient-safety-incident`: age bands follow the AHRQ Common Formats patient age categories; near misses and unsafe
  conditions have no harm assessment (the AHRQ harm scale's "no harm" means the event reached the patient); an unsafe
  condition has no patient block; anonymous reports must not name the reporter in the submission entries;
  `encounterRef` must be a surrogate, not a record or account number.
- `permit-application`: `statutoryClock.timeZone` is required with `dueOn`; BLDS 1.2 mapping corrected (mapped and raw
  fields, residential classification, status mapping, fees, dates); more date-order checks.
- `vendor-risk-review`: life-cycle stages, critical activities and subcontractors described as in OCC Bulletin
  2023-17, with a note on the September 2026 proposed replacement guidance; more date-order checks; the payroll example
  no longer labels employee data as GLBA nonpublic personal information.
- Repository: Code of Conduct (Contributor Covenant 2.1), governance, issue and pull request templates, Prettier and
  ESLint in CI, and a second JSON Schema implementation (@hyperjump/json-schema) in the tests.
