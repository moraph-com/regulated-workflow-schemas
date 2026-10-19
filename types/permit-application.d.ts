/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Who is applying. Give their role too, since the applicant may be the owner, the contractor or an agent.
 */
export type Party = {
  [k: string]: unknown;
} & {
  /**
   * owner (the property owner); applicant (where the applicant has no other role); contractor; architect; engineer; agent (a permit expediter or other representative); tenant; or other.
   */
  role: "owner" | "applicant" | "contractor" | "architect" | "engineer" | "agent" | "tenant" | "other";
  person?: Person;
  organization?: Organization;
  mailingAddress?: PostalAddress;
  license?: License;
};
/**
 * A person or organization on the application, in a role. Give a person, an organization, or both (a named contact at a firm). Names and mailing addresses of individuals, such as homeowners, are personal data even where permit records are public.
 */
export type Party1 = Party2 & Party3;
export type Party2 = {
  [k: string]: unknown;
};
/**
 * Where the work will happen. Give at least one of a parcel number, an address or coordinates; right-of-way work often has an address or coordinates but no parcel.
 */
export type Site = {
  [k: string]: unknown;
} & {
  /**
   * The identifier of the land parcel used for tax assessment: the assessor's parcel number (APN), parcel identification number (PIN), tax id or equivalent (BLDS PIN). Written as the assessor writes it.
   */
  parcelNumber?: string;
  address?: PostalAddress1;
  location?: GeographicPoint;
  /**
   * The parcel's zoning designation, as the jurisdiction writes it.
   */
  zoning?: string;
  /**
   * The flood hazard zone, if the site is mapped, as shown on the flood map (in the US, the FEMA Flood Insurance Rate Map zone).
   */
  floodZone?: string;
  /**
   * Whether the site is in a designated historic district, which usually adds a historic preservation review.
   */
  historicDistrict?: boolean;
};

/**
 * One application for a building, trade, land-use, right-of-way or other local-government permit, followed from submission through intake, plan review by discipline and cycle, fees, the statutory review clock, the decision and inspections. Fields that correspond to the Building and Land Development Specification (BLDS), an open data specification for publishing permit data, are mapped in the docs, so a jurisdiction can publish BLDS data from these records. The format follows common local-government practice; it doesn't encode any jurisdiction's code or deadlines.
 */
export interface PermitApplication {
  /**
   * The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing.
   */
  $schema?: string;
  /**
   * Always permit-application. Lets a reader (or validate()) tell the format apart from the others in this repository.
   */
  recordType: "permit-application";
  /**
   * The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for.
   */
  schemaVersion: "0.1.0";
  /**
   * This application's identifier, unique within the system that created it. Often the application or case number; the permit number, once issued, is decision.permitNumber (they may be the same).
   */
  id: string;
  /**
   * Ids for this application in other systems, such as the jurisdiction's permitting system when the record comes from a contractor's or applicant's software, or a state or regional portal.
   */
  externalIds?: ExternalIdentifier[];
  /**
   * When the record was created.
   */
  createdAt?: string;
  /**
   * When the record was last changed.
   */
  updatedAt?: string;
  jurisdiction: Jurisdiction;
  permitType: PermitType;
  /**
   * What the applicant proposes to do, in the applicant's or the jurisdiction's words. This is what appears on the permit and in published permit data (BLDS Description), so write it to be read by the public.
   */
  description?: string;
  valuation?: Money;
  applicant: Party;
  /**
   * Owners, contractors, design professionals, agents and tenants on the application besides the applicant.
   */
  parties?: Party1[];
  site: Site;
  building?: Building;
  /**
   * When the application was submitted (BLDS AppliedDate is the date part, in the jurisdiction's time zone).
   */
  submittedAt?: string;
  /**
   * Plans and documents submitted with the application. Each points at a file in attachments; a resubmitted plan set is a new entry with a new revision.
   */
  documents?: SubmittedDocument[];
  /**
   * Fees assessed on the application, one line per fee. BLDS Fee is a single total; sum the lines when publishing.
   */
  fees?: Fee[];
  /**
   * Plan reviews by each discipline, one entry per discipline per review cycle, so the record shows how many rounds of corrections each discipline required.
   */
  reviews?: PlanReview[];
  statutoryClock?: StatutoryReviewClock;
  /**
   * Inspections of the permitted work, one entry per inspection visit (a failed inspection followed by a re-inspection is two entries).
   */
  inspections?: Inspection[];
  decision?: Decision;
  /**
   * Where the application is: draft (not yet submitted); submitted; intake-review (checking completeness); incomplete (the applicant must supply more); in-review (plan review); corrections-required; approved; issued; under-inspection; finaled (all inspections passed and the permit closed); denied; withdrawn; expired; or revoked. The docs map these to BLDS StatusCurrentMapped.
   */
  status:
    | "draft"
    | "submitted"
    | "intake-review"
    | "incomplete"
    | "in-review"
    | "corrections-required"
    | "approved"
    | "issued"
    | "under-inspection"
    | "finaled"
    | "denied"
    | "withdrawn"
    | "expired"
    | "revoked";
  /**
   * Every status the application has had, oldest first, ending at the current status (the validator checks both). BLDS CompletedDate is the date of the finaled entry.
   */
  statusHistory?: (StatusChange & {
    /**
     * The status the record moved to, one of this format's status values.
     */
    status?:
      | "draft"
      | "submitted"
      | "intake-review"
      | "incomplete"
      | "in-review"
      | "corrections-required"
      | "approved"
      | "issued"
      | "under-inspection"
      | "finaled"
      | "denied"
      | "withdrawn"
      | "expired"
      | "revoked";
  })[];
  /**
   * Files that belong to the application: plans, calculations, photographs, letters. Plans submitted to a public agency are often public records, but may still contain personal data or security-sensitive details; set classification accordingly.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the application, oldest first.
   */
  auditTrail?: AuditEntry[];
  extensions?: Extensions;
}
/**
 * An identifier assigned by another system or registry, kept so a record can be matched to the same thing elsewhere without guessing from names. Use it for registry numbers (a Legal Entity Identifier, a tax id) and for the record's id in a source or destination system.
 */
