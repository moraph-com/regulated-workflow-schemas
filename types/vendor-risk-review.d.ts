/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Ids of related entries in the record's attachments.
 */
export type AttachmentIds = string[];
/**
 * An issue found during the review.
 */
export type Finding = {
  [k: string]: unknown;
};

/**
 * One review of a third-party relationship: what the vendor provides, what data and access it has, how critical it is, the inherent and residual risk, the assessments performed, findings and their remediation, the review cadence and the approval decision. Informed by the US interagency guidance on third-party relationships (OCC Bulletin 2023-17), NIST SP 800-161 Rev. 1 and ISO/IEC 27036.
 */
export interface VendorRiskReview {
  /**
   * The $id of this schema, so readers can tell what the record is.
   */
  $schema?: string;
  /**
   * Always vendor-risk-review.
   */
  recordType: "vendor-risk-review";
  /**
   * The version of this format the record follows.
   */
  schemaVersion: "0.1.0";
  /**
   * This review's identifier, unique within the system that created it.
   */
  id: string;
  /**
   * Ids for this review in other systems (GRC tool, procurement, contract repository).
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
  reviewingOrganization?: Organization;
  vendor: Organization1;
  relationshipOwner?: Person;
  /**
   * Where the relationship is in the third-party risk life cycle: planning, due-diligence (before contract), contract-negotiation, ongoing-monitoring or termination.
   */
  lifecycleStage?: "planning" | "due-diligence" | "contract-negotiation" | "ongoing-monitoring" | "termination";
  /**
   * What the vendor provides under the relationship.
   *
   * @minItems 1
   */
  services: [Service, ...Service[]];
  /**
   * The kinds of data the vendor stores, processes or can reach. Use none when it has no access to the organization's data.
   */
  dataCategories?: (
    | "none"
    | "public"
    | "internal"
    | "confidential"
    | "personal-data"
    | "sensitive-personal-data"
    | "nonpublic-personal-information"
    | "protected-health-information"
    | "payment-card-data"
    | "controlled-unclassified-information"
    | "authentication-credentials"
    | "source-code"
  )[];
  access?: Access;
  /**
   * How much the organization depends on the relationship: low, moderate, high or critical. Critical relationships support critical activities.
   */
  criticality: "low" | "moderate" | "high" | "critical";
  /**
   * Why the relationship has that criticality.
   */
  criticalityRationale?: string;
  inherentRisk?: RiskRating;
  residualRisk?: RiskRating1;
  /**
   * Inherent and residual risk for each risk domain that was assessed.
   */
  riskDomains?: DomainRating[];
  /**
   * Due-diligence and monitoring activities performed for this review.
   */
  assessments?: Assessment[];
  /**
   * Issues found during the review and what is being done about them.
   */
  findings?: Finding[];
  reviewCadence?: ReviewCadence;
  decision?: Decision;
  /**
   * Sign-offs on the decision, in order.
   */
  approvals?: Approval[];
  /**
   * draft, in-review, pending-approval, approved, rejected or closed.
   */
  status: "draft" | "in-review" | "pending-approval" | "approved" | "rejected" | "closed";
  /**
   * Every status the record has had, oldest first.
   */
  statusHistory?: StatusChange[];
  /**
   * Files that belong to the review: reports, questionnaires, contracts.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the review, oldest first.
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
 * The organization doing the review.
 */
export interface Organization {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The name the organization trades under.
   */
  name: string;
  /**
   * The registered legal name, when it differs from the name.
   */
  legalName?: string;
  /**
   * Registry identifiers such as LEI, EIN, DUNS or UEI.
   */
  identifiers?: ExternalIdentifier[];
  /**
   * Country.
   */
  country?: string;
  /**
   * The organization's public website.
   */
  website?: string;
}
/**
 * The third party under review.
 */
export interface Organization1 {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The name the organization trades under.
   */
  name: string;
  /**
   * The registered legal name, when it differs from the name.
   */
  legalName?: string;
  /**
   * Registry identifiers such as LEI, EIN, DUNS or UEI.
   */
  identifiers?: ExternalIdentifier[];
  /**
   * Country.
   */
  country?: string;
  /**
   * The organization's public website.
   */
  website?: string;
}
/**
 * The person accountable for the relationship inside the organization.
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
 * One service or product the vendor provides.
 */
export interface Service {
  /**
   * The service's name.
   */
  name: string;
  /**
   * What the service does for the organization.
   */
  description?: string;
  /**
   * Whether the service supports an activity whose failure would significantly harm the organization or its customers.
   */
  supportsCriticalActivity?: boolean;
  /**
   * When the service started.
   */
  startDate?: string;
  /**
   * When the service ends or ended.
   */
  endDate?: string;
  /**
   * The contract or order that covers the service.
   */
  contractRef?: string;
  annualSpend?: Money;
}
/**
 * Expected or actual spend per year.
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
 * How the vendor reaches the organization's systems and data.
 */
export interface Access {
  /**
   * The highest level of access the vendor has to the organization's systems: none, read, read-write or administrative.
   */
  systemAccess?: "none" | "read" | "read-write" | "administrative";
  /**
   * Whether the vendor stores the organization's data on infrastructure it controls.
   */
  hostsData?: boolean;
  /**
   * Countries where the vendor stores or processes the data.
   */
  dataLocations?: string[];
  /**
   * The vendor's own suppliers that touch the service or data (fourth parties).
   */
  subcontractors?: Subcontractor[];
}
/**
 * One fourth party.
 */
export interface Subcontractor {
  /**
   * The subcontractor's name.
   */
  name: string;
  /**
   * What the subcontractor does for the vendor.
   */
  service?: string;
  /**
   * ISO 3166-1 alpha-2 country code, upper case.
   */
  country?: string;
}
/**
 * Risk before the vendor's and the organization's controls are taken into account.
 */
export interface RiskRating {
  /**
   * The overall level: low, moderate, high or critical.
   */
  level: "low" | "moderate" | "high" | "critical";
  /**
   * A numeric score on the organization's own scale, if it uses one.
   */
  score?: number;
  /**
   * The scoring method or model used.
   */
  method?: string;
  /**
   * Why the rating is what it is.
   */
  rationale?: string;
}
/**
 * Risk remaining after controls.
 */
export interface RiskRating1 {
  /**
   * The overall level: low, moderate, high or critical.
   */
  level: "low" | "moderate" | "high" | "critical";
  /**
   * A numeric score on the organization's own scale, if it uses one.
   */
  score?: number;
  /**
   * The scoring method or model used.
   */
  method?: string;
  /**
   * Why the rating is what it is.
   */
  rationale?: string;
}
/**
 * Risk in one domain.
 */
export interface DomainRating {
  /**
   * The risk domain.
   */
  domain:
    | "information-security"
    | "privacy"
    | "operational-resilience"
    | "business-continuity"
    | "financial"
    | "compliance"
    | "legal"
    | "reputational"
    | "concentration"
    | "strategic"
    | "geographic"
    | "environmental-social";
  /**
   * Inherent risk in this domain.
   */
  inherent: "low" | "moderate" | "high" | "critical";
  /**
   * Residual risk in this domain.
   */
  residual?: "low" | "moderate" | "high" | "critical";
  /**
   * What drives the rating, including controls that reduce it.
   */
  rationale?: string;
}
/**
 * One assessment activity.
 */
export interface Assessment {
  /**
   * Identifier for this item, unique within the record.
   */
  id: string;
  /**
   * questionnaire, document-review, independent-report-review (for example a SOC report or certificate), onsite-visit, remote-assessment, financial-review, penetration-test-review, continuous-monitoring or other.
   */
  type:
    | "questionnaire"
    | "document-review"
    | "independent-report-review"
    | "onsite-visit"
    | "remote-assessment"
    | "financial-review"
    | "penetration-test-review"
    | "continuous-monitoring"
    | "other";
  /**
   * What was assessed and how.
   */
  description?: string;
  /**
   * The report, certificate or questionnaire reviewed, as named by its issuer, for example 'SOC 2 Type II report' or 'ISO/IEC 27001 certificate'.
   */
  evidenceName?: string;
  /**
   * Start of the period the evidence covers.
   */
  periodStart?: string;
  /**
   * End of the period the evidence covers.
   */
  periodEnd?: string;
  performedBy?: Person1;
  /**
   * When it was completed.
   */
  completedAt?: string;
  /**
   * satisfactory, satisfactory-with-findings, unsatisfactory or inconclusive.
   */
  result?: "satisfactory" | "satisfactory-with-findings" | "unsatisfactory" | "inconclusive";
  attachmentIds?: AttachmentIds;
}
/**
 * Who performed the assessment.
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
 * How often the relationship is reviewed, and when the next review is due.
 */
export interface ReviewCadence {
  /**
   * monthly, quarterly, semiannual, annual, biennial or event-driven.
   */
  frequency: "monthly" | "quarterly" | "semiannual" | "annual" | "biennial" | "event-driven";
  /**
   * When the last review was completed.
   */
  lastReviewedOn?: string;
  /**
   * When the next scheduled review is due.
   */
  nextReviewDue?: string;
  /**
   * Events that prompt a review outside the schedule, for example a breach notice, change of control or material service change.
   */
  triggers?: string[];
}
/**
 * The outcome of the review.
 */
export interface Decision {
  /**
   * approved, approved-with-conditions, rejected, deferred or terminate-relationship.
   */
  outcome: "approved" | "approved-with-conditions" | "rejected" | "deferred" | "terminate-relationship";
  /**
   * Conditions attached to the approval.
   */
  conditions?: string[];
  /**
   * When the decision was made.
   */
  decidedAt?: string;
  /**
   * Why the decision was made.
   */
  rationale?: string;
}
/**
 * One person's sign-off.
 */
export interface Approval {
  approver: Person2;
  /**
   * The role in which the person approves, for example business owner, CISO, third-party risk committee.
   */
  capacity?: string;
  /**
   * approved, rejected or abstained.
   */
  decision: "approved" | "rejected" | "abstained";
  /**
   * When.
   */
  at: string;
  /**
   * What the approver said.
   */
  comment?: string;
}
/**
 * Who signed off.
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
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
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
