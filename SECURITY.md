# Security

## Reporting a vulnerability

Please report suspected vulnerabilities in this repository privately, not in a public issue:

- Email **security@moraph.com**, or
- use GitHub's [private vulnerability reporting](https://github.com/moraph-com/regulated-workflow-schemas/security/advisories/new).

Moraph's vulnerability reporting policy is at https://trust.moraph.com/vulnerability-reporting and its security contact
file at https://www.moraph.com/.well-known/security.txt.

We'll acknowledge your report, keep you updated while we investigate, and credit you when a fix is released if you
want us to.

## Scope

This repository holds JSON Schemas, a validator and generated types. Relevant reports include:

- inputs that make the validator crash, hang or use excessive memory;
- schema patterns vulnerable to catastrophic backtracking (ReDoS);
- schemas that accept data they document as rejected, where that weakens a privacy property (for example, direct
  patient identifiers getting past the `patient` block of `patient-safety-incident`).

## Supported versions

Fixes go into the latest release.
