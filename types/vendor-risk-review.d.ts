/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Ids of the evidence files in the record's attachments.
 *
 * Items: A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
 */
export type AttachmentIds = string[];
/**
 * An issue found during the review: what it is, how severe, what raised it, and whether it is being fixed or its risk accepted.
 */
export type Finding = Finding1;

/**
 * One review of a third-party relationship: what the third party provides, what data and access it has, how critical the relationship is, inherent and residual risk, the assessments performed, findings and their remediation or acceptance, the review cadence, and the decision and its approvals. The structure follows the third-party risk management life cycle in the US banking agencies' Interagency Guidance on Third-Party Relationships: Risk Management (OCC Bulletin 2023-17), with supply chain concepts from NIST SP 800-161 Rev. 1 and ISO/IEC 27036. It records a review; it doesn't prescribe how to tier vendors or score risk, and using it does not by itself satisfy any of that guidance.
 */
export interface VendorRiskReview {
  /**
   * The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing.
   */
  $schema?: string;
  /**
   * Always vendor-risk-review. Lets a reader (or validate()) tell the format apart from the others in this repository.
   */
  recordType: "vendor-risk-review";
  /**
   * The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for.
   */
  schemaVersion: "0.1.0";
  /**
   * This review's identifier, unique within the system that created it. A relationship reviewed every year has one record per review, each with its own id; link them through vendor.id or externalIds.
   */
  id: string;
  /**
   * Ids for this review in other systems: the GRC tool, procurement, the contract repository.
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
   * Where the relationship is in the third-party risk management life cycle of the interagency guidance (OCC Bulletin 2023-17): planning; due-diligence (the guidance's Due Diligence and Third-Party Selection); contract-negotiation; ongoing-monitoring; or termination. The guidance treats oversight and accountability, independent reviews, and documentation and reporting as running throughout the life cycle rather than as stages, so they are not values here. In September 2026 the agencies proposed replacement guidance (OCC Bulletin 2026-46) organized around risk management components rather than these stages; this field follows the 2023 guidance, which applies until any replacement is final.
   */
  lifecycleStage?: "planning" | "due-diligence" | "contract-negotiation" | "ongoing-monitoring" | "termination";
  /**
   * What the third party provides under the relationship, one entry per distinct service or product. At least one is required, because a review is always of something specific.
   *
   * @minItems 1
   */
  services: [Service, ...Service[]];
  /**
   * The kinds of the organization's data the third party stores, processes or can reach, as many as apply; use none, on its own, when it has no access to the organization's data. Values: none; public; internal; confidential (business confidential); personal-data (information about an identifiable person); sensitive-personal-data (special-category or high-risk personal data such as government ids, financial account numbers, biometrics); nonpublic-personal-information (consumer information protected under the US Gramm-Leach-Bliley Act; not employee data); protected-health-information (as defined by HIPAA); payment-card-data (cardholder data in scope for PCI DSS); controlled-unclassified-information (US federal CUI); authentication-credentials (passwords, keys, tokens that grant access); source-code.
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
   * How much the organization depends on the relationship, on its own tiering scale mapped to four levels: low, moderate, high or critical. Reserve critical for relationships that support critical activities (see services[].supportsCriticalActivity). Rigor of due diligence, monitoring and contract terms should scale with this rating.
   */
  criticality: "low" | "moderate" | "high" | "critical";
  /**
   * Why the relationship has that criticality, in terms an examiner can follow: what would happen if the service failed.
   */
  criticalityRationale?: string;
  inherentRisk?: RiskRating;
  residualRisk?: RiskRating1;
  /**
   * Inherent and residual risk for each risk domain assessed. Optional; many programs rate only overall risk.
   */
  riskDomains?: DomainRating[];
  /**
   * The due diligence and monitoring work performed for this review: questionnaires, document and independent report reviews, visits, financial reviews, test reviews. Findings point at the assessment that raised them.
   */
  assessments?: Assessment[];
  /**
   * Issues found during the review and what is being done about each: remediation, or a documented risk acceptance.
   */
  findings?: Finding[];
  reviewCadence?: ReviewCadence;
  decision?: Decision;
  /**
   * Sign-offs on the decision, in the order they were given. Who must approve depends on the organization's policy and the relationship's criticality (critical relationships often go to a committee or the board).
   */
  approvals?: Approval[];
  /**
   * Where the review is in its workflow: draft; in-review (assessments under way); pending-approval; approved; rejected; or closed (complete with no further action, for example after termination). The validator checks approved and rejected agree with decision.outcome.
   */
  status: "draft" | "in-review" | "pending-approval" | "approved" | "rejected" | "closed";
  /**
   * Every status the review has had, oldest first, ending at the current status (the validator checks both).
   */
  statusHistory?: (StatusChange & {
    /**
     * The status the record moved to, one of this format's status values.
     */
    status?: "draft" | "in-review" | "pending-approval" | "approved" | "rejected" | "closed";
  })[];
  /**
   * Files that belong to the review: independent reports, questionnaires, contracts, financial statements. Many are shared under NDA; set classification accordingly.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the review, oldest first.
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
 * The organization doing the review (the bank, hospital or agency that relies on the third party). Optional because it is usually obvious inside one organization; give it when records are shared or consolidated.
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
 * The third party under review. The interagency guidance uses third-party relationship broadly: vendors, service providers, fintech partners, affiliates and others.
 */
export interface Organization1 {
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
 * The person inside the organization accountable for the relationship day to day (often the business line manager), as distinct from the risk staff who assess it.
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
 * One service or product the third party provides.
 */
export interface Service {
  /**
   * The service's name, as the business knows it.
   */
  name: string;
  /**
   * What the service does for the organization, in a sentence or two a reviewer outside the business line would understand.
   */
  description?: string;
  /**
   * Whether the service supports a critical activity as the organization defines it. The interagency guidance (OCC Bulletin 2023-17) describes critical activities as ones that could cause the organization to face significant risk if the third party fails to meet expectations, have significant customer impacts, or have a significant impact on its financial condition or operations, and leaves each organization to identify its own. Higher-risk and critical activities call for more rigorous oversight.
   */
  supportsCriticalActivity?: boolean;
  /**
   * When the service started or will start.
   */
  startDate?: string;
  /**
   * When the service ends or ended (contract expiry or exit). Must not be before startDate.
   */
  endDate?: string;
  /**
   * The contract, order or statement of work that covers the service, as the contract repository names it.
   */
  contractRef?: string;
  annualSpend?: Money;
}
/**
 * Expected or actual spend per year, used for tiering and concentration analysis.
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
 * How the third party reaches the organization's systems and data, and where the data goes.
 */
export interface Access {
  /**
   * The highest level of access the third party (or its staff) has to the organization's own systems: none; read; read-write; or administrative (can change configuration, users or security settings).
   */
  systemAccess?: "none" | "read" | "read-write" | "administrative";
  /**
   * Whether the third party stores the organization's data on infrastructure it controls (including its cloud providers), rather than only reaching it inside the organization's systems.
   */
  hostsData?: boolean;
  /**
   * Countries where the third party stores or processes the data, including through subcontractors. Matters for data transfer law, government access and resilience planning.
   *
   * Items: ISO 3166-1 alpha-2 country code in upper case, for example US, GB, DE or IN. Codes are used instead of names so records sort, filter and compare across languages. The pattern checks the shape only; it doesn't reject unassigned codes.
   */
  dataLocations?: string[];
  /**
   * The third party's own suppliers that support the service or touch the data. The interagency guidance calls these subcontractors; many programs call them fourth parties. NIST SP 800-161 Rev. 1 treats them as part of the supply chain the organization must understand.
   */
  subcontractors?: Subcontractor[];
}
/**
 * One subcontractor.
 */
export interface Subcontractor {
  /**
   * The subcontractor's name.
   */
  name: string;
  /**
   * What the subcontractor does for the third party.
   */
  service?: string;
  /**
   * ISO 3166-1 alpha-2 country code in upper case, for example US, GB, DE or IN. Codes are used instead of names so records sort, filter and compare across languages. The pattern checks the shape only; it doesn't reject unassigned codes.
   */
  country?: string;
}
/**
 * Risk before the organization's and the third party's controls are taken into account, based on the service, data, access and criticality.
 */
export interface RiskRating {
  /**
   * The overall level.
   */
  level: "low" | "moderate" | "high" | "critical";
  /**
   * A numeric score on the organization's own scale, if its method produces one. Not comparable between organizations; level is.
   */
  score?: number;
  /**
   * The scoring method or model used, with its version.
   */
  method?: string;
  /**
   * Why the rating is what it is.
   */
  rationale?: string;
}
/**
 * Risk remaining after controls, given what the assessments showed. The gap between inherent and residual risk is what the controls are credited with.
 */
export interface RiskRating1 {
  /**
   * The overall level.
   */
  level: "low" | "moderate" | "high" | "critical";
  /**
   * A numeric score on the organization's own scale, if its method produces one. Not comparable between organizations; level is.
   */
  score?: number;
  /**
   * The scoring method or model used, with its version.
   */
  method?: string;
  /**
   * Why the rating is what it is.
   */
  rationale?: string;
}
/**
 * The rating in one risk domain.
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
   * Residual risk in this domain, once assessed.
   */
  residual?: "low" | "moderate" | "high" | "critical";
  /**
   * What drives the rating, including the controls that reduce it.
   */
  rationale?: string;
}
/**
 * One assessment activity.
 */
export interface Assessment {
  /**
   * Identifier for the assessment, unique within the review; findings refer to it.
   */
  id: string;
  /**
   * questionnaire (security or due diligence questionnaire); document-review (policies, plans, insurance, contracts); independent-report-review (an independent audit or certification report, for example a SOC 1 or SOC 2 report, an ISO/IEC 27001 certificate or a PCI DSS attestation); onsite-visit; remote-assessment (interviews or walkthroughs by video); financial-review (financial statements and condition); penetration-test-review; continuous-monitoring (outside-in security ratings, news, sanctions or financial alerts); other.
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
   * The report, certificate or questionnaire reviewed, named the way its issuer names it.
   */
  evidenceName?: string;
  /**
   * Start of the period the evidence covers (for a SOC 2 Type 2 report, the start of its examination period).
   */
  periodStart?: string;
  /**
   * End of the period the evidence covers. Must not be before periodStart; a stale period (long before the review) is itself worth a finding.
   */
  periodEnd?: string;
  performedBy?: Person1;
  /**
   * When it was completed.
   */
  completedAt?: string;
  /**
   * satisfactory; satisfactory-with-findings (acceptable, with findings recorded below); unsatisfactory; or inconclusive (not enough evidence to conclude, for example an unanswered questionnaire).
   */
  result?: "satisfactory" | "satisfactory-with-findings" | "unsatisfactory" | "inconclusive";
  attachmentIds?: AttachmentIds;
}
/**
 * Who performed the assessment.
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
export interface Finding1 {
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  id: string;
  /**
   * The issue in one line.
   */
  title: string;
  /**
   * What was found and why it matters.
   */
  description?: string;
  /**
   * The risk domain the finding falls in.
   */
  domain?:
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
   * low, medium, high or critical, on the organization's issue-rating scale.
   */
  severity: "low" | "medium" | "high" | "critical";
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  assessmentId?: string;
  /**
   * open; remediation-planned; in-remediation; remediated (fixed, awaiting or past verification); risk-accepted (not being fixed; riskAcceptance is required); or closed.
   */
  status: "open" | "remediation-planned" | "in-remediation" | "remediated" | "risk-accepted" | "closed";
  remediation?: Remediation;
  riskAcceptance?: RiskAcceptance;
}
/**
 * The plan to fix the issue.
 */
