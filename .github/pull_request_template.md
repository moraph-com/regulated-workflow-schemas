<!-- Thanks for contributing. Please link the issue this implements; schema changes need an agreed proposal first. -->

## What and why

## Checklist

- [ ] Examples are fictional; no real records, even redacted.
- [ ] Schema changes have a `description` for every new property, written for the people who fill in records, and cite
      the source concept where there is one.
- [ ] New or changed rules have a WHY comment in `src/rules.ts` and an entry in `RULE_DOCS`.
- [ ] Valid and invalid examples cover the change (`invalid-*.expect.json` lists the exact errors).
- [ ] `npm run types` and `npm run docs` were run and the results committed.
- [ ] `npm test`, `npm run typecheck`, `npm run lint` and `npm run format:check` pass.
- [ ] `CHANGELOG.md` says what changed, and whether it can make a valid record invalid.
