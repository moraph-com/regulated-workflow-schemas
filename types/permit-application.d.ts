/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Who is applying.
 */
export type Party = {
  [k: string]: unknown;
};
/**
 * A person or organization on the application, in a role. Give a person, an organization, or both (a contact at a firm).
 */
export type Party1 = {
  [k: string]: unknown;
};
/**
 * Where the work will happen.
 */
export type Site = {
  [k: string]: unknown;
};

/**
 * An application for a building, land-use or other local-government permit, from submission through plan review, fees, inspections and decision, including the statutory review clock. Informed by common local-government permitting practice and the Building and Land Development Specification (BLDS); the docs map fields to BLDS where they correspond.
 */
export interface PermitApplication {
  /**
   * The $id of this schema, so readers can tell what the record is.
   */
  $schema?: string;
  /**
   * Always permit-application.
   */
  recordType: "permit-application";
  /**
   * The version of this format the record follows.
   */
  schemaVersion: "0.1.0";
  /**
   * This application's identifier, unique within the system that created it.
   */
  id: string;
  /**
   * Ids for this application in other systems, for example the jurisdiction's permitting system.
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
   * What the applicant proposes to do.
   */
  description?: string;
  valuation?: Money;
  applicant: Party;
  /**
   * Owners, contractors, design professionals and agents on the application besides the applicant.
   */
  parties?: Party1[];
  site: Site;
  building?: Building;
  /**
   * When it was submitted.
   */
  submittedAt?: string;
  /**
   * Plans and documents submitted with the application. Each points at an entry in attachments.
   */
  documents?: SubmittedDocument[];
  /**
   * Fees assessed on the application.
   */
  fees?: Fee[];
  /**
   * Reviews by each discipline, one entry per discipline per review cycle.
   */
  reviews?: PlanReview[];
  statutoryClock?: StatutoryReviewClock;
  /**
   * Inspections of the permitted work.
   */
  inspections?: Inspection[];
  decision?: Decision;
  /**
   * draft, submitted, intake-review, incomplete, in-review, corrections-required, approved, issued, under-inspection, finaled, denied, withdrawn or expired.
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
    | "expired";
  /**
   * Every status the record has had, oldest first.
   */
  statusHistory?: StatusChange[];
  /**
   * Files that belong to the application: plans, calculations, photos, letters.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the application, oldest first.
   */
  auditTrail?: AuditEntry[];
  extensions?: Extensions;
}
/**
 * An identifier assigned by another system or registry.
 */
export interface ExternalIdentifier {
  /**
   * The registry or system that assigned the value, for example LEI, EIN, DUNS, UEI, company-number, NPI, or a source system's name.
   */
  scheme: string;
  /**
   * The identifier as the scheme writes it.
   */
  value: string;
}
/**
 * The jurisdiction whose permit is sought.
 */
export interface Jurisdiction {
  /**
   * Country.
   */
  country: string;
  /**
   * State, province or other ISO 3166-2 subdivision.
   */
  subdivision?: string;
  /**
   * City, county or district name, as the authority writes it.
   */
  locality?: string;
  /**
   * The agency or body with jurisdiction, for example Department of Building Safety.
   */
  authority?: string;
}
/**
 * What kind of permit is sought.
 */
export interface PermitType {
  /**
   * building, demolition, electrical, mechanical, plumbing, fire, grading, right-of-way, sign, zoning, land-use, environmental, special-event or other.
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
   * The jurisdiction's own permit type name, for example Residential Addition.
   */
  subtype?: string;
  /**
   * new, addition, alteration, repair, demolition, change-of-use or other.
   */
  workClass?: "new" | "addition" | "alteration" | "repair" | "demolition" | "change-of-use" | "other";
  /**
   * Whether the work is residential (true) or commercial and other (false).
   */
  residential?: boolean;
}
/**
 * Declared value of the work.
 */
export interface Money {
  /**
   * The currency.
   */
  currency: string;
  /**
   * Decimal amount in the currency's major unit, as a string, for example "1250.00" or "-15.5".
   */
  amount: string;
}
/**
 * Facts about the building or structure, for building permits.
 */
export interface Building {
  /**
   * The building code occupancy classification, for example R-3 or B.
   */
  occupancyGroup?: string;
  /**
   * The building code construction type, for example V-B.
   */
  constructionType?: string;
  /**
   * Number of stories above grade.
   */
  stories?: number;
  /**
   * Dwelling units added (negative when removed).
   */
  dwellingUnits?: number;
  area?: Area;
}
/**
 * Floor area affected by the work.
 */
