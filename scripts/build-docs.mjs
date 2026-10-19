// Generates docs/<format>.md (field tables, conditional requirements and cross-field rules) and docs/common.md from the
// schemas, so the docs can't drift from them. With --check, fails if the committed docs are stale. Needs a build first
// (it reads the rule descriptions from dist/).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { RULE_DOCS } from "../dist/rules.js";

const RECORD_TYPES = ["vendor-risk-review", "patient-safety-incident", "permit-application", "board-action"];
const check = process.argv.includes("--check");
const read = (f) => JSON.parse(readFileSync(new URL(`../schemas/${f}`, import.meta.url), "utf8"));
const common = read("common.schema.json");

// Background for each format: what it's informed by, how it maps to outside specifications, and caveats. Kept here so
// each page is generated whole from one place. Every claim about an outside document was checked against the source
// named; when a source changes, update the text here and regenerate.
const ABOUT = {
  "vendor-risk-review": `## Informed by

- **Interagency Guidance on Third-Party Relationships: Risk Management** (Board of Governors of the Federal Reserve System, FDIC and OCC, June 2023; [OCC Bulletin 2023-17](https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html)). Its third-party relationship life cycle (planning; due diligence and third-party selection; contract negotiation; ongoing monitoring; termination) is the \`lifecycleStage\` field. Oversight and accountability, independent reviews, and documentation and reporting run through the whole life cycle in the guidance, so they are not stages here. Its description of critical activities is quoted in \`services[].supportsCriticalActivity\`, and its term for a third party's own suppliers, subcontractors, is used in \`access.subcontractors\`.
- In September 2026 the same agencies, joined by the NCUA, proposed replacement guidance ([OCC Bulletin 2026-46](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-46.html)) that would organize third-party risk management around risk management components instead of life-cycle stages. This format follows the 2023 guidance, which applies until any replacement is final; it will be revised if the replacement is adopted.
- **NIST SP 800-161 Rev. 1**, *Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations* (May 2022, updated November 2024): criticality, data and access, subcontractors in the supply chain.
- **ISO/IEC 27036**, *Cybersecurity — Supplier relationships* (parts 1 to 3): the supplier relationship concepts behind assessments, findings and remediation.

The format records a review. It doesn't prescribe how to tier vendors or score risk (name your method in \`inherentRisk.method\`), and recording reviews in it doesn't by itself meet any of the guidance above.`,
  "patient-safety-incident": `## Informed by

- **AHRQ Common Formats for Event Reporting – Hospital** (Agency for Healthcare Research and Quality; current version 2.0, published through the [PSO Privacy Protection Center](https://www.psoppc.org)). From it come the three event types (incident, near miss, unsafe condition), the event categories in \`eventCategory\`, the harm levels in \`harm.level\` (the Harm Scale of version 1.2: death, severe, moderate, mild, no harm, unknown) and the patient age bands in \`patient.ageBand\` (from the version 1.1 patient information form). Definitions in the field descriptions are summaries; the AHRQ documents are authoritative. A record in this format is not a Common Formats submission: a patient safety organization that accepts Common Formats data needs it mapped to that specification's own data elements.
- **WHO Conceptual Framework for the International Classification for Patient Safety (ICPS)**, version 1.1 (2009): incident (no-harm and harmful), near miss and reportable circumstance; degree of harm; contributing factors and hazards; ameliorating actions and actions taken to reduce risk. The ICPS term for each concept is noted in the field descriptions.
- **The action hierarchy** used in root cause analysis (US Department of Veterans Affairs National Center for Patient Safety; RCA², National Patient Safety Foundation, 2015): \`investigation.actions[].strength\`.

The format is not certified by AHRQ or WHO and is not an implementation of either.

## Privacy by design

Patient safety records describe care given to real people, so the format keeps patient information to what analysis needs:

- The \`patient\` block allows only an age band, sex and an opaque encounter reference, and it is closed (\`additionalProperties: false\`), so a name, date of birth, medical record number or address put there is rejected, not stored. Ages are bands, not dates of birth.
- \`patient.encounterRef\` must be a surrogate key held in a lookup table inside the organization, not the medical record, account or visit number (those are identifiers under HIPAA). With the lookup table it re-identifies the patient, so don't share it outside the organization.
- Fields that can hold personal data or narrative are marked \`x-sensitivity\` in the schema (\`personal\` or \`free-text\`), and in the table below, so export and redaction tools can find them.

That keeps identifiers out of the structured fields. It does not make a record de-identified:

- Event, discovery and report dates, the facility and the location can identify a patient. Under the HIPAA Safe Harbor method (45 CFR 164.514(b)(2)), all elements of dates related to an individual other than the year are identifiers.
- The narrative fields ask reporters not to include identifiers, but a schema can't enforce that. Screen free text before sharing records outside the organization.
- Staff named in the record (the reporter, the harm assessor, the investigation lead, action owners) are personal data too.
- An anonymous report has no \`reporter.contact\` (the schema enforces that), and the validator checks that the submission entries in \`statusHistory\` and \`auditTrail\` don't name the reporter. Systems must keep the reporter out of everything else they record about the report.

Treat every record as confidential. In the US, information prepared for reporting to a patient safety organization may be patient safety work product with privilege and confidentiality protections under the Patient Safety and Quality Improvement Act of 2005; this format records whether a report was submitted to a PSO and does not decide that question.`,
  "permit-application": `## Informed by

- Common local-government permitting practice: intake and completeness review, plan review by discipline in cycles, fees, statutory review deadlines, issuance, inspections and final.
- The **Building and Land Development Specification (BLDS)**, version 1.2 ([permitdata.org](https://github.com/open-data-standards/permitdata.org/wiki)), an open data specification for publishing permit data. BLDS is no longer actively maintained, but many jurisdictions' open data portals still publish to it.

## Mapping to BLDS

The core BLDS permits dataset has one row per permit. These fields correspond:

| This format | BLDS (core permits dataset) | Notes |
| --- | --- | --- |
| \`decision.permitNumber\` (or \`id\`, where the application and permit share a number) | PermitNum | |
| \`description\` | Description | |
| \`submittedAt\` | AppliedDate | BLDS dates are YYYY-MM-DD; take the date in the jurisdiction's time zone. |
| \`decision.decidedAt\` (outcome \`issued\`) | IssuedDate | As above. |
| \`statusHistory\` entry with status \`finaled\` | CompletedDate | As above. |
| \`status\` | StatusCurrent, StatusCurrentMapped | StatusCurrent is the jurisdiction's own wording; StatusCurrentMapped uses the values below. |
| \`site.address\` | OriginalAddress1, OriginalAddress2, OriginalCity, OriginalState, OriginalZip | |
| \`site.parcelNumber\` | PIN | |
| \`site.location\` | Latitude, Longitude | |
| \`permitType.category\` | PermitTypeMapped | building, demolition, electrical, mechanical, plumbing and grading map directly. BLDS's Roof, Fence and Pool/Spa are \`building\` here, with the specific type in \`subtype\`. |
| \`permitType.subtype\` | PermitType, PermitTypeDesc | |
| \`permitType.workClass\` | WorkClass, WorkClassMapped | WorkClassMapped: \`new\` is New; every other value is Existing. |
| \`permitType.residential\` | PermitClass, PermitClassMapped | PermitClassMapped's Residential means single-family and duplex only; multifamily is Non-Residential. Check the building type before mapping \`true\`. |
| \`valuation\` | EstProjectCost | |
| \`building.area\` (converted to square feet) | TotalSqFt | |
| \`decision.expiresOn\` | ExpiresDate | Optional in BLDS. |
| sum of \`fees[].amount\` | Fee | Optional in BLDS; a single number in any currency. |
| \`parties[]\` with role \`contractor\`: \`organization.name\`, \`license.number\`, \`license.issuer\` | ContractorCompanyName, ContractorLicNum, ContractorStateLic | |

BLDS HousingUnits is the number of units in the building; \`building.dwellingUnits\` is the net change made by the work, so they map only for new buildings.

Statuses to BLDS StatusCurrentMapped:

| \`status\` | StatusCurrentMapped |
| --- | --- |
| \`draft\` | (not published) |
| \`submitted\`, \`intake-review\`, \`incomplete\` | Application Accepted |
| \`in-review\`, \`corrections-required\` | In Review |
| \`approved\` (approved, not yet issued) | Fees/Payment, when issuance waits on fees |
| \`issued\` | Permit Issued |
| \`under-inspection\` | Inspection Phase |
| \`finaled\` | Permit Finaled (or Permit Finaled with Conditions) |
| \`denied\`, \`withdrawn\`, \`expired\`, \`revoked\` | Permit Cancelled (BLDS has no closer value) |

BLDS also has Occupancy and Appeal, which have no status here. The mappings are a guide, not a certified crosswalk; check them against the BLDS version and the publishing rules you use.

## Statutory clock

Many jurisdictions set a time limit for deciding permit applications, with different rules for when the clock starts, which days count and what pauses it, and some deem an application approved when the limit passes. \`statutoryClock\` records the basis the jurisdiction relies on and the counting it applied; it does not compute deadlines. \`startedAt\` and pauses are instants with a UTC offset, while \`dueOn\` is a calendar date; \`timeZone\` (required with \`dueOn\`) names the IANA zone whose calendar the days are counted in, so a deadline near midnight means the same day to every system.`,
  "board-action": `## Informed by

- **Robert's Rules of Order Newly Revised** (RONR, 12th edition, 2020), the parliamentary authority most US bodies adopt: main and secondary motions, seconds, the presiding officer, general (unanimous) consent, quorum, and the bases for determining a voting result. The thresholds follow RONR's definitions: a majority vote is more than half of the votes cast, and abstentions are not votes cast (RONR 44:1); a two-thirds vote is at least two-thirds of the votes cast (44:3); when a rule requires a majority or two-thirds of the members present or of the entire membership, an abstention has the same effect as a no (44:9). RONR describes a motion that doesn't get the votes it needs as lost; this format calls that result \`failed\`.
- Conflict-of-interest practice: RONR says a member with a direct personal or pecuniary interest in a question not common to other members should not vote on it, but can't be compelled to abstain (45:4). A **recusal** here is the stronger act that conflict-of-interest laws and policies require of public officials and directors: the member takes no part in the item. An **abstention** is a member taking part but declining to vote.
- Common open-meetings practice for public bodies: notice, quorum, open and closed sessions with a stated basis, public comment, recusal on the record, minutes.

Bylaws, charters, statutes and special rules override RONR, and many bodies follow other authorities. The format records what the body did; the validator's \`threshold-met\` rule checks only the arithmetic of the threshold the record states.

One record covers one agenda item. A meeting with ten items produces ten records that share \`meeting.id\`. Members are listed with ids so motions, votes and recusals can refer to them and be checked.`,
};

