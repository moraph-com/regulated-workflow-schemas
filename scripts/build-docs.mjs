// Generates docs/<format>.md (field tables, conditional requirements and cross-field rules) and docs/common.md from the
// schemas, so the docs can't drift from them. With --check, fails if the committed docs are stale. Needs a build first
// (it reads the rule descriptions from dist/).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { RULE_DOCS } from "../dist/rules.js";

const RECORD_TYPES = ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"];
const check = process.argv.includes("--check");
const read = (f) => JSON.parse(readFileSync(new URL(`../schemas/${f}`, import.meta.url), "utf8"));
const common = read("common.schema.json");

// Background for each format: what it's informed by. Kept here so each page is generated whole.
const ABOUT = {
  "vendor-risk-review": `## Informed by

- US interagency guidance on third-party relationships: risk management (OCC Bulletin 2023-17, issued jointly with the Federal Reserve and FDIC, June 2023). Its life cycle (planning, due diligence, contract negotiation, ongoing monitoring, termination) is the \`lifecycleStage\` field.
- NIST SP 800-161 Rev. 1, *Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations*: criticality, data and access, fourth parties.
- ISO/IEC 27036, *Information security for supplier relationships*.

The format records a review; it does not prescribe how to tier vendors or score risk. Put your method's name in \`inherentRisk.method\`.`,
  "patient-safety-incident": `## Informed by

- AHRQ Common Formats for Event Reporting (Hospital): the event types (incident, near miss, unsafe condition), the event categories and the harm scale concepts.
- WHO Conceptual Framework for the International Classification for Patient Safety (ICPS): incident type, patient outcome (harm), contributing factors, and actions taken to mitigate harm and reduce risk.
- The hierarchy of actions widely used in root cause analysis (stronger, intermediate, weaker): \`investigation.actions[].strength\`.

## Privacy by design

The \`patient\` block allows only an age band, sex and an opaque encounter reference: no names, dates of birth or record numbers, because \`additionalProperties\` is false there.

That keeps identifiers out of the structured fields; it does not make a record de-identified:

- Event, discovery and report dates, the facility and the location can identify a patient. Under the HIPAA Safe Harbor method, dates related to an individual (other than the year) are identifiers.
- The narrative fields ask reporters not to include identifiers, but a schema can't enforce that. Screen free text before sharing records outside the organization.
- An anonymous report has no \`reporter.contact\` (the schema enforces that), but \`statusHistory[].by\` and \`auditTrail[].actor\` can still name whoever submitted it. Systems that offer anonymous reporting should not record the reporter there.

Treat records as confidential. In the US, reports prepared for a patient safety organization may be patient safety work product with legal protections; this format does not decide that question.`,
  "permit-application": `## Informed by

- Common local-government permitting practice: intake, plan review by discipline in cycles, fees, inspections, issuance.
- The Building and Land Development Specification (BLDS), an open data standard for publishing permit data. Fields that correspond:

| This format | BLDS (permits) |
| --- | --- |
| \`decision.permitNumber\` (or \`id\`, where the application and permit share a number) | PermitNum |
| \`description\` | Description |
| \`submittedAt\` | AppliedDate |
| \`decision.decidedAt\` (outcome issued) | IssuedDate |
| \`status\` | StatusCurrent |
| \`site.address\` | OriginalAddress1, OriginalCity, OriginalState, OriginalZip |
| \`permitType.category\` / \`subtype\` | PermitType / PermitTypeDesc |
| \`permitType.workClass\` | WorkClass |
| \`site.parcelNumber\` | PIN |
| \`valuation\` | EstProjectCost |
| \`building.dwellingUnits\` | HousingUnits |
| \`site.location\` | Latitude, Longitude |
| \`permitType.residential\` | PermitClassMapped (Residential / Commercial) |
| \`building.area\` (in sq-ft) | TotalSqFt |
| \`decision.expiresOn\` | ExpiresDate |
| \`statusHistory\` (status finaled) | CompletedDate |
| \`parties[]\` with role contractor: \`organization.name\`, \`license.number\` | ContractorCompanyName, ContractorLicNum |

The mapping is a guide, not a certified crosswalk; check the BLDS version you publish to.

## Statutory clock

Many jurisdictions set a time limit for deciding permit applications, with different rules for when the clock starts, which days count and what pauses it. \`statutoryClock\` records the basis the jurisdiction relies on and the counting it applied; it does not compute deadlines. \`startedAt\` and pauses are instants with a UTC offset, while \`dueOn\` is a calendar date; \`timeZone\` names the IANA zone whose calendar the days are counted in, so a deadline near midnight means the same day to every system.`,
  "board-action": `## Informed by

- Parliamentary procedure as described in *Robert's Rules of Order*: main and secondary motions, seconds, vote thresholds, the presiding officer.
- Common open-meetings practice for public bodies: notice, quorum, open and closed sessions with a stated basis, public comment, recusal on the record, minutes.

One record covers one agenda item. A meeting with ten items produces ten records that share \`meeting.id\`. Members are listed with ids so motions, votes and recusals can refer to them and be checked.`,
};

const anchor = (s) => s.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-");
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");

function resolve(node, local) {
  if (!node.$ref) return { node, ref: null };
  const [file, ptr] = node.$ref.split("#");
  const name = ptr.split("/").pop();
  const isCommon = file === "common.schema.json" || (file === "" && (local === common || !local.$defs?.[name]));
  const target = isCommon ? common.$defs[name] : local.$defs[name];
  return { node: { ...target, ...(node.description ? { description: node.description } : {}) }, ref: isCommon ? name : null };
}