export interface Area {
  /**
   * The area.
   */
  value: number;
  /**
   * sq-ft or sq-m.
   */
  unit: "sq-ft" | "sq-m";
}
/**
 * One submitted document.
 */
export interface SubmittedDocument {
  /**
   * The id of the file in the record's attachments.
   */
  attachmentId: string;
  /**
   * site-plan, architectural-plans, structural-calculations, energy-compliance, mechanical-electrical-plumbing-plans, survey, photographs, owner-authorization, contractor-license, insurance-certificate, environmental-review or other.
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
   * Revision number or label, for example 2 or Rev B.
   */
  revision?: string;
  /**
   * When it was submitted.
   */
  submittedAt?: string;
}
/**
 * One fee line.
 */
export interface Fee {
  /**
   * The jurisdiction's fee code.
   */
  code?: string;
  /**
   * What the fee is for.
   */
  description: string;
  amount: Money1;
  /**
   * assessed, invoiced, paid, waived or refunded.
   */
  status: "assessed" | "invoiced" | "paid" | "waived" | "refunded";
  /**
   * When it was paid.
   */
  paidAt?: string;
  /**
   * The receipt or transaction reference.
   */
  receipt?: string;
}
/**
 * The fee amount.
 */
export interface Money1 {
  /**
   * The currency.
   */
  currency: string;
  /**
   * Decimal amount in the currency's major unit, as a string, for example "1250.00" or "-15.5".
   */
  amount: string;
}
/**
 * One discipline's review in one cycle.
 */
export interface PlanReview {
  /**
   * zoning, building, structural, fire, electrical, mechanical, plumbing, civil-engineering, environmental, health, historic-preservation, transportation, utilities or other.
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
   * The review cycle, starting at 1; resubmissions start a new cycle.
   */
  cycle: number;
  reviewer?: Person;
  /**
   * When it started.
   */
  startedAt?: string;
  /**
   * When it was completed.
   */
  completedAt?: string;
  /**
   * approved, approved-with-conditions, corrections-required, denied or not-applicable.
   */
  outcome?: "approved" | "approved-with-conditions" | "corrections-required" | "denied" | "not-applicable";
  /**
   * Review comments the applicant must address.
   */
  comments?: Comment[];
}
/**
 * Who reviewed.
 */
export interface Person {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer.
   */
  title?: string;
  /**
   * The organization the person acts for, by name.
   */
  organization?: string;
  /**
   * Email address.
   */
  email?: string;
  /**
   * Phone number, ideally in E.164 form (+15555550123).
   */
  phone?: string;
}
/**
 * One review comment.
 */
export interface Comment {
  /**
   * The comment.
   */
  text: string;
  /**
   * The plan sheet the comment refers to, for example A2.1.
   */
  sheet?: string;
  /**
   * The code section cited.
   */
  codeSection?: string;
  /**
   * Whether the comment has been resolved.
   */
  resolved?: boolean;
}
/**
 * The time limit the law or ordinance sets for deciding the application, and its state. Many jurisdictions set review deadlines; the rules vary, so the record states the basis and the counting rule it applied.
 */
export interface StatutoryReviewClock {
  /**
   * The law, ordinance or policy that sets the deadline, as cited locally.
   */
  basis: string;
  /**
   * Days allowed for the decision.
   */
  days: number;
  /**
   * calendar or business days.
   */
  dayType: "calendar" | "business";
  /**
   * When it started.
   */
  startedAt?: string;
  /**
   * The date the decision is due under the basis, after pauses.
   */
  dueOn?: string;
  /**
   * Periods when the clock stopped, for example while waiting for the applicant.
   */
  pauses?: Pause[];
  /**
   * What the basis says happens when the deadline passes: deemed-approved, fee-refund, escalation, none or unspecified.
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
   * When the pause ended; leave out while it continues.
   */
  to?: string;
  /**
   * awaiting-applicant, fees-outstanding, applicant-request, third-party-review or other.
   */
  reason: "awaiting-applicant" | "fees-outstanding" | "applicant-request" | "third-party-review" | "other";
}
/**
 * One inspection.
 */
export interface Inspection {
  /**
   * The inspection, as the jurisdiction names it, for example Footing or Final Electrical.
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
  inspector?: Person1;
  /**
   * scheduled, passed, failed, partial, cancelled or no-access.
   */
  result: "scheduled" | "passed" | "failed" | "partial" | "cancelled" | "no-access";
  /**
   * When it was completed.
   */
  completedAt?: string;
  /**
   * The inspector's notes.
   */
  notes?: string;
}
/**
 * Who inspected.
 */
