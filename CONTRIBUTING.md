# Contributing

Thanks for helping. Issues and pull requests are welcome from anyone who works with these workflows: risk and
compliance teams, clinicians and patient safety staff, permit technicians and plan reviewers, clerks and board
secretaries, and the people who build their software.

## Before you start

For anything beyond a typo, open an issue first with the
[proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml)
so we can agree on the shape before you write it. Good proposals:

- describe the workflow and who needs the data;
- cite the public standard, regulation or common practice behind it;
- give a realistic example value;
- say whether the change can make a currently valid record invalid (a major version change, see the README).

## Design rules for schemas

- Every property has a `description` written for the people who fill in the record. Enums list their values in the
  description.
- Objects set `additionalProperties: false`. Local needs go in `extensions`.
- Enum values are lower-case kebab-case.
- Money is `common.schema.json#/$defs/money` (decimal strings). Dates and times are RFC 3339. Countries and
  subdivisions are ISO 3166 codes. Currencies are ISO 4217.
- Require only what every organization will have. Prefer optional fields with clear descriptions.
- Keep sensitive data out of the format where possible (see the patient block in `patient-safety-incident`).
- A rule JSON Schema can't express goes in `src/rules.ts` with an entry in `RULE_DOCS`.
- Don't claim certification or conformance with a standard; say a format is informed by or aligned with it.

## Making a change

1. Edit the schema in `schemas/`.
2. Add or update examples in `examples/<format>/`: `valid-*.json` must pass; each `invalid-*.json` needs an
   `invalid-*.expect.json` with the reason and the error it must produce (`source`, `keyword`, `path`).
3. Run `npm run build && npm run types && npm run docs` and commit the regenerated `types/` and `docs/`.
4. Run `npm test` and `npm run typecheck`.
5. Bump the schema's `schemaVersion` (and its `$id` tag at release time) and add a line to `CHANGELOG.md`.

All example data must be fictional. Don't paste real records, even redacted ones.

## License

By contributing you agree that your contribution is licensed under the Apache License 2.0, the license of this
repository.