export interface ExternalIdentifier {
  /**
   * Who assigned the value: a registry (LEI, EIN, DUNS, UEI, company-number, NPI, CCN) or a system's name (for example riverbend-permits). Use the same spelling every time so values can be matched across records. Not validated against a list, because registries differ by country.
   */
  scheme: string;
  /**
   * The identifier exactly as the scheme writes it, including any punctuation (for example 12-3456789 for an EIN).
   */
  value: string;
}
/**
 * The jurisdiction whose permit is sought, and the department that issues it.
 */
export interface Jurisdiction {
  /**
   * The country.
   */
  country: string;
  /**
   * The state, province or other ISO 3166-2 subdivision, when the rules or the authority are subnational.
   */
  subdivision?: string;
  /**
   * The city, county, borough or district, as the authority itself writes its name.
   */
  locality?: string;
  /**
   * The agency, department or body that exercises the jurisdiction.
   */
  authority?: string;
}
/**
 * What kind of permit is sought.
 */
export interface PermitType {
  /**
   * The broad kind of permit: building; demolition; electrical; mechanical; plumbing; fire (fire alarm, sprinkler, fire code operational permits); grading (grading, excavation, stormwater); right-of-way (street use, driveway, skip or dumpster, utility work in the street); sign; zoning (zoning clearance, variance); land-use (subdivision, site plan, conditional use); environmental; special-event; or other. The first several match BLDS PermitTypeMapped values (Building, Demolition, Electrical, Mechanical, Plumbing, Grading); BLDS's Roof, Fence and Pool/Spa are building permits here, with the specific type in subtype.
   */
  category:
    | "building"
    | "demolition"
    | "electrical"
    | "mechanical"
    | "plumbing"
    | "fire"
    | "grading"
    | "right-of-way"
    | "sign"
    | "zoning"
    | "land-use"
    | "environmental"
    | "special-event"
    | "other";
  /**
   * The jurisdiction's own name for the permit type, as it appears on the application and the permit. This is BLDS PermitType or PermitTypeDesc.
   */
  subtype?: string;
  /**
   * What the work does to the structure: new (new construction); addition; alteration (remodel or tenant improvement); repair (including replacement in kind); demolition; change-of-use (a new occupancy for an existing building); or other. For BLDS WorkClassMapped, new maps to New and the others to Existing.
   */
  workClass?: "new" | "addition" | "alteration" | "repair" | "demolition" | "change-of-use" | "other";
  /**
   * Whether the work is to a residential building (true) or not (false). Jurisdictions draw this line differently; BLDS PermitClassMapped uses Residential for single-family and duplex only and puts multifamily with commercial, so check the building type before mapping.
   */
  residential?: boolean;
}
/**
 * The declared value of the work (BLDS EstProjectCost). Many jurisdictions compute fees from it.
 */
