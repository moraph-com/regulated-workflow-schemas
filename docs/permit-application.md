<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Permit application

One application for a building, trade, land-use, right-of-way or other local-government permit, followed from submission through intake, plan review by discipline and cycle, fees, the statutory review clock, the decision and inspections. Fields that correspond to the Building and Land Development Specification (BLDS), an open data specification for publishing permit data, are mapped in the docs, so a jurisdiction can publish BLDS data from these records. The format follows common local-government practice; it doesn't encode any jurisdiction's code or deadlines.

- Schema: [`schemas/permit-application.schema.json`](../schemas/permit-application.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/permit-application.schema.json`
- `recordType`: `permit-application`, `schemaVersion`: `0.1.0`
- Examples: [`examples/permit-application/`](../examples/permit-application/)

## Informed by

- Common local-government permitting practice: intake and completeness review, plan review by discipline in cycles, fees, statutory review deadlines, issuance, inspections and final.
- The **Building and Land Development Specification (BLDS)**, version 1.2 ([permitdata.org](https://github.com/open-data-standards/permitdata.org/wiki)), an open data specification for publishing permit data. BLDS is no longer actively maintained, but many jurisdictions' open data portals still publish to it.

## Mapping to BLDS

The core BLDS permits dataset has one row per permit. These fields correspond:

| This format | BLDS (core permits dataset) | Notes |
| --- | --- | --- |
| `decision.permitNumber` (or `id`, where the application and permit share a number) | PermitNum | |
| `description` | Description | |
| `submittedAt` | AppliedDate | BLDS dates are YYYY-MM-DD; take the date in the jurisdiction's time zone. |
| `decision.decidedAt` (outcome `issued`) | IssuedDate | As above. |
| `statusHistory` entry with status `finaled` | CompletedDate | As above. |
| `status` | StatusCurrent, StatusCurrentMapped | StatusCurrent is the jurisdiction's own wording; StatusCurrentMapped uses the values below. |
| `site.address` | OriginalAddress1, OriginalAddress2, OriginalCity, OriginalState, OriginalZip | |
| `site.parcelNumber` | PIN | |
| `site.location` | Latitude, Longitude | |
| `permitType.category` | PermitTypeMapped | building, demolition, electrical, mechanical, plumbing and grading map directly. BLDS's Roof, Fence and Pool/Spa are `building` here, with the specific type in `subtype`. |
| `permitType.subtype` | PermitType, PermitTypeDesc | |
| `permitType.workClass` | WorkClass, WorkClassMapped | WorkClassMapped: `new` is New; every other value is Existing. |
| `permitType.residential` | PermitClass, PermitClassMapped | PermitClassMapped's Residential means single-family and duplex only; multifamily is Non-Residential. Check the building type before mapping `true`. |
| `valuation` | EstProjectCost | |
| `building.area` (converted to square feet) | TotalSqFt | |
| `decision.expiresOn` | ExpiresDate | Optional in BLDS. |
| sum of `fees[].amount` | Fee | Optional in BLDS; a single number in any currency. |
| `parties[]` with role `contractor`: `organization.name`, `license.number`, `license.issuer` | ContractorCompanyName, ContractorLicNum, ContractorStateLic | |

BLDS HousingUnits is the number of units in the building; `building.dwellingUnits` is the net change made by the work, so they map only for new buildings.

Statuses to BLDS StatusCurrentMapped:

| `status` | StatusCurrentMapped |
| --- | --- |
| `draft` | (not published) |
| `submitted`, `intake-review`, `incomplete` | Application Accepted |
| `in-review`, `corrections-required` | In Review |
| `approved` (approved, not yet issued) | Fees/Payment, when issuance waits on fees |
| `issued` | Permit Issued |
| `under-inspection` | Inspection Phase |
| `finaled` | Permit Finaled (or Permit Finaled with Conditions) |
| `denied`, `withdrawn`, `expired`, `revoked` | Permit Cancelled (BLDS has no closer value) |

BLDS also has Occupancy and Appeal, which have no status here. The mappings are a guide, not a certified crosswalk; check them against the BLDS version and the publishing rules you use.

## Statutory clock

Many jurisdictions set a time limit for deciding permit applications, with different rules for when the clock starts, which days count and what pauses it, and some deem an application approved when the limit passes. `statutoryClock` records the basis the jurisdiction relies on and the counting it applied; it does not compute deadlines. `startedAt` and pauses are instants with a UTC offset, while `dueOn` is a calendar date; `timeZone` (required with `dueOn`) names the IANA zone whose calendar the days are counted in, so a deadline near midnight means the same day to every system.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md). Sensitivity is the schema's `x-sensitivity` annotation: `personal` fields identify or contact a person, and `free-text` fields are narrative that may contain anything, including personal data, so screen them before sharing records. Fields of a linked type inherit that type's sensitivity (every [Person](common.md#person) is personal).

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `$schema` | string (uri) |  |  | The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing. |
| `recordType` | `"permit-application"` | yes |  | Always permit-application. Lets a reader (or validate()) tell the format apart from the others in this repository. |
| `schemaVersion` | `"0.1.0"` | yes |  | The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for. |
| `id` | string (identifier) | yes |  | This application's identifier, unique within the system that created it. Often the application or case number; the permit number, once issued, is decision.permitNumber (they may be the same). Example: `BLD-2026-004417`. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  |  | Ids for this application in other systems, such as the jurisdiction's permitting system when the record comes from a contractor's or applicant's software, or a state or regional portal. |
| `createdAt` | string (date-time) |  |  | When the record was created. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `updatedAt` | string (date-time) |  |  | When the record was last changed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `jurisdiction` | [Jurisdiction](common.md#jurisdiction) | yes |  | The jurisdiction whose permit is sought, and the department that issues it. |
| `permitType` | object | yes |  | What kind of permit is sought. |
| `permitType.category` | enum | yes |  | The broad kind of permit: building; demolition; electrical; mechanical; plumbing; fire (fire alarm, sprinkler, fire code operational permits); grading (grading, excavation, stormwater); right-of-way (street use, driveway, skip or dumpster, utility work in the street); sign; zoning (zoning clearance, variance); land-use (subdivision, site plan, conditional use); environmental; special-event; or other. The first several match BLDS PermitTypeMapped values (Building, Demolition, Electrical, Mechanical, Plumbing, Grading); BLDS's Roof, Fence and Pool/Spa are building permits here, with the specific type in subtype. |
| `permitType.subtype` | string |  |  | The jurisdiction's own name for the permit type, as it appears on the application and the permit. This is BLDS PermitType or PermitTypeDesc. Examples: `Residential Addition`, `Skip on the highway`, `Roof Replacement`. |
| `permitType.workClass` | enum |  |  | What the work does to the structure: new (new construction); addition; alteration (remodel or tenant improvement); repair (including replacement in kind); demolition; change-of-use (a new occupancy for an existing building); or other. For BLDS WorkClassMapped, new maps to New and the others to Existing. |
| `permitType.residential` | boolean |  |  | Whether the work is to a residential building (true) or not (false). Jurisdictions draw this line differently; BLDS PermitClassMapped uses Residential for single-family and duplex only and puts multifamily with commercial, so check the building type before mapping. |
| `description` | string |  | free-text | What the applicant proposes to do, in the applicant's or the jurisdiction's words. This is what appears on the permit and in published permit data (BLDS Description), so write it to be read by the public. Example: `Single-story 420 sq ft rear addition with new bathroom; relocate water heater.`. |
| `valuation` | [Money](common.md#money) |  |  | The declared value of the work (BLDS EstProjectCost). Many jurisdictions compute fees from it. |
| `applicant` | object | yes |  | Who is applying. Give their role too, since the applicant may be the owner, the contractor or an agent. |
| `applicant.role` | enum | yes |  | owner (the property owner); applicant (where the applicant has no other role); contractor; architect; engineer; agent (a permit expediter or other representative); tenant; or other. |
| `applicant.person` | [Person](common.md#person) |  | personal | The person. |
| `applicant.organization` | [Organization](common.md#organization) |  |  | The organization (BLDS ContractorCompanyName, for a contractor). |
| `applicant.mailingAddress` | [Postal address](common.md#postal-address) |  | personal | Where to send notices to the party, when it differs from the site. |
| `applicant.license` | object |  |  | A professional or contractor license the party holds, which many jurisdictions verify before issuing a permit. |
| `applicant.license.number` | string | yes |  | The license number (BLDS ContractorLicNum, for a contractor). Example: `CCB-000000`. |
| `applicant.license.type` | string |  |  | The license class. Examples: `General Building Contractor`, `Professional Engineer`. |
| `applicant.license.issuer` | string |  |  | The licensing board or agency (BLDS ContractorStateLic records the licensing state). Example: `State contractor board`. |
| `applicant.license.expiresOn` | string (date) |  |  | When the license expires. Example: `2026-03-04`. |
| `parties` | array of object |  |  | Owners, contractors, design professionals, agents and tenants on the application besides the applicant. |
| `parties[].role` | enum | yes |  | owner (the property owner); applicant (where the applicant has no other role); contractor; architect; engineer; agent (a permit expediter or other representative); tenant; or other. |
| `parties[].person` | [Person](common.md#person) |  | personal | The person. |
| `parties[].organization` | [Organization](common.md#organization) |  |  | The organization (BLDS ContractorCompanyName, for a contractor). |
| `parties[].mailingAddress` | [Postal address](common.md#postal-address) |  | personal | Where to send notices to the party, when it differs from the site. |
| `parties[].license` | object |  |  | A professional or contractor license the party holds, which many jurisdictions verify before issuing a permit. |
| `parties[].license.number` | string | yes |  | The license number (BLDS ContractorLicNum, for a contractor). Example: `CCB-000000`. |
| `parties[].license.type` | string |  |  | The license class. Examples: `General Building Contractor`, `Professional Engineer`. |
| `parties[].license.issuer` | string |  |  | The licensing board or agency (BLDS ContractorStateLic records the licensing state). Example: `State contractor board`. |
| `parties[].license.expiresOn` | string (date) |  |  | When the license expires. Example: `2026-03-04`. |
| `site` | object | yes |  | Where the work will happen. Give at least one of a parcel number, an address or coordinates; right-of-way work often has an address or coordinates but no parcel. |
| `site.parcelNumber` | string |  |  | The identifier of the land parcel used for tax assessment: the assessor's parcel number (APN), parcel identification number (PIN), tax id or equivalent (BLDS PIN). Written as the assessor writes it. Example: `12-34-56-000-0100`. |
| `site.address` | [Postal address](common.md#postal-address) |  |  | The site's street address (BLDS OriginalAddress1, OriginalCity, OriginalState, OriginalZip). |
| `site.location` | [Geographic point](common.md#geographic-point) |  |  | The site's coordinates (BLDS Latitude and Longitude), for mapping and for sites without an address. |
| `site.zoning` | string |  |  | The parcel's zoning designation, as the jurisdiction writes it. Examples: `R-1`, `C-2`. |
| `site.floodZone` | string |  |  | The flood hazard zone, if the site is mapped, as shown on the flood map (in the US, the FEMA Flood Insurance Rate Map zone). Examples: `AE`, `X`. |
| `site.historicDistrict` | boolean |  |  | Whether the site is in a designated historic district, which usually adds a historic preservation review. |
| `building` | object |  |  | Facts about the building or structure, for building permits. Leave out for permits that don't involve a building. |
| `building.occupancyGroup` | string |  |  | The building code occupancy classification, as the adopted code writes it (in the International Building Code, for example R-3 for one- and two-family dwellings or B for business). Examples: `R-3`, `B`, `A-2`. |
| `building.constructionType` | string |  |  | The building code construction type, as the adopted code writes it. Examples: `V-B`, `II-A`. |
| `building.stories` | integer |  |  | Number of stories above grade plane after the work. |
| `building.dwellingUnits` | integer |  |  | Net dwelling units added by the work: positive when units are added, negative when removed, 0 when unchanged. BLDS HousingUnits is the total units in the building, which is a different number. |
| `building.area` | object |  |  | Floor area affected by the work, with its unit. BLDS TotalSqFt is in square feet; convert square metres before publishing. |
| `building.area.value` | number | yes |  | The area, in unit. |
| `building.area.unit` | enum | yes |  | sq-ft (square feet) or sq-m (square metres). |
| `submittedAt` | string (date-time) |  |  | When the application was submitted (BLDS AppliedDate is the date part, in the jurisdiction's time zone). Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `documents` | array of object |  |  | Plans and documents submitted with the application. Each points at a file in attachments; a resubmitted plan set is a new entry with a new revision. |
| `documents[].attachmentId` | string (identifier) | yes |  | The id of the file in the record's attachments. The validator checks it exists. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `documents[].kind` | enum | yes |  | site-plan; architectural-plans; structural-calculations; energy-compliance (energy code forms or calculations); mechanical-electrical-plumbing-plans; survey; photographs; owner-authorization (owner's consent for an agent or contractor to apply); contractor-license; insurance-certificate; environmental-review; or other. |
| `documents[].revision` | string |  |  | Revision number or label, as written on the plans. Examples: `2`, `Rev B`. |
| `documents[].submittedAt` | string (date-time) |  |  | When this revision was submitted. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `fees` | array of object |  |  | Fees assessed on the application, one line per fee. BLDS Fee is a single total; sum the lines when publishing. |
| `fees[].code` | string |  |  | The jurisdiction's fee code from its fee schedule. Example: `BP-RES`. |
| `fees[].description` | string | yes |  | What the fee is for. Examples: `Building permit fee`, `Plan review fee`. |
| `fees[].amount` | [Money](common.md#money) | yes |  | The fee amount. Use a negative amount for a credit line. |
| `fees[].status` | enum | yes |  | assessed (calculated, not yet billed); invoiced; paid; waived; or refunded. |
| `fees[].paidAt` | string (date-time) |  |  | When the fee was paid. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `fees[].receipt` | string |  |  | The receipt or payment transaction reference. |
| `reviews` | array of object |  |  | Plan reviews by each discipline, one entry per discipline per review cycle, so the record shows how many rounds of corrections each discipline required. |
| `reviews[].discipline` | enum | yes |  | The reviewing discipline: zoning; building; structural; fire; electrical; mechanical; plumbing; civil-engineering; environmental; health (environmental health, food service); historic-preservation; transportation; utilities; or other. |
| `reviews[].cycle` | integer | yes |  | The review cycle, starting at 1. Each resubmission in response to corrections starts a new cycle. |
| `reviews[].reviewer` | [Person](common.md#person) |  | personal | Who reviewed (a plans examiner, planner or engineer). |
| `reviews[].startedAt` | string (date-time) |  |  | When the review started. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `reviews[].completedAt` | string (date-time) |  |  | When it was completed. Must not be before startedAt. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `reviews[].outcome` | enum |  |  | approved; approved-with-conditions; corrections-required (the applicant must revise and resubmit); denied; or not-applicable (the discipline found nothing to review). |
| `reviews[].comments` | array of object |  |  | Review comments the applicant must address. |
| `reviews[].comments[].text` | string | yes | free-text | The comment, as written to the applicant. |
| `reviews[].comments[].sheet` | string |  |  | The plan sheet the comment refers to. Examples: `A2.1`, `S1.1`. |
| `reviews[].comments[].codeSection` | string |  |  | The code section cited, as the adopted code numbers it. Example: `R602.7`. |
| `reviews[].comments[].resolved` | boolean |  |  | Whether the comment has been resolved in a later submission. |
| `statutoryClock` | object |  |  | The time limit a law, ordinance or policy sets for deciding the application, and the state of the clock. Many jurisdictions have such limits (and some deem a permit approved if the limit passes), with different rules for when the clock starts, which days count and what pauses it. The record states the basis and the counting it applied; it does not compute deadlines. startedAt and pauses are instants with a UTC offset; days are counted in timeZone's calendar, and dueOn is a date in that zone. |
| `statutoryClock.basis` | string | yes |  | The law, ordinance or policy that sets the deadline, cited as the jurisdiction cites it. Example: `Riverbend Municipal Code 15.04.120`. |
| `statutoryClock.days` | integer | yes |  | Days allowed for the decision under the basis. |
| `statutoryClock.dayType` | enum | yes |  | Whether the days are calendar or business days. |
| `statutoryClock.timeZone` | string |  |  | The IANA time zone whose calendar the jurisdiction counts days in. dueOn is a date in this zone, so every system computes the same day for a deadline near midnight. Required whenever dueOn is given. Examples: `America/Los_Angeles`, `America/Chicago`, `Europe/London`. |
| `statutoryClock.startedAt` | string (date-time) |  |  | When the clock started (often when the application was deemed complete, not when it was submitted). Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `statutoryClock.dueOn` | string (date) |  |  | The date, in timeZone, by which the decision is due under the basis, after pauses. Example: `2026-03-04`. |
| `statutoryClock.pauses` | array of object |  |  | Periods when the clock stopped, for example while waiting for the applicant to respond to corrections. |
| `statutoryClock.pauses[].from` | string (date-time) | yes |  | When the pause began. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `statutoryClock.pauses[].to` | string (date-time) |  |  | When the pause ended; leave out while it continues. Must not be before from. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `statutoryClock.pauses[].reason` | enum | yes |  | awaiting-applicant (corrections or information requested); fees-outstanding; applicant-request (the applicant asked for more time); third-party-review (an outside agency's review that the basis allows to pause the clock); or other. |
| `statutoryClock.consequenceIfMissed` | enum |  |  | What the basis says happens when the deadline passes: deemed-approved; fee-refund; escalation (to a supervisor or another body); none; or unspecified (the basis doesn't say, or nobody has checked). |
| `inspections` | array of object |  |  | Inspections of the permitted work, one entry per inspection visit (a failed inspection followed by a re-inspection is two entries). |
| `inspections[].type` | string | yes |  | The inspection, as the jurisdiction names it on the permit card. Examples: `Footing`, `Framing`, `Final Electrical`. |
| `inspections[].requestedFor` | string (date) |  |  | The date the inspection was requested for. Example: `2026-03-04`. |
| `inspections[].scheduledFor` | string (date-time) |  |  | When the inspection is scheduled. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `inspections[].inspector` | [Person](common.md#person) |  | personal | Who inspected. |
| `inspections[].result` | enum | yes |  | scheduled (not yet done); passed; failed (correction and re-inspection needed); partial (part of the work approved); cancelled; or no-access (the inspector couldn't get to the work). |
| `inspections[].completedAt` | string (date-time) |  |  | When the inspection was done. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `inspections[].notes` | string |  | free-text | The inspector's notes and any corrections required. |
| `decision` | object |  |  | The jurisdiction's decision on the application. An issued permit's number, conditions and expiry are here. |
| `decision.outcome` | enum | yes |  | issued (the permit is issued; permitNumber is required); approved (approved but not yet issued, for example while fees are unpaid); denied; withdrawn (by the applicant); expired (the application lapsed, or the issued permit expired before final); or revoked. |
| `decision.decidedAt` | string (date-time) | yes |  | When the decision was made. For an issued permit, BLDS IssuedDate is the date part in the jurisdiction's time zone. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `decision.decidedBy` | [Person](common.md#person) |  | personal | Who decided, usually by title (Building Official, Planning Director). |
| `decision.permitNumber` | string |  |  | The number of the issued permit (BLDS PermitNum). Required when the outcome is issued. Example: `B26-04417`. |
| `decision.conditions` | array of string |  |  | Conditions of approval, each as stated on the permit. |
| `decision.reasons` | string |  | free-text | Reasons for a denial or revocation, as given to the applicant. Usually needed for an appeal. |
| `decision.expiresOn` | string (date) |  |  | When the permit (or the approval) expires if work doesn't start or progress (BLDS ExpiresDate). Must not be before the decision. Example: `2026-03-04`. |
| `decision.appealDeadline` | string (date) |  |  | The last day to file an appeal of the decision. Example: `2026-03-04`. |
| `status` | enum | yes |  | Where the application is: draft (not yet submitted); submitted; intake-review (checking completeness); incomplete (the applicant must supply more); in-review (plan review); corrections-required; approved; issued; under-inspection; finaled (all inspections passed and the permit closed); denied; withdrawn; expired; or revoked. The docs map these to BLDS StatusCurrentMapped. |
| `statusHistory` | array of [Status change](common.md#status-change) |  |  | Every status the application has had, oldest first, ending at the current status (the validator checks both). BLDS CompletedDate is the date of the finaled entry. |
| `attachments` | array of [Attachment](common.md#attachment) |  |  | Files that belong to the application: plans, calculations, photographs, letters. Plans submitted to a public agency are often public records, but may still contain personal data or security-sensitive details; set classification accordingly. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  |  | Recorded actions on the application, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;, for example examplecity:councilDistrict. |

## Conditional requirements

- `applicant` needs at least one of `person`, `organization`.
- `parties[]` needs at least one of `person`, `organization`.
- `site` needs at least one of `parcelNumber`, `address`, `location`.
- In `statutoryClock`, when `dueOn` is given, `timeZone` is required.
- In `decision`, when `outcome` is `"issued"`, `permitNumber` is required.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Attachments have unique ids. |
| `dates-in-order` | updatedAt is not before createdAt; a statutory clock pause doesn't end before it starts; a plan review isn't completed before it started; the decision isn't dated before submission; the permit doesn't expire before it was decided. |
| `history-in-order` | statusHistory and auditTrail are oldest first. |
| `history-ends-at-status` | The last entry in statusHistory has the record's current status. |
| `attachment-exists` | Every submitted document points at an entry in attachments. |
| `issued-has-decision` | An application with status issued, under-inspection or finaled has a decision with outcome issued. |
| `status-matches-decision` | An application with status approved, denied, withdrawn or revoked has a decision with the same outcome, when a decision is given. |
