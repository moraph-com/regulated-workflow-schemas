# Changelog

All notable changes are recorded here. Each schema is versioned separately (see the README); repository releases are
tagged `vX.Y.Z`.

## 0.1.0 (unreleased)

First public draft.

- `vendor-risk-review` 0.1.0
- `patient-safety-incident` 0.1.0
- `permit-application` 0.1.0
- `board-action` 0.1.0
- `common.schema.json`: identifiers, people, organizations, money, addresses, places, jurisdictions, attachments,
  status history, audit trail, extensions.
- Validator library and `rws-validate` command line, with cross-field rules for each format.
- Generated TypeScript types and field-by-field docs.
- Each format's `statusHistory` accepts only that format's status values.
- `permit-application`: `revoked` status; `statutoryClock.timeZone` (IANA zone the days are counted in).
- `vendor-risk-review`: `dataCategories` can't combine `none` with other categories.
- Cross-field rules for unique ids in every format; board vote thresholds, attendance and seconds; incident and unsafe
  condition consistency; permit and vendor status matching the decision.
- `validate` reports a `$schema` that contradicts `recordType` as one error; `rws-validate -` reads stdin.