export interface Money {
  /**
   * The currency the amount is in (ISO 4217).
   */
  currency: string;
  /**
   * The amount in the currency's major unit (dollars, not cents), as a decimal string: an optional minus sign, digits with no leading zeros, and an optional fractional part. No thousands separators, plus signs or exponents. Negative amounts are for refunds and credits. Write as many decimal places as the source system holds; this format doesn't round.
   */
  amount: string;
}
/**
 * The person.
 */
export interface Person {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * The organization (BLDS ContractorCompanyName, for a contractor).
 */
export interface Organization {
  /**
   * The organization's id in the system the reference comes from (a vendor master, a contractor registry).
   */
  id?: string;
  /**
   * The name the organization is known by and trades under. Use legalName as well when the registered name differs.
   */
  name: string;
  /**
   * The registered legal name, when it differs from the name (for example Ledgerline Payroll Services, Inc. for Ledgerline Payroll). Contracts and registry lookups use this name.
   */
  legalName?: string;
  /**
   * Registry identifiers for the organization, such as a Legal Entity Identifier (LEI), US Employer Identification Number (EIN), Unique Entity ID (UEI, used in US federal awards), DUNS number or national company number. Prefer an LEI where one exists: it is global and its reference data is public.
   */
  identifiers?: ExternalIdentifier[];
  /**
   * The country where the organization is established or registered.
   */
  country?: string;
  /**
   * The organization's public website, as an absolute URI including https://.
   */
  website?: string;
}
/**
 * Where to send notices to the party, when it differs from the site.
 */
export interface PostalAddress {
  /**
   * The street part of the address, one line per entry, in the order the local postal service expects (most specific first in most countries). Include building, unit, street and any district line here.
   *
   * @minItems 1
   * @maxItems 4
   */
  lines: [string] | [string, string] | [string, string, string] | [string, string, string, string];
  /**
   * City, town or village.
   */
  locality?: string;
  /**
   * State, province, county or prefecture as written locally (OR, Ontario, Kent). Use the jurisdiction's subdivision code where you need a code.
   */
  region?: string;
  /**
   * ZIP or postal code as written locally, including any space or hyphen.
   */
  postalCode?: string;
  /**
   * The country of the address.
   */
  country: string;
}
/**
 * A professional or contractor license the party holds, which many jurisdictions verify before issuing a permit.
 */
export interface License {
  /**
   * The license number (BLDS ContractorLicNum, for a contractor).
   */
  number: string;
  /**
   * The license class.
   */
  type?: string;
  /**
   * The licensing board or agency (BLDS ContractorStateLic records the licensing state).
   */
  issuer?: string;
  /**
   * When the license expires.
   */
  expiresOn?: string;
}
export interface Party3 {
  /**
   * owner (the property owner); applicant (where the applicant has no other role); contractor; architect; engineer; agent (a permit expediter or other representative); tenant; or other.
   */
  role: "owner" | "applicant" | "contractor" | "architect" | "engineer" | "agent" | "tenant" | "other";
  person?: Person;
  organization?: Organization;
  mailingAddress?: PostalAddress;
  license?: License;
}
/**
 * The site's street address (BLDS OriginalAddress1, OriginalCity, OriginalState, OriginalZip).
 */
export interface PostalAddress1 {
  /**
   * The street part of the address, one line per entry, in the order the local postal service expects (most specific first in most countries). Include building, unit, street and any district line here.
   *
   * @minItems 1
   * @maxItems 4
   */
  lines: [string] | [string, string] | [string, string, string] | [string, string, string, string];
  /**
   * City, town or village.
   */
  locality?: string;
  /**
   * State, province, county or prefecture as written locally (OR, Ontario, Kent). Use the jurisdiction's subdivision code where you need a code.
   */
  region?: string;
  /**
   * ZIP or postal code as written locally, including any space or hyphen.
   */
  postalCode?: string;
  /**
   * The country of the address.
   */
  country: string;
}
/**
 * The site's coordinates (BLDS Latitude and Longitude), for mapping and for sites without an address.
 */
export interface GeographicPoint {
  /**
   * Degrees north (positive) or south (negative) of the equator, -90 to 90.
   */
  latitude: number;
  /**
   * Degrees east (positive) or west (negative) of the prime meridian, -180 to 180.
   */
  longitude: number;
}
/**
 * Facts about the building or structure, for building permits. Leave out for permits that don't involve a building.
 */
export interface Building {
  /**
   * The building code occupancy classification, as the adopted code writes it (in the International Building Code, for example R-3 for one- and two-family dwellings or B for business).
   */
  occupancyGroup?: string;
  /**
   * The building code construction type, as the adopted code writes it.
   */
  constructionType?: string;
  /**
   * Number of stories above grade plane after the work.
   */
  stories?: number;
  /**
   * Net dwelling units added by the work: positive when units are added, negative when removed, 0 when unchanged. BLDS HousingUnits is the total units in the building, which is a different number.
   */
  dwellingUnits?: number;
  area?: Area;
}
/**
 * Floor area affected by the work, with its unit. BLDS TotalSqFt is in square feet; convert square metres before publishing.
 */
export interface Area {
  /**
   * The area, in unit.
   */
  value: number;
  /**
   * sq-ft (square feet) or sq-m (square metres).
   */
  unit: "sq-ft" | "sq-m";
}
/**
 * One submitted document.
 */
export interface SubmittedDocument {
  /**
   * The id of the file in the record's attachments. The validator checks it exists.
   */
  attachmentId: string;
  /**
   * site-plan; architectural-plans; structural-calculations; energy-compliance (energy code forms or calculations); mechanical-electrical-plumbing-plans; survey; photographs; owner-authorization (owner's consent for an agent or contractor to apply); contractor-license; insurance-certificate; environmental-review; or other.
   */
  kind:
    | "site-plan"
    | "architectural-plans"
    | "structural-calculations"
    | "energy-compliance"
    | "mechanical-electrical-plumbing-plans"
    | "survey"
    | "photographs"
    | "owner-authorization"
    | "contractor-license"
    | "insurance-certificate"
    | "environmental-review"
    | "other";
  /**
   * Revision number or label, as written on the plans.
   */
  revision?: string;
  /**
   * When this revision was submitted.
   */
  submittedAt?: string;
}
/**
 * One fee line.
 */
export interface Fee {
  /**
   * The jurisdiction's fee code from its fee schedule.
   */
  code?: string;
  /**
   * What the fee is for.
   */
  description: string;
  amount: Money1;
  /**
   * assessed (calculated, not yet billed); invoiced; paid; waived; or refunded.
   */
  status: "assessed" | "invoiced" | "paid" | "waived" | "refunded";
  /**
   * When the fee was paid.
   */
  paidAt?: string;
  /**
   * The receipt or payment transaction reference.
   */
  receipt?: string;
}
/**
 * The fee amount. Use a negative amount for a credit line.
 */
export interface Money1 {
  /**
   * The currency the amount is in (ISO 4217).
   */
  currency: string;
  /**
   * The amount in the currency's major unit (dollars, not cents), as a decimal string: an optional minus sign, digits with no leading zeros, and an optional fractional part. No thousands separators, plus signs or exponents. Negative amounts are for refunds and credits. Write as many decimal places as the source system holds; this format doesn't round.
   */
  amount: string;
}
/**
 * One discipline's review in one cycle.
 */
export interface PlanReview {
  /**
   * The reviewing discipline: zoning; building; structural; fire; electrical; mechanical; plumbing; civil-engineering; environmental; health (environmental health, food service); historic-preservation; transportation; utilities; or other.
   */
  discipline:
    | "zoning"
    | "building"
    | "structural"
    | "fire"
    | "electrical"
    | "mechanical"
    | "plumbing"
    | "civil-engineering"
    | "environmental"
    | "health"
    | "historic-preservation"
    | "transportation"
    | "utilities"
    | "other";
  /**
   * The review cycle, starting at 1. Each resubmission in response to corrections starts a new cycle.
   */
  cycle: number;
  reviewer?: Person1;
  /**
   * When the review started.
   */
  startedAt?: string;
  /**
   * When it was completed. Must not be before startedAt.
   */
  completedAt?: string;
  /**
   * approved; approved-with-conditions; corrections-required (the applicant must revise and resubmit); denied; or not-applicable (the discipline found nothing to review).
   */
  outcome?: "approved" | "approved-with-conditions" | "corrections-required" | "denied" | "not-applicable";
  /**
   * Review comments the applicant must address.
   */
  comments?: Comment[];
}
/**
 * Who reviewed (a plans examiner, planner or engineer).
 */
export interface Person1 {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * One review comment.
 */
export interface Comment {
  /**
   * The comment, as written to the applicant.
   */
  text: string;
  /**
   * The plan sheet the comment refers to.
   */
  sheet?: string;
  /**
   * The code section cited, as the adopted code numbers it.
   */
  codeSection?: string;
  /**
   * Whether the comment has been resolved in a later submission.
   */
  resolved?: boolean;
}
/**
 * The time limit a law, ordinance or policy sets for deciding the application, and the state of the clock. Many jurisdictions have such limits (and some deem a permit approved if the limit passes), with different rules for when the clock starts, which days count and what pauses it. The record states the basis and the counting it applied; it does not compute deadlines. startedAt and pauses are instants with a UTC offset; days are counted in timeZone's calendar, and dueOn is a date in that zone.
 */
export interface StatutoryReviewClock {
  /**
   * The law, ordinance or policy that sets the deadline, cited as the jurisdiction cites it.
   */
  basis: string;
  /**
   * Days allowed for the decision under the basis.
   */
  days: number;
  /**
   * Whether the days are calendar or business days.
   */
  dayType: "calendar" | "business";
  /**
   * The IANA time zone whose calendar the jurisdiction counts days in. dueOn is a date in this zone, so every system computes the same day for a deadline near midnight. Required whenever dueOn is given.
   */
  timeZone?: string;
  /**
   * When the clock started (often when the application was deemed complete, not when it was submitted).
   */
  startedAt?: string;
  /**
   * The date, in timeZone, by which the decision is due under the basis, after pauses.
   */
  dueOn?: string;
  /**
   * Periods when the clock stopped, for example while waiting for the applicant to respond to corrections.
   */
  pauses?: Pause[];
  /**
   * What the basis says happens when the deadline passes: deemed-approved; fee-refund; escalation (to a supervisor or another body); none; or unspecified (the basis doesn't say, or nobody has checked).
   */
  consequenceIfMissed?: "deemed-approved" | "fee-refund" | "escalation" | "none" | "unspecified";
}
/**
 * One period when the clock stopped.
 */
export interface Pause {
  /**
   * When the pause began.
   */
  from: string;
  /**
   * When the pause ended; leave out while it continues. Must not be before from.
   */
  to?: string;
  /**
   * awaiting-applicant (corrections or information requested); fees-outstanding; applicant-request (the applicant asked for more time); third-party-review (an outside agency's review that the basis allows to pause the clock); or other.
   */
  reason: "awaiting-applicant" | "fees-outstanding" | "applicant-request" | "third-party-review" | "other";
}
/**
 * One inspection.
 */
export interface Inspection {
  /**
   * The inspection, as the jurisdiction names it on the permit card.
   */
  type: string;
  /**
   * The date the inspection was requested for.
   */
  requestedFor?: string;
  /**
   * When the inspection is scheduled.
   */
  scheduledFor?: string;
  inspector?: Person2;
  /**
   * scheduled (not yet done); passed; failed (correction and re-inspection needed); partial (part of the work approved); cancelled; or no-access (the inspector couldn't get to the work).
   */
  result: "scheduled" | "passed" | "failed" | "partial" | "cancelled" | "no-access";
  /**
   * When the inspection was done.
   */
  completedAt?: string;
  /**
   * The inspector's notes and any corrections required.
   */
  notes?: string;
}
/**
 * Who inspected.
 */
export interface Person2 {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * The jurisdiction's decision on the application. An issued permit's number, conditions and expiry are here.
 */
export interface Decision {
  /**
   * issued (the permit is issued; permitNumber is required); approved (approved but not yet issued, for example while fees are unpaid); denied; withdrawn (by the applicant); expired (the application lapsed, or the issued permit expired before final); or revoked.
   */
  outcome: "issued" | "approved" | "denied" | "withdrawn" | "expired" | "revoked";
  /**
   * When the decision was made. For an issued permit, BLDS IssuedDate is the date part in the jurisdiction's time zone.
   */
  decidedAt: string;
  decidedBy?: Person3;
  /**
   * The number of the issued permit (BLDS PermitNum). Required when the outcome is issued.
   */
  permitNumber?: string;
  /**
   * Conditions of approval, each as stated on the permit.
   *
   * Items: One condition.
   */
  conditions?: string[];
  /**
   * Reasons for a denial or revocation, as given to the applicant. Usually needed for an appeal.
   */
  reasons?: string;
  /**
   * When the permit (or the approval) expires if work doesn't start or progress (BLDS ExpiresDate). Must not be before the decision.
   */
  expiresOn?: string;
  /**
   * The last day to file an appeal of the decision.
   */
  appealDeadline?: string;
}
/**
 * Who decided, usually by title (Building Official, Planning Director).
 */
export interface Person3 {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * One change of the record's status: the new status, when, who made it and why. Each format lists its own status values and limits this field to them.
 */
export interface StatusChange {
  /**
   * The status the record moved to.
   */
  status: string;
  /**
   * When the status changed.
   */
  at: string;
  by?: Person4;
  /**
   * Why the status changed, in a sentence, especially for changes a reader wouldn't expect (a reopened review, a withdrawn item).
   */
  reason?: string;
}
/**
 * Who changed the status. Leave out where naming the person would break a promise of anonymity (see patient-safety-incident).
 */
export interface Person4 {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * A file that belongs to the record: a report, a plan set, a staff report, a photograph. The record carries the file's SHA-256 digest rather than the file itself, so anyone holding a copy can confirm it is byte for byte the file the record refers to, and the record stays small. Other parts of the record point at attachments by id (the validator checks those ids exist).
 */
export interface Attachment {
  /**
   * Identifier for the attachment, unique within the record's attachments, used by documents, assessments and agenda items to point at it.
   */
  id: string;
  /**
   * What the file is, in a few words a reader will recognize.
   */
  title: string;
  /**
   * The file's IANA media type (MIME type), so readers know how to open it.
   */
  mediaType: string;
  /**
   * The SHA-256 digest of the file's exact bytes, as 64 lower-case hexadecimal characters (what `sha256sum` or `shasum -a 256` prints). Any change to the file, even re-saving it, changes the digest.
   */
  sha256: string;
  /**
   * The file's size in bytes. Optional; useful for checking a transfer before computing the digest.
   */
  byteSize?: number;
  /**
   * Where an authorized reader can fetch the file, as an absolute URI. Records often travel further than their files should: don't put pre-signed or token-bearing links (that grant access by themselves) in records shared outside the organization.
   */
  uri?: string;
  /**
   * How widely the file may be shared. public: may be published (a staff report, issued plans). internal: staff of the organization only. confidential: named roles only (a vendor's SOC report under NDA). restricted: the most sensitive (security test results, anything with health information). Organizations map their own labels onto these four.
   */
  classification?: "public" | "internal" | "confidential" | "restricted";
  /**
   * When the file was added to the record.
   */
  addedAt?: string;
}
/**
 * One recorded action on the record: who did what, when, and to which field. Systems append entries and never rewrite them, so the trail shows how the record came to say what it says. The audit trail records actions; the status history records only status changes.
 */
export interface AuditEntry {
  /**
   * When the action happened.
   */
  at: string;
  actor: Person5;
  /**
   * What happened, as a short lower-case verb phrase. Use the same vocabulary across records so trails can be filtered; created, field-changed, attachment-added, approved, exported and viewed cover most systems.
   */
  action: string;
  /**
   * JSON Pointer (RFC 6901) to the field that changed, when one did.
   */
  field?: string;
  /**
   * The previous value, as text. Leave out for sensitive fields (narratives, personal data), so the trail doesn't keep a copy of what was deliberately removed.
   */
  from?: string;
  /**
   * The new value, as text. Leave out for sensitive fields.
   */
  to?: string;
  /**
   * Free-text context for the action, such as why a value was corrected.
   */
  note?: string;
  /**
   * The application that recorded the action, so entries merged from several systems can be traced.
   */
  system?: string;
}
/**
 * Who acted: a person, or a system account named as a person reference (for example name: Nightly import).
 */
export interface Person5 {
  /**
   * The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs.
   */
  title?: string;
  /**
   * The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit).
   */
  organization?: string;
  /**
   * Work email address, when readers need to contact the person.
   */
  email?: string;
  /**
   * Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common.
   */
  phone?: string;
}
/**
 * Local fields this format doesn't define, namespaced as <namespace>:<field>, for example examplecity:councilDistrict.
 */
export interface Extensions {}
