# Governance

How the formats in this repository are maintained and how they change.

## Maintainers

[Moraph](https://www.moraph.com) maintains the repository and makes the final decision on changes. Maintainers review
proposals in public, in GitHub issues, and explain decisions there.

## What a change needs

Every schema change starts as an issue using the
[proposal template](https://github.com/moraph-com/regulated-workflow-schemas/issues/new?template=propose-field-or-schema.yml).
A proposal is accepted when a maintainer agrees that:

1. **It reflects real practice.** It comes from a public standard, regulation, guidance or a practice common to several
   organizations, cited in the issue, rather than from one organization's system.
2. **It is described accurately.** Field descriptions that refer to an outside document (AHRQ, WHO, OCC, NIST, ISO,
   BLDS, Robert's Rules) say only what that document says, and say which version. We would rather leave a concept out
   than describe it wrongly.
3. **It doesn't claim conformance.** The formats are informed by outside documents and map to them; they never claim
   to implement, comply with or be certified against them.
4. **It keeps sensitive data out where it can.** A new field that holds personal data needs a reason a reviewer can
   check, and is annotated with `x-sensitivity`.
5. **It is versioned honestly.** Anything that can make a currently valid record invalid is a major change (see the
   README's [Versioning](README.md#versioning) section), including new cross-field rules.

Proposals for a single organization's needs usually belong in `extensions`. When several organizations use the same
extension, propose it as a field.

## Enum values

Enumerated values (statuses, categories, roles) are closed lists, so every system that reads a record understands every
value in it. Lists change only by proposal. A new value is a minor change; removing or renaming one is a major change.
Lists that real-world variety outgrows have an `other` value and, nearly always, a free-text field for the detail.

## Domain review

Changes to a format are reviewed by someone who works in that domain (a patient safety officer, a third-party risk
analyst, a permit technician, a clerk) whenever one is available. Domain corrections from anyone are welcome and are
treated as bugs.

## Releases

Releases are tagged `vX.Y.Z` and recorded in [CHANGELOG.md](CHANGELOG.md). A schema's `$id` names the tag where that
version of the schema was published, so a published `$id` never changes meaning.