function typeLabel(node, ref, local) {
  if (ref && common.$defs[ref].type === "object") return `[${common.$defs[ref].title}](common.md#${anchor(common.$defs[ref].title)})`;
  if (node.const !== undefined) return `\`${JSON.stringify(node.const)}\``;
  if (node.enum) return "enum";
  if (node.type === "array") {
    const { node: item, ref: iref } = resolve(node.items, local);
    return `array of ${typeLabel(item, iref, local)}`;
  }
  if (node.type === "string" && node.format) return `string (${node.format})`;
  if (node.type === "string" && node.pattern && ref) return `string (${common.$defs[ref].title.toLowerCase()})`;
  return node.type ?? "any";
}

function rows(obj, local, prefix, out) {
  const req = new Set(obj.required ?? []);
  for (const [k, raw] of Object.entries(obj.properties ?? {})) {
    const { node, ref } = resolve(raw, local);
    const path = `${prefix}${k}`;
    const enumNote = node.enum ? ` Values: ${node.enum.map((v) => `\`${v}\``).join(", ")}.` : "";
    out.push(`| \`${path}\` | ${typeLabel(node, ref, local)} | ${req.has(k) ? "yes" : ""} | ${esc(node.description)}${node.enum && !node.description?.includes(node.enum[0]) ? enumNote : ""} |`);
    if (ref) continue;
    if (node.type === "object" && node.properties) rows(node, local, `${path}.`, out);
    if (node.type === "array" && node.items) {
      const { node: item, ref: iref } = resolve(node.items, local);
      if (!iref && item.type === "object" && item.properties) rows(item, local, `${path}[].`, out);
    }
  }
  return out;
}

// Conditional requirements (if/then, anyOf of required) anywhere in the schema, described in words.
function conditions(node, local, path, out) {
  if (!node || typeof node !== "object") return out;
  const { node: n } = node.$ref && !node.$ref.startsWith("common") ? resolve(node, local) : { node };
  const at = path || "the record";
  const ifs = [n, ...(n.allOf ?? [])].filter((x) => x.if);
  for (const x of ifs) {
    if (x.if.contains) {
      if (x.then.maxItems === 1) out.push(`- \`${at}\` holds nothing else when it contains \`${JSON.stringify(x.if.contains.const)}\`.`);
      continue;
    }
    const [field, cond] = Object.entries(x.if.properties)[0];
    if (x.then.required) out.push(`- In \`${at}\`, when \`${field}\` is \`${JSON.stringify(cond.const)}\`, \`${x.then.required.join("`, `")}\` ${x.then.required.length > 1 ? "are" : "is"} required${x.then.properties?.[x.then.required[0]]?.minItems ? " and must not be empty" : ""}.`);
    if (x.then.not?.required) out.push(`- In \`${at}\`, when \`${field}\` is \`${JSON.stringify(cond.const)}\`, \`${x.then.not.required.join("`, `")}\` must be left out.`);
  }
  if (n.anyOf?.every((a) => a.required)) out.push(`- \`${at}\` needs at least one of \`${n.anyOf.map((a) => a.required[0]).join("`, `")}\`.`);
  for (const [k, v] of Object.entries(n.properties ?? {})) {
    const p = path ? `${path}.${k}` : k;
    conditions(v, local, p, out);
    if (v.items) conditions(v.items, local, `${p}[]`, out);
  }
  return out;
}

const BANNER = "<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->";
const outputs = new Map();
for (const t of RECORD_TYPES) {
  const s = read(`${t}.schema.json`);
  const cond = [...new Set(conditions(s, s, "", []))];
  const rules = Object.entries(RULE_DOCS[t]).map(([k, v]) => `| \`${k}\` | ${v} |`);
  outputs.set(
    `${t}.md`,
    `${BANNER}
# ${s.title}

${s.description}

- Schema: [\`schemas/${t}.schema.json\`](../schemas/${t}.schema.json)
- \`$id\`: \`${s.$id}\`
- \`recordType\`: \`${t}\`, \`schemaVersion\`: \`${s.properties.schemaVersion.const}\`
- Examples: [\`examples/${t}/\`](../examples/${t}/)

${ABOUT[t]}

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
${rows(s, s, "", []).join("\n")}

## Conditional requirements

${cond.length ? cond.join("\n") : "None."}

## Cross-field rules

JSON Schema can't check these; the validator in this package does (\`rws-validate\`, or \`validate()\` without \`schemaOnly\`).

| Rule | Checks that |
| --- | --- |
${rules.join("\n")}
`,
  );
}

const defs = Object.entries(common.$defs).map(([name, d]) => {
  const head = `## ${d.title}\n\n\`#/$defs/${name}\`: ${d.description}\n`;
  if (d.type !== "object" || !d.properties) {
    const extra = d.pattern ? ` Pattern: \`${d.pattern}\`.` : d.format ? ` Format: \`${d.format}\`.` : "";
    return `${head}\nType: ${d.type}.${extra}\n`;
  }
  return `${head}\n| Field | Type | Required | Description |\n| --- | --- | --- | --- |\n${rows(d, common, "", []).join("\n")}\n`;
});
outputs.set(
  "common.md",
  `${BANNER}
# Common definitions

${common.description}

Schema: [\`schemas/common.schema.json\`](../schemas/common.schema.json). Refer to these from your own schemas with \`common.schema.json#/$defs/<name>\`.

${defs.join("\n")}`,
);

const stale = [];
for (const [file, text] of outputs) {
  const url = new URL(`../docs/${file}`, import.meta.url);
  if (check) {
    if (!existsSync(url) || readFileSync(url, "utf8") !== text) stale.push(file);
  } else writeFileSync(url, text);
}
if (check && stale.length) {
  console.error(`Docs are out of date: ${stale.join(", ")}. Run npm run build && npm run docs and commit the result.`);
  process.exit(1);
}
console.log(check ? "Docs are up to date." : `Wrote ${outputs.size} files to docs/.`);
