/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * A report of a patient safety event (an incident that reached the patient, a near miss or an unsafe condition), with its harm assessment, contributing factors, immediate actions, notifications and investigation. Informed by the AHRQ Common Formats for Event Reporting and the WHO Conceptual Framework for the International Classification for Patient Safety (ICPS). Designed to carry as little protected health information as possible: there are no fields for patient names, dates of birth or medical record numbers, only an opaque reference into the source system. Records are still not de-identified data: event dates and the facility can identify a patient, and free text can hold anything, so treat them as confidential.
 */
export interface PatientSafetyIncident {
  /**
   * The $id of this schema, so readers can tell what the record is.
   */
  $schema?: string;
  /**
   * Always patient-safety-incident.
   */
  recordType: "patient-safety-incident";
  /**
   * The version of this format the record follows.
   */
  schemaVersion: "0.1.0";
  /**
   * This report's identifier, unique within the system that created it.
   */
  id: string;
  /**
   * Ids for this report in other systems (incident reporting tool, PSO submission, risk management).
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
  facility: Facility;
  event: Event;
  /**
   * incident (reached the patient, whether or not it caused harm), near-miss (did not reach the patient) or unsafe-condition (a circumstance that increases the chance of an event). These follow the AHRQ Common Formats event types.
   */
  eventType: "incident" | "near-miss" | "unsafe-condition";
  /**
   * The clinical area of the event, following the AHRQ Common Formats event-specific categories: blood-or-blood-product, device-or-medical-supply, fall, healthcare-associated-infection, medication-or-other-substance, perinatal, pressure-injury, surgery-or-anesthesia, venous-thromboembolism, or other.
   */
  eventCategory:
    | "blood-or-blood-product"
    | "device-or-medical-supply"
    | "fall"
    | "healthcare-associated-infection"
    | "medication-or-other-substance"
    | "perinatal"
    | "pressure-injury"
    | "surgery-or-anesthesia"
    | "venous-thromboembolism"
    | "other";
  /**
   * A finer classification in the reporting organization's own terms, for example wrong dose.
   */
  eventSubcategory?: string;
  /**
   * What happened, in the reporter's words. Do not include patient names, dates of birth, record numbers or other direct identifiers.
   */
  description: string;
  patient?: Patient;
  /**
   * Whether the event reached the patient.
   */
  reachedPatient?: boolean;
  harm?: Harm;
  /**
   * Circumstances that contributed to the event.
   */
  contributingFactors?: ContributingFactor[];
  /**
   * What was done straight away to care for the patient and make the situation safe.
   */
  immediateActions?: ImmediateAction[];
  reporter: Reporter;
  /**
   * Who was told about the event, when and how.
   */
  notifications?: Notification[];
  investigation?: Investigation;
  psoSubmission?: PSOSubmission;
  /**
   * submitted, triaged, under-investigation, action-plan, closed or not-a-safety-event.
   */
  status: "submitted" | "triaged" | "under-investigation" | "action-plan" | "closed" | "not-a-safety-event";
  /**
   * Every status the record has had, oldest first, each one of the values of status. For an anonymous report, don't record the reporter in by.
   */
  statusHistory?: (StatusChange & {
    /**
     * The status the record moved to, one of this format's status values.
     */
    status?: "submitted" | "triaged" | "under-investigation" | "action-plan" | "closed" | "not-a-safety-event";
  })[];
  /**
   * Files that belong to the report. Keep identifiable clinical documents in the clinical record, not here.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the report, oldest first. For an anonymous report, don't record the reporter as an actor.
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
 * Where the event happened.
 */
export interface Facility {
  /**
   * Identifier for this item, unique within the record.
   */
  id?: string;
  /**
   * The facility's name.
   */
  name: string;
  /**
   * hospital, ambulatory-surgery-center, clinic, long-term-care, behavioral-health, pharmacy, home-health, emergency-medical-services or other.
   */
  type:
    | "hospital"
    | "ambulatory-surgery-center"
    | "clinic"
    | "long-term-care"
    | "behavioral-health"
    | "pharmacy"
    | "home-health"
    | "emergency-medical-services"
    | "other";
  /**
   * Facility identifiers such as a CMS Certification Number or a national provider id.
   */
  identifiers?: ExternalIdentifier[];
  jurisdiction?: Jurisdiction;
}
/**
 * Where the facility is regulated.
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
 * When and where the event happened.
 */
export interface Event {
  /**
   * When the event happened.
   */
  occurredAt?: string;
  /**
   * exact, approximate or unknown. Use approximate when the time was estimated after the fact.
   */
  occurredAtPrecision?: "exact" | "approximate" | "unknown";
  /**
   * When the event was discovered.
   */
  discoveredAt: string;
  location?: Location;
}
/**
 * Where in the facility the event happened.
 */
export interface Location {
  /**
   * inpatient-unit, intensive-care, emergency-department, operating-room, procedure-area, labor-and-delivery, outpatient-area, pharmacy, laboratory, imaging, patient-home, transport, common-area or other.
   */
  type?:
    | "inpatient-unit"
    | "intensive-care"
    | "emergency-department"
    | "operating-room"
    | "procedure-area"
    | "labor-and-delivery"
    | "outpatient-area"
    | "pharmacy"
    | "laboratory"
    | "imaging"
    | "patient-home"
    | "transport"
    | "common-area"
    | "other";
  /**
   * The unit or department name, for example 4 West Medical.
   */
  unit?: string;
  /**
   * More precise location, for example bathroom of room 12.
   */
  detail?: string;
}
/**
 * De-identified facts about the patient involved, when the event involved one. Holds no direct identifiers by design.
 */
export interface Patient {
  /**
   * neonate (0-28 days), infant (29 days to 1 year), child (1-12), adolescent (13-17), adult-18-44, adult-45-64, adult-65-84, adult-85-plus or unknown.
   */
  ageBand?:
    | "neonate"
    | "infant"
    | "child"
    | "adolescent"
    | "adult-18-44"
    | "adult-45-64"
    | "adult-65-84"
    | "adult-85-plus"
    | "unknown";
  /**
   * female, male, other or unknown.
   */
  sex?: "female" | "male" | "other" | "unknown";
  /**
   * An opaque key that lets authorized staff find the encounter in the source system. Not a medical record number.
   */
  encounterRef?: string;
}
/**
 * The assessed harm to the patient, using the concepts of the AHRQ Common Formats Harm Scale.
 */
export interface Harm {
  /**
   * death, severe-harm, moderate-harm, mild-harm, no-harm or unknown.
   */
  level: "death" | "severe-harm" | "moderate-harm" | "mild-harm" | "no-harm" | "unknown";
  /**
   * permanent, temporary or unknown.
   */
  duration?: "permanent" | "temporary" | "unknown";
  /**
   * Whether the patient needed treatment because of the event.
   */
  additionalTreatment?: boolean;
  /**
   * When harm was assessed.
   */
  assessedAt?: string;
  assessedBy?: Person;
}
/**
 * Who assessed harm.
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
 * One contributing factor.
 */
export interface ContributingFactor {
  /**
   * communication, handoff, staffing, training, policy-or-procedure, equipment-or-device, environment, patient-factors, task-factors, team-factors, organizational-culture, labeling-or-packaging, information-system or other.
   */
  category:
    | "communication"
    | "handoff"
    | "staffing"
    | "training"
    | "policy-or-procedure"
    | "equipment-or-device"
    | "environment"
    | "patient-factors"
    | "task-factors"
    | "team-factors"
    | "organizational-culture"
    | "labeling-or-packaging"
    | "information-system"
    | "other";
  /**
   * How the factor contributed.
   */
  detail?: string;
}
/**
 * One action taken.
 */
export interface ImmediateAction {
  /**
   * What was done.
   */
  action: string;
  /**
   * When the action was taken.
   */
  takenAt?: string;
  /**
   * The role of the person who acted, for example charge nurse.
   */
  takenByRole?: string;
}
/**
 * Who reported the event. Reports may be anonymous; an anonymous report carries no contact details, and systems should also keep the reporter's name out of statusHistory and auditTrail.
 */
export interface Reporter {
  /**
   * Whether the reporter chose to stay anonymous.
   */
  anonymous: boolean;
  /**
   * physician, advanced-practice-provider, nurse, pharmacist, other-clinician, non-clinical-staff, patient-or-family or other.
   */
  role?:
    | "physician"
    | "advanced-practice-provider"
    | "nurse"
    | "pharmacist"
    | "other-clinician"
    | "non-clinical-staff"
    | "patient-or-family"
    | "other";
  contact?: Person1;
  /**
   * When the report was made.
   */
  reportedAt?: string;
  /**
   * Whether the reporter asked to hear what came of the report.
   */
  wantsFeedback?: boolean;
}
/**
 * How to reach the reporter. Not allowed when the report is anonymous.
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
 * One notification.
 */
export interface Notification {
  /**
   * patient-or-family, attending-clinician, unit-leadership, risk-management, patient-safety-officer, regulatory-agency, patient-safety-organization, accreditation-body, manufacturer, insurer or other.
   */
  recipient:
    | "patient-or-family"
    | "attending-clinician"
    | "unit-leadership"
    | "risk-management"
    | "patient-safety-officer"
    | "regulatory-agency"
    | "patient-safety-organization"
    | "accreditation-body"
    | "manufacturer"
    | "insurer"
    | "other";
  /**
   * The named agency, body or person, where relevant, for example a state health department.
   */
  recipientName?: string;
  /**
   * When the recipient was notified.
   */
  notifiedAt?: string;
  /**
   * in-person, phone, letter, email, portal or other.
   */
  method?: "in-person" | "phone" | "letter" | "email" | "portal" | "other";
  /**
   * Whether a law, regulation or policy required this notification.
   */
  requiredByRule?: boolean;
  /**
   * The rule that required it, as cited locally.
   */
  ruleReference?: string;
  /**
   * A confirmation or case number from the recipient.
   */
  reference?: string;
}
/**
 * The review of why the event happened and what will change.
 */
export interface Investigation {
  /**
   * root-cause-analysis, apparent-cause-analysis, failure-mode-and-effects-analysis, case-review or none.
   */
  method:
    "root-cause-analysis" | "apparent-cause-analysis" | "failure-mode-and-effects-analysis" | "case-review" | "none";
  lead?: Person2;
  /**
   * When it started.
   */
  startedAt?: string;
  /**
   * When it was completed.
   */
  completedAt?: string;
  /**
   * What the investigation found.
   */
  summary?: string;
  /**
   * The root or apparent causes identified.
   */
  causes?: string[];
  /**
   * Changes to prevent recurrence.
   */
  actions?: CorrectiveAction[];
}
/**
 * Who led the investigation.
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
 * One corrective action.
 */
export interface CorrectiveAction {
  /**
   * What will change.
   */
  action: string;
  /**
   * stronger (for example forcing functions, standardized equipment), intermediate (checklists, redundancy) or weaker (training, new policy), following the action hierarchy widely used in root cause analysis.
   */
  strength?: "stronger" | "intermediate" | "weaker";
  owner?: Person3;
  /**
   * When it is due.
   */
  dueDate?: string;
  /**
   * planned, in-progress, complete or cancelled.
   */
  status: "planned" | "in-progress" | "complete" | "cancelled";
  /**
   * How the organization will know the action worked.
   */
  measure?: string;
}
/**
 * Who is responsible.
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
 * Submission of the report to a patient safety organization, where one is used.
 */
export interface PSOSubmission {
  /**
   * Whether the report was submitted.
   */
  submitted: boolean;
  /**
   * The patient safety organization's name.
   */
  organization?: string;
  /**
   * When it was submitted.
   */
  submittedAt?: string;
  /**
   * The version of the AHRQ Common Formats used for the submission, if any.
   */
  commonFormatsVersion?: string;
}
/**
 * One change of the record's status.
 */
export interface StatusChange {
  /**
   * The status the record moved to. Each format limits this to its own status values.
   */
  status: string;
  /**
   * When it happened.
   */
  at: string;
  by?: Person4;
  /**
   * Why the status changed.
   */
  reason?: string;
}
/**
 * Who made the change.
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
  actor: Person5;
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
export interface Person5 {
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