export interface Remediation {
  /**
   * What will be done, by whom (the third party or the organization).
   */
  plan?: string;
  owner?: Person2;
  /**
   * When it is due.
   */
  dueDate?: string;
  /**
   * When it was completed.
   */
  completedAt?: string;
  verifiedBy?: Person3;
}
/**
 * Who is responsible for seeing it done.
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
 * Who confirmed the fix works. Separation between the person fixing and the person verifying is what examiners look for.
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
 * A documented decision to accept the risk instead of fixing it: who accepted it, when, why, and until when. Required when status is risk-accepted, because an undocumented acceptance is indistinguishable from an ignored finding.
 */
export interface RiskAcceptance {
  acceptedBy: Person4;
  /**
   * When the risk was accepted.
   */
  acceptedAt: string;
  /**
   * When the acceptance expires and must be revisited. Must not be before acceptedAt. Open-ended acceptances are a common examination finding; give a date.
   */
  expiresOn?: string;
  /**
   * Why the risk is accepted, and any compensating controls.
   */
  rationale: string;
}
/**
 * Who accepted the risk. Should be someone with authority to accept risk of this severity under the organization's policy.
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
 * How often the relationship is reviewed and when the next review is due, plus the events that should prompt an earlier review. Cadence normally follows criticality.
 */