export interface Person1 {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer.
   */
  title?: string;
  /**
   * The organization the person acts for, by name.
   */
  organization?: string;
  /**
   * Email address.
   */
  email?: string;
  /**
   * Phone number, ideally in E.164 form (+15555550123).
   */
  phone?: string;
}
/**
 * The jurisdiction's decision on the application.
 */
export interface Decision {
  /**
   * issued, approved (approved but not yet issued, for example pending fees), denied, withdrawn, expired or revoked.
   */
  outcome: "issued" | "approved" | "denied" | "withdrawn" | "expired" | "revoked";
  /**
   * When the decision was made.
   */
  decidedAt: string;
  decidedBy?: Person2;
  /**
   * The number of the issued permit. Required when the outcome is issued.
   */
  permitNumber?: string;
  /**
   * Conditions of approval.
   */
  conditions?: string[];
  /**
   * Reasons for a denial or revocation.
   */
  reasons?: string;
  /**
   * When it expires.
   */
  expiresOn?: string;
  /**
   * Last day to file an appeal.
   */
  appealDeadline?: string;
}
/**
 * Who decided.
 */
export interface Person2 {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer.
   */
  title?: string;
  /**
   * The organization the person acts for, by name.
   */
  organization?: string;
  /**
   * Email address.
   */
  email?: string;
  /**
   * Phone number, ideally in E.164 form (+15555550123).
   */
  phone?: string;
}
/**
 * One change of the record's status.
 */
export interface StatusChange {
  /**
   * The status the record moved to (one of the record's status values).
   */
  status: string;
  /**
   * When it happened.
   */
  at: string;
  by?: Person3;
  /**
   * Why the status changed.
   */
  reason?: string;
}
/**
 * Who made the change.
 */
export interface Person3 {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer.
   */
  title?: string;
  /**
   * The organization the person acts for, by name.
   */
  organization?: string;
  /**
   * Email address.
   */
  email?: string;
  /**
   * Phone number, ideally in E.164 form (+15555550123).
   */
  phone?: string;
}
/**
 * A document or file that belongs to the record. The SHA-256 digest lets anyone confirm the file they hold is the one the record refers to.
 */
export interface Attachment {
  /**
   * Identifier in the system the reference comes from.
   */
  id: string;
  /**
   * What the file is, in a few words.
   */
  title: string;
  /**
   * IANA media type, for example application/pdf.
   */
  mediaType: string;
  /**
   * Lower-case hex SHA-256 digest of the file's bytes.
   */
  sha256: string;
  /**
   * The file's size in bytes.
   */
  byteSize?: number;
  /**
   * Where an authorized reader can fetch the file. Records shared outside the organization should not carry links that grant access by themselves.
   */
  uri?: string;
  /**
   * How the file may be shared: public, internal, confidential or restricted.
   */
  classification?: "public" | "internal" | "confidential" | "restricted";
  /**
   * When the file was added.
   */
  addedAt?: string;
}
/**
 * One recorded action on the record: who did what, when. Systems append entries and never rewrite them.
 */
export interface AuditEntry {
  /**
   * When it happened.
   */
  at: string;
  actor: Person4;
  /**
   * What happened, as a short verb phrase, for example created, field-changed, approved, exported.
   */
  action: string;
  /**
   * JSON Pointer (RFC 6901) to the field that changed, when one did.
   */
  field?: string;
  /**
   * The previous value, as text. Leave out for sensitive fields.
   */
  from?: string;
  /**
   * The new value, as text. Leave out for sensitive fields.
   */
  to?: string;
  /**
   * Free-text context for the action.
   */
  note?: string;
  /**
   * The application that recorded the action.
   */
  system?: string;
}
/**
 * Who acted.
 */
export interface Person4 {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The person's name as it should appear on the record.
   */
  name: string;
  /**
   * Job title or position, for example Chief Risk Officer.
   */
  title?: string;
  /**
   * The organization the person acts for, by name.
   */
  organization?: string;
  /**
   * Email address.
   */
  email?: string;
  /**
   * Phone number, ideally in E.164 form (+15555550123).
   */
  phone?: string;
}
/**
 * Local fields this format doesn't define, namespaced as <namespace>:<field>.
 */
export interface Extensions {}