const anchor = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
const esc = (s) =>
  String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");

function resolve(node, local) {
  if (!node.$ref) return { node, ref: null };
  const [file, ptr] = node.$ref.split("#");
  const name = ptr.split("/").pop();
  const isCommon = file === "common.schema.json" || (file === "" && (local === common || !local.$defs?.[name]));
  const target = isCommon ? common.$defs[name] : local.$defs[name];
  return {
    node: { ...target, ...(node.description ? { description: node.description } : {}) },
    ref: isCommon ? name : null,
  };
}

function typeLabel(node, ref, local) {
  if (ref && common.$defs[ref].type === "object")
    return `[${common.$defs[ref].title}](common.md#${anchor(common.$defs[ref].title)})`;
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
    const examples = (raw.examples ?? node.examples ?? []).filter((x) => typeof x === "string");
    const exampleNote = examples.length
      ? ` Example${examples.length > 1 ? "s" : ""}: ${examples.map((x) => `\`${esc(x)}\``).join(", ")}.`
      : "";
    const sensitivity = raw["x-sensitivity"] ?? node["x-sensitivity"] ?? "";
    out.push(
      `| \`${path}\` | ${typeLabel(node, ref, local)} | ${req.has(k) ? "yes" : ""} | ${sensitivity} | ${esc(node.description)}${node.enum && !node.description?.includes(node.enum[0]) ? enumNote : ""}${exampleNote} |`,
    );
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
      if (x.then.maxItems === 1)
        out.push(`- \`${at}\` holds nothing else when it contains \`${JSON.stringify(x.if.contains.const)}\`.`);
      continue;
    }
    const [field, cond] = Object.entries(x.if.properties)[0];
    if (x.then.required)
      out.push(
        `- In \`${at}\`, when \`${field}\` is \`${JSON.stringify(cond.const)}\`, \`${x.then.required.join("`, `")}\` ${x.then.required.length > 1 ? "are" : "is"} required${x.then.properties?.[x.then.required[0]]?.minItems ? " and must not be empty" : ""}.`,
      );
    if (x.then.not?.required)
      out.push(
        `- In \`${at}\`, when \`${field}\` is \`${JSON.stringify(cond.const)}\`, \`${x.then.not.required.join("`, `")}\` must be left out.`,
      );
  }
  for (const [field, needs] of Object.entries(n.dependentRequired ?? {}))
    out.push(
      `- In \`${at}\`, when \`${field}\` is given, \`${needs.join("`, `")}\` ${needs.length > 1 ? "are" : "is"} required.`,
    );
  if (n.anyOf?.every((a) => a.required))
    out.push(`- \`${at}\` needs at least one of \`${n.anyOf.map((a) => a.required[0]).join("`, `")}\`.`);
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

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md). Sensitivity is the schema's \`x-sensitivity\` annotation: \`personal\` fields identify or contact a person, and \`free-text\` fields are narrative that may contain anything, including personal data, so screen them before sharing records. Fields of a linked type inherit that type's sensitivity (every [Person](common.md#person) is personal).

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
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
    const ex = d.examples?.length
      ? ` Examples: ${d.examples.map((x) => `\`${typeof x === "string" ? x : JSON.stringify(x)}\``).join(", ")}.`
      : "";
    return `${head}\nType: ${d.type}.${extra}${ex}\n`;
  }
  const ex = d.examples?.length ? `\nExample:\n\n\`\`\`json\n${JSON.stringify(d.examples[0], null, 2)}\n\`\`\`\n` : "";
  return `${head}${ex}\n| Field | Type | Required | Sensitivity | Description |\n| --- | --- | --- | --- | --- |\n${rows(d, common, "", []).join("\n")}\n`;
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