export interface ReviewCadence {
  /**
   * monthly, quarterly, semiannual, annual, biennial (every two years) or event-driven (no fixed schedule; reviewed only on a trigger).
   */
  frequency: "monthly" | "quarterly" | "semiannual" | "annual" | "biennial" | "event-driven";
  /**
   * When the last review was completed.
   */
  lastReviewedOn?: string;
  /**
   * When the next scheduled review is due. Must not be before lastReviewedOn.
   */
  nextReviewDue?: string;
  /**
   * Events that prompt a review outside the schedule.
   *
   * Items: One trigger event, in a few words.
   */
  triggers?: string[];
}
/**
 * The outcome of the review, once one is made.
 */
export interface Decision {
  /**
   * approved; approved-with-conditions (conditions must be listed); rejected (don't enter or renew the relationship); deferred (more information needed before deciding); or terminate-relationship (exit an existing relationship).
   */
  outcome: "approved" | "approved-with-conditions" | "rejected" | "deferred" | "terminate-relationship";
  /**
   * Conditions attached to the approval, each specific and checkable. Required, and must not be empty, when the outcome is approved-with-conditions.
   *
   * Items: One condition.
   */
  conditions?: string[];
  /**
   * When the decision was made.
   */
  decidedAt?: string;
  /**
   * Why the decision was made, especially when it accepts elevated residual risk.
   */
  rationale?: string;
}
/**
 * One person's sign-off.
 */
export interface Approval {
  approver: Person5;
  /**
   * The role in which the person approves, which is what policy requires (a person may hold several).
   */
  capacity?: string;
  /**
   * approved, rejected or abstained (for example because of a conflict of interest).
   */
  decision: "approved" | "rejected" | "abstained";
  /**
   * When the sign-off was given.
   */
  at: string;
  /**
   * What the approver said, if anything.
   */
  comment?: string;
}
/**
 * Who signed off.
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
  by?: Person6;
  /**
   * Why the status changed, in a sentence, especially for changes a reader wouldn't expect (a reopened review, a withdrawn item).
   */
  reason?: string;
}
/**
 * Who changed the status. Leave out where naming the person would break a promise of anonymity (see patient-safety-incident).
 */
export interface Person6 {
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
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
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
  actor: Person7;
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
export interface Person7 {
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
 * Local fields this format doesn't define, namespaced as <namespace>:<field>, for example examplebank:costCenter.
 */
export interface Extensions {}
