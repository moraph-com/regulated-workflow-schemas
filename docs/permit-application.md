<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Permit application

An application for a building, land-use or other local-government permit, from submission through plan review, fees, inspections and decision, including the statutory review clock. Informed by common local-government permitting practice and the Building and Land Development Specification (BLDS); the docs map fields to BLDS where they correspond.

- Schema: [`schemas/permit-application.schema.json`](../schemas/permit-application.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/permit-application.schema.json`
- `recordType`: `permit-application`, `schemaVersion`: `0.1.0`
- Examples: [`examples/permit-application/`](../examples/permit-application/)

## Informed by

- Common local-government permitting practice: intake, plan review by discipline in cycles, fees, inspections, issuance.
- The Building and Land Development Specification (BLDS), an open data standard for publishing permit data. Fields that correspond:

| This format | BLDS (permits) |
| --- | --- |
| `decision.permitNumber` (or `id`, where the application and permit share a number) | PermitNum |
| `description` | Description |
| `submittedAt` | AppliedDate |
| `decision.decidedAt` (outcome issued) | IssuedDate |
| `status` | StatusCurrent |
| `site.address` | OriginalAddress1, OriginalCity, OriginalState, OriginalZip |
| `permitType.category` / `subtype` | PermitType / PermitTypeDesc |
| `permitType.workClass` | WorkClass |
| `site.parcelNumber` | PIN |
| `valuation` | EstProjectCost |
| `building.dwellingUnits` | HousingUnits |
| `site.location` | Latitude, Longitude |
| `permitType.residential` | PermitClassMapped (Residential / Commercial) |
| `building.area` (in sq-ft) | TotalSqFt |
| `decision.expiresOn` | ExpiresDate |
| `statusHistory` (status finaled) | CompletedDate |
| `parties[]` with role contractor: `organization.name`, `license.number` | ContractorCompanyName, ContractorLicNum |

The mapping is a guide, not a certified crosswalk; check the BLDS version you publish to.

## Statutory clock

Many jurisdictions set a time limit for deciding permit applications, with different rules for when the clock starts, which days count and what pauses it. `statutoryClock` records the basis the jurisdiction relies on and the counting it applied; it does not compute deadlines. `startedAt` and pauses are instants with a UTC offset, while `dueOn` is a calendar date; `timeZone` names the IANA zone whose calendar the days are counted in, so a deadline near midnight means the same day to every system.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | string (uri) |  | The $id of this schema, so readers can tell what the record is. |
| `recordType` | `"permit-application"` | yes | Always permit-application. |
| `schemaVersion` | `"0.1.0"` | yes | The version of this format the record follows. |
| `id` | string (identifier) | yes | This application's identifier, unique within the system that created it. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  | Ids for this application in other systems, for example the jurisdiction's permitting system. |
| `createdAt` | string (date-time) |  | When the record was created. |
| `updatedAt` | string (date-time) |  | When the record was last changed. |
| `jurisdiction` | [Jurisdiction](common.md#jurisdiction) | yes | The jurisdiction whose permit is sought. |
| `permitType` | object | yes | What kind of permit is sought. |
| `permitType.category` | enum | yes | building, demolition, electrical, mechanical, plumbing, fire, grading, right-of-way, sign, zoning, land-use, environmental, special-event or other. |
| `permitType.subtype` | string |  | The jurisdiction's own permit type name, for example Residential Addition. |
| `permitType.workClass` | enum |  | new, addition, alteration, repair, demolition, change-of-use or other. |
| `permitType.residential` | boolean |  | Whether the work is residential (true) or commercial and other (false). |
| `description` | string |  | What the applicant proposes to do. |
| `valuation` | [Money](common.md#money) |  | Declared value of the work. |
| `applicant` | object | yes | Who is applying. |
| `applicant.role` | enum | yes | owner, applicant, contractor, architect, engineer, agent, tenant or other. |
| `applicant.person` | [Person](common.md#person) |  | The person. |
| `applicant.organization` | [Organization](common.md#organization) |  | The organization. |
| `applicant.mailingAddress` | [Postal address](common.md#postal-address) |  | Where to send notices. |
| `applicant.license` | object |  | A professional or contractor license held by the party. |
| `applicant.license.number` | string | yes | The license number. |
| `applicant.license.type` | string |  | The license class, for example General Building Contractor. |
| `applicant.license.issuer` | string |  | The licensing board or agency. |
| `applicant.license.expiresOn` | string (date) |  | When it expires. |
| `parties` | array of object |  | Owners, contractors, design professionals and agents on the application besides the applicant. |
| `parties[].role` | enum | yes | owner, applicant, contractor, architect, engineer, agent, tenant or other. |
| `parties[].person` | [Person](common.md#person) |  | The person. |
| `parties[].organization` | [Organization](common.md#organization) |  | The organization. |
| `parties[].mailingAddress` | [Postal address](common.md#postal-address) |  | Where to send notices. |
| `parties[].license` | object |  | A professional or contractor license held by the party. |
| `parties[].license.number` | string | yes | The license number. |
| `parties[].license.type` | string |  | The license class, for example General Building Contractor. |
| `parties[].license.issuer` | string |  | The licensing board or agency. |
| `parties[].license.expiresOn` | string (date) |  | When it expires. |
| `site` | object | yes | Where the work will happen. |
| `site.parcelNumber` | string |  | The assessor's parcel number (APN) or equivalent land identifier. |
| `site.address` | [Postal address](common.md#postal-address) |  | The site's street address. |
| `site.location` | [Geographic point](common.md#geographic-point) |  | The site's coordinates. |
| `site.zoning` | string |  | The parcel's zoning designation, as the jurisdiction writes it. |
| `site.floodZone` | string |  | The flood hazard zone, if mapped, for example AE. |
| `site.historicDistrict` | boolean |  | Whether the site is in a designated historic district. |
| `building` | object |  | Facts about the building or structure, for building permits. |
| `building.occupancyGroup` | string |  | The building code occupancy classification, for example R-3 or B. |
| `building.constructionType` | string |  | The building code construction type, for example V-B. |
| `building.stories` | integer |  | Number of stories above grade. |
| `building.dwellingUnits` | integer |  | Dwelling units added (negative when removed). |
| `building.area` | object |  | Floor area affected by the work. |
| `building.area.value` | number | yes | The area. |
| `building.area.unit` | enum | yes | sq-ft or sq-m. |
| `submittedAt` | string (date-time) |  | When it was submitted. |
| `documents` | array of object |  | Plans and documents submitted with the application. Each points at an entry in attachments. |
| `documents[].attachmentId` | string (identifier) | yes | The id of the file in the record's attachments. |
| `documents[].kind` | enum | yes | site-plan, architectural-plans, structural-calculations, energy-compliance, mechanical-electrical-plumbing-plans, survey, photographs, owner-authorization, contractor-license, insurance-certificate, environmental-review or other. |
| `documents[].revision` | string |  | Revision number or label, for example 2 or Rev B. |
| `documents[].submittedAt` | string (date-time) |  | When it was submitted. |
| `fees` | array of object |  | Fees assessed on the application. |
| `fees[].code` | string |  | The jurisdiction's fee code. |
| `fees[].description` | string | yes | What the fee is for. |
| `fees[].amount` | [Money](common.md#money) | yes | The fee amount. |
| `fees[].status` | enum | yes | assessed, invoiced, paid, waived or refunded. |
| `fees[].paidAt` | string (date-time) |  | When it was paid. |
| `fees[].receipt` | string |  | The receipt or transaction reference. |
| `reviews` | array of object |  | Reviews by each discipline, one entry per discipline per review cycle. |
| `reviews[].discipline` | enum | yes | zoning, building, structural, fire, electrical, mechanical, plumbing, civil-engineering, environmental, health, historic-preservation, transportation, utilities or other. |
| `reviews[].cycle` | integer | yes | The review cycle, starting at 1; resubmissions start a new cycle. |
| `reviews[].reviewer` | [Person](common.md#person) |  | Who reviewed. |
| `reviews[].startedAt` | string (date-time) |  | When it started. |
| `reviews[].completedAt` | string (date-time) |  | When it was completed. |
| `reviews[].outcome` | enum |  | approved, approved-with-conditions, corrections-required, denied or not-applicable. |
| `reviews[].comments` | array of object |  | Review comments the applicant must address. |
| `reviews[].comments[].text` | string | yes | The comment. |
| `reviews[].comments[].sheet` | string |  | The plan sheet the comment refers to, for example A2.1. |
| `reviews[].comments[].codeSection` | string |  | The code section cited. |
| `reviews[].comments[].resolved` | boolean |  | Whether the comment has been resolved. |
| `statutoryClock` | object |  | The time limit the law or ordinance sets for deciding the application, and its state. Many jurisdictions set review deadlines; the rules vary, so the record states the basis and the counting rule it applied. startedAt and pauses are instants; days are counted in timeZone's calendar. |
| `statutoryClock.basis` | string | yes | The law, ordinance or policy that sets the deadline, as cited locally. |
| `statutoryClock.days` | integer | yes | Days allowed for the decision. |
| `statutoryClock.dayType` | enum | yes | calendar or business days. |
| `statutoryClock.timeZone` | string |  | The IANA time zone whose calendar the jurisdiction counts days in, for example America/Chicago or Europe/London. dueOn is a date in this zone; give it whenever dueOn is given, so every system computes the same day. |
| `statutoryClock.startedAt` | string (date-time) |  | When it started. |
| `statutoryClock.dueOn` | string (date) |  | The local date (in timeZone) by which the decision is due under the basis, after pauses. |
| `statutoryClock.pauses` | array of object |  | Periods when the clock stopped, for example while waiting for the applicant. |
| `statutoryClock.pauses[].from` | string (date-time) | yes | When the pause began. |
| `statutoryClock.pauses[].to` | string (date-time) |  | When the pause ended; leave out while it continues. |
| `statutoryClock.pauses[].reason` | enum | yes | awaiting-applicant, fees-outstanding, applicant-request, third-party-review or other. |
| `statutoryClock.consequenceIfMissed` | enum |  | What the basis says happens when the deadline passes: deemed-approved, fee-refund, escalation, none or unspecified. |
| `inspections` | array of object |  | Inspections of the permitted work. |
| `inspections[].type` | string | yes | The inspection, as the jurisdiction names it, for example Footing or Final Electrical. |
| `inspections[].requestedFor` | string (date) |  | The date the inspection was requested for. |
| `inspections[].scheduledFor` | string (date-time) |  | When the inspection is scheduled. |
| `inspections[].inspector` | [Person](common.md#person) |  | Who inspected. |
| `inspections[].result` | enum | yes | scheduled, passed, failed, partial, cancelled or no-access. |
| `inspections[].completedAt` | string (date-time) |  | When it was completed. |
| `inspections[].notes` | string |  | The inspector's notes. |
| `decision` | object |  | The jurisdiction's decision on the application. |
| `decision.outcome` | enum | yes | issued, approved (approved but not yet issued, for example pending fees), denied, withdrawn, expired or revoked. |
| `decision.decidedAt` | string (date-time) | yes | When the decision was made. |
| `decision.decidedBy` | [Person](common.md#person) |  | Who decided. |
| `decision.permitNumber` | string |  | The number of the issued permit. Required when the outcome is issued. |
| `decision.conditions` | array of string |  | Conditions of approval. |
| `decision.reasons` | string |  | Reasons for a denial or revocation. |
| `decision.expiresOn` | string (date) |  | When it expires. |
| `decision.appealDeadline` | string (date) |  | Last day to file an appeal. |
| `status` | enum | yes | draft, submitted, intake-review, incomplete, in-review, corrections-required, approved, issued, under-inspection, finaled, denied, withdrawn, expired or revoked. |
| `statusHistory` | array of [Status change](common.md#status-change) |  | Every status the record has had, oldest first, each one of the values of status. |
| `attachments` | array of [Attachment](common.md#attachment) |  | Files that belong to the application: plans, calculations, photos, letters. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  | Recorded actions on the application, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;. |

## Conditional requirements

- `applicant` needs at least one of `person`, `organization`.
- `parties[]` needs at least one of `person`, `organization`.
- `site` needs at least one of `parcelNumber`, `address`, `location`.
- In `decision`, when `outcome` is `"issued"`, `permitNumber` is required.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Attachments have unique ids. |
| `attachment-exists` | Every submitted document points at an entry in attachments. |
| `dates-in-order` | A statutory clock pause does not end before it starts. |
| `issued-has-decision` | An application with status issued, under-inspection or finaled has a decision with outcome issued. |
| `status-matches-decision` | An application with status approved, denied, withdrawn or revoked has a decision with the same outcome, when a decision is given. |
