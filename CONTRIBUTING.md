# Contributing

Thanks for helping. Issues and pull requests are welcome from anyone who works with these workflows: risk and
compliance teams, clinicians and patient safety staff, permit technicians and plan reviewers, clerks and board
secretaries, and the people who build their software. Everyone taking part is expected to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

For anything beyond a typo, open an issue first with the
[proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml)
so we can agree on the shape before you write it. Good proposals:

- describe the workflow and who needs the data;
- cite the public standard, regulation or common practice behind it;
- give a realistic, fictional example value;
- say whether the change can make a currently valid record invalid (a major version change, see the README).

[GOVERNANCE.md](GOVERNANCE.md) explains how proposals are decided.

## Design rules for schemas

- Every property and definition has a `description` written for the people who fill in the record: what it is, why it
  exists, how to fill it in, and the outside concept it maps to, with the document's name and version. Every enum value
  is explained in its description. Add `examples` where a value's form isn't obvious.
- Say only what a cited document says. Never claim certification or conformance; say a format is informed by, follows
  the concepts of, or maps to a document.
- Objects set `additionalProperties: false`. Local needs go in `extensions`.
- Enum values are lower-case kebab-case. Closed lists have an `other` value where real-world variety needs one.
- Money is `common.schema.json#/$defs/money` (decimal strings). Dates and times are RFC 3339, instants always with a UTC
  offset. Countries and subdivisions are ISO 3166 codes. Currencies are ISO 4217.
- Require only what every organization will have. Prefer optional fields with clear descriptions.
- Keep sensitive data out where possible (see the patient block in `patient-safety-incident`). Mark fields that
  identify or contact a person `"x-sensitivity": "personal"` and narrative fields `"x-sensitivity": "free-text"`.
- A rule JSON Schema can't express goes in `src/rules.ts`, with a WHY comment naming the real-world mistake it prevents,
  and an entry in `RULE_DOCS`.

## Making a change

1. Edit the schema in `schemas/`.
2. Add or update examples in `examples/<format>/`: `valid-*.json` must pass; each `invalid-*.json` needs an
   `invalid-*.expect.json` with the reason and the exact list of errors it must produce (`source`, `keyword`, `path`).
3. Run `npm run types && npm run docs` and commit the regenerated `types/` and `docs/`.
4. Run `npm test`, `npm run typecheck`, `npm run lint` and `npm run format:check` (or `npm run format` to fix).
5. Bump the schema's `schemaVersion` (and its `$id` tag at release time) and add a line to `CHANGELOG.md`.

All example data must be fictional. Don't paste real records, even redacted ones.

## How the code is laid out

- `schemas/`: the JSON Schemas, the source of truth.
- `scripts/build-generated.mjs`: bundles the schemas into `src/generated/` and precompiles them into standalone
  validators, so the library needs neither file access nor `eval` at run time.
- `src/index.ts` (`validate`, error messages), `src/rules.ts` (cross-field rules), `src/schemas.ts`, `src/ajv.ts`
  (`createAjv`, a separate entry point), `src/cli.ts` (`rws-validate`).
- `scripts/build-types.mjs` and `scripts/build-docs.mjs`: generate `types/` and `docs/` from the schemas.
- `test/`: Node's built-in test runner; `npm test` builds first.

## License

By contributing you agree that your contribution is licensed under the Apache License 2.0, the license of this
repository.
