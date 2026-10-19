/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * A report of one patient safety event: an incident that reached a patient, a near miss that didn't, or an unsafe condition that could lead to either. It holds the event's classification, the harm assessment, contributing factors, immediate actions, notifications, the investigation and its action plan, and any submission to a patient safety organization. The event types, categories and harm levels follow the concepts of the AHRQ Common Formats for Event Reporting – Hospital and the WHO Conceptual Framework for the International Classification for Patient Safety (ICPS), so reports can be mapped to them; the format is not an implementation of either and is not certified by AHRQ or WHO. It carries as little protected health information as it can: there are no fields for patient names, dates of birth, contact details or record numbers. Records are still not de-identified data (event dates, the facility and free text can identify a patient), so treat every record as confidential.
 */
export interface PatientSafetyIncident {
  /**
   * The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing.
   */
  $schema?: string;
  /**
   * Always patient-safety-incident. Lets a reader (or validate()) tell the format apart from the others in this repository.
   */
  recordType: "patient-safety-incident";
  /**
   * The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for.
   */
  schemaVersion: "0.1.0";
  /**
   * This report's identifier, unique within the system that created it, such as the incident reporting system's event number.
   */
  id: string;
  /**
   * Ids for this report in other systems: the incident reporting tool, a patient safety organization (PSO) submission, risk management or a state reporting portal.
   */
  externalIds?: ExternalIdentifier[];
  /**
   * When the record was created in the system that holds it. The report's own time is reporter.reportedAt.
   */
  createdAt?: string;
  /**
   * When the record was last changed.
   */
  updatedAt?: string;
  facility: Facility;
  event: Event;
  /**
   * What kind of patient safety event this is, using the three event types of the AHRQ Common Formats. incident: an event that reached the patient, whether or not the patient was harmed (ICPS splits these into no-harm incidents and harmful incidents, or adverse events). near-miss: an event that did not reach the patient, also called a close call (the ICPS near miss). unsafe-condition: any circumstance that increases the probability of a patient safety event, and that does not involve an identifiable patient (the ICPS reportable circumstance). The validator checks reachedPatient, harm and patient agree with the type.
   */
  eventType: "incident" | "near-miss" | "unsafe-condition";
  /**
   * The clinical area of the event, following the event categories of the AHRQ Common Formats for Event Reporting – Hospital: blood-or-blood-product; device-or-medical-supply (AHRQ: Device or Medical/Surgical Supply, including Health Information Technology); fall; healthcare-associated-infection; medication-or-other-substance; perinatal; pressure-injury (Pressure Ulcer in Common Formats versions 1.1 and 1.2); surgery-or-anesthesia (includes invasive procedures); venous-thromboembolism; or other, for events outside these categories (describe them with eventSubcategory). Pick the category the event is about, not every category it touches; use contributingFactors for the rest.
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
   * A finer classification in the reporting organization's own taxonomy, for trending within the category.
   */
  eventSubcategory?: string;
  /**
   * What happened, in the reporter's words: the sequence of events, what was found and what was done. Don't include patient names, dates of birth, record numbers, addresses or other direct identifiers; refer to 'the patient'. The schema can't enforce that, so screen this field before sharing a record outside the organization.
   */
  description: string;
  patient?: Patient;
  /**
   * Whether the event reached the patient. true for an incident, false for a near miss; leave out for an unsafe condition. Recording it separately from eventType lets the validator catch a misclassified report.
   */
  reachedPatient?: boolean;
  harm?: Harm;
  /**
   * Circumstances that contributed to the event, as many as apply. This list is this format's own, chosen for the factors safety teams most often trend; it maps onto the WHO ICPS contributing factor groups (staff, patient, work environment, organizational and service, external) but is not either framework's list.
   */
  contributingFactors?: ContributingFactor[];
  /**
   * What was done straight away to care for the patient and make the situation safe, before any investigation. Corrective actions to prevent recurrence go in investigation.actions.
   */
  immediateActions?: ImmediateAction[];
  reporter: Reporter;
  /**
   * Who was told about the event, when and how: the patient or family (disclosure), clinicians and leaders, and outside bodies such as a state agency, an accreditor, a patient safety organization or a device manufacturer. Recording whether a rule required each notification makes missed or late mandatory reports visible.
   */
  notifications?: Notification[];
  investigation?: Investigation;
  psoSubmission?: PSOSubmission;
  /**
   * Where the report is in its review: submitted (received, not yet looked at); triaged (classified and assigned); under-investigation; action-plan (investigation done, corrective actions in progress); closed; or not-a-safety-event (reviewed and found not to be a patient safety event, for example a pure facilities issue).
   */
  status: "submitted" | "triaged" | "under-investigation" | "action-plan" | "closed" | "not-a-safety-event";
  /**
   * Every status the report has had, oldest first, ending at the current status (the validator checks both). For an anonymous report, leave by out of the submission entry.
   */
  statusHistory?: (StatusChange & {
    /**
     * The status the record moved to, one of this format's status values.
     */
    status?: "submitted" | "triaged" | "under-investigation" | "action-plan" | "closed" | "not-a-safety-event";
  })[];
  /**
   * Files that belong to the report, such as an investigation report or a photograph of a device. Keep identifiable clinical documents in the clinical record, not here.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the report, oldest first. For an anonymous report, don't record the reporter as the actor who created or submitted it.
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
 * The facility where the event happened. A small facility plus an event date can identify a patient, which is one reason records remain confidential.
 */
export interface Facility {
  /**
   * The facility's id in the system the report comes from.
   */
  id?: string;
  /**
   * The facility's name.
   */
  name: string;
  /**
   * The kind of facility: hospital; ambulatory-surgery-center; clinic (physician office, outpatient clinic); long-term-care (skilled nursing, nursing home, assisted living); behavioral-health; pharmacy (community or outpatient pharmacy); home-health; emergency-medical-services; or other. The AHRQ Common Formats have separate versions for hospitals, community pharmacies and skilled nursing facilities; this field records the setting either way.
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
   * Facility identifiers, such as the CMS Certification Number (scheme CCN), a National Provider Identifier (scheme NPI) or a state license number. These identify the facility, not the patient.
   */
  identifiers?: ExternalIdentifier[];
  jurisdiction?: Jurisdiction;
}
/**
 * Where the facility is licensed and regulated, which decides what must be reported and to whom.
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
 * When and where the event happened and when it was found. The gap between occurredAt and discoveredAt is itself a safety measure (time to detection).
 */
export interface Event {
  /**
   * When the event happened, with the UTC offset in effect at the facility. Leave out if unknown; set occurredAtPrecision to say how sure the time is.
   */
  occurredAt?: string;
  /**
   * How exact occurredAt is: exact (observed or recorded at the time), approximate (estimated afterwards, for example an unwitnessed fall) or unknown (occurredAt is a placeholder or left out).
   */
  occurredAtPrecision?: "exact" | "approximate" | "unknown";
  /**
   * When staff discovered the event. Required, because every report has a discovery time even when the event time is unknown. Must not be before occurredAt.
   */
  discoveredAt: string;
  location?: Location;
}
/**
 * Where in the facility the event happened. Keep it to what trending needs: a room number with a date can identify a patient.
 */
export interface Location {
  /**
   * The kind of area: inpatient-unit, intensive-care, emergency-department, operating-room, procedure-area (endoscopy, cath lab, interventional radiology), labor-and-delivery, outpatient-area, pharmacy, laboratory, imaging, patient-home (for home health), transport (between areas or facilities), common-area (hallways, lobbies, grounds) or other.
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
   * The unit or department name as the facility uses it.
   */
  unit?: string;
  /**
   * A more precise place, when it matters to the analysis (for example patient bathroom, medication room). Avoid room or bed numbers in records shared outside the facility.
   */
  detail?: string;
}
/**
 * Facts about the patient involved that analysis needs and that can't identify the patient on their own. The object is closed (additionalProperties is false), so names, dates of birth, medical record numbers, addresses and the like are rejected rather than stored. Leave the whole block out for an unsafe condition, which by definition involves no identifiable patient.
 */
export interface Patient {
  /**
   * The patient's age at the time of the event, as a band rather than a date of birth (a date of birth is a direct identifier). The bands are those of the AHRQ Common Formats (version 1.1) patient information form: neonate (0 to 28 days), infant (more than 28 days and under 1 year), child (1 to 12 years), adolescent (13 to 17), adult-18-64, adult-65-74, adult-75-84, adult-85-plus, or unknown.
   */
  ageBand?:
    | "neonate"
    | "infant"
    | "child"
    | "adolescent"
    | "adult-18-64"
    | "adult-65-74"
    | "adult-75-84"
    | "adult-85-plus"
    | "unknown";
  /**
   * The patient's sex as recorded in the source system: female, male, other, or unknown (not recorded or not disclosed).
   */
  sex?: "female" | "male" | "other" | "unknown";
  /**
   * An opaque key that lets authorized staff find the encounter in the source system. It must be a surrogate (a random token kept in a lookup table that stays inside the organization), not the medical record number, account number or visit number, because those are direct identifiers under HIPAA. With the lookup table, this key re-identifies the patient, so don't share it outside the organization.
   */
  encounterRef?: string;
}
/**
 * The assessed harm to the patient, for events that reached the patient (incidents) only. The levels follow the AHRQ Common Formats Harm Scale (version 1.2): harm remaining after the event was discovered and any attempts to reduce its consequences, assessed at a stated time. Near misses and unsafe conditions have no harm block; the validator checks this.
 */
export interface Harm {
  /**
   * death: the patient died, and the event caused or brought forward the death. severe-harm: bodily or psychological injury, including pain or disfigurement, that interferes significantly with functional ability or quality of life. moderate-harm: bodily or psychological injury that adversely affects functional ability or quality of life, but not at the level of severe harm. mild-harm: minimal symptoms or loss of function, or injury limited to additional treatment, monitoring or a longer stay. no-harm: the event reached the patient, but no harm was evident. unknown: harm can't be assessed yet; update the record when it can.
   */
  level: "death" | "severe-harm" | "moderate-harm" | "mild-harm" | "no-harm" | "unknown";
  /**
   * For mild, moderate or severe harm, whether it is expected to be permanent (lifelong) or temporary, at the time of assessment; unknown when the prognosis isn't clear yet.
   */
  duration?: "permanent" | "temporary" | "unknown";
  /**
   * Whether the patient needed additional treatment, monitoring or a longer stay because of the event. Recorded separately because it drives cost and is often known before the final harm level.
   */
  additionalTreatment?: boolean;
  /**
   * When harm was assessed. The harm level is a prognosis at this time and can change; reassess and update the record (the audit trail keeps the earlier value).
   */
  assessedAt?: string;
  assessedBy?: Person;
}
/**
 * Who assessed harm, usually a clinician or the patient safety officer.
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
 * One contributing factor and how it contributed.
 */
export interface ContributingFactor {
  /**
   * communication (between staff, or with the patient or family); handoff (transfer of care or information between people or units); staffing (numbers or skill mix); training (knowledge or competence); policy-or-procedure (missing, unclear or not followed); equipment-or-device (failure, design or use); environment (layout, lighting, noise, clutter); patient-factors (condition, behavior, language, adherence); task-factors (complexity, interruptions, time pressure); team-factors (supervision, roles, teamwork); organizational-culture (reporting culture, normalized deviance, priorities); labeling-or-packaging (look-alike or sound-alike products, unclear labels); information-system (EHR, order entry or other IT design or failure); other.
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
   * How this factor contributed, specifically enough that someone could act on it.
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
   * The role of the person who acted, rather than their name: roles are what analysis needs, and names of staff in safety reports are sensitive.
   */
  takenByRole?: string;
}
/**
 * Who reported the event. Reporting systems commonly allow anonymous reports, because people report more when they can't be blamed. An anonymous report has no contact details (the schema rejects them), and the validator also checks that the submission entries in statusHistory and auditTrail don't name the reporter. Even then, role plus unit can identify someone on a small team; systems should consider that before showing role to wide audiences.
 */
export interface Reporter {
  /**
   * Whether the reporter chose to stay anonymous. When true, contact must be left out.
   */
  anonymous: boolean;
  /**
   * The reporter's role: physician; advanced-practice-provider (nurse practitioner, physician assistant, nurse anesthetist, nurse midwife); nurse; pharmacist; other-clinician (therapist, technologist, other licensed clinical staff); non-clinical-staff; patient-or-family; or other.
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
   * When the report was made. Must not be before event.discoveredAt.
   */
  reportedAt?: string;
  /**
   * Whether the reporter asked to hear what came of the report. Closing the loop with reporters is a mark of a working reporting culture, so systems should track it.
   */
  wantsFeedback?: boolean;
}
/**
 * How to reach the reporter for follow-up questions or feedback. Not allowed when the report is anonymous.
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
 * One notification.
 */
export interface Notification {
  /**
   * Who was notified: patient-or-family; attending-clinician; unit-leadership; risk-management; patient-safety-officer; regulatory-agency (for example a state health department); patient-safety-organization (a PSO); accreditation-body; manufacturer (for example under a device reporting program); insurer; or other.
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
   * The named agency or body, where it matters which one. For patient-or-family, leave this out rather than naming the person.
   */
  recipientName?: string;
  /**
   * When the recipient was notified.
   */
  notifiedAt?: string;
  /**
   * How: in-person, phone, letter, email, portal (a reporting portal or patient portal) or other.
   */
  method?: "in-person" | "phone" | "letter" | "email" | "portal" | "other";
  /**
   * Whether a law, regulation, accreditation standard or internal policy required this notification.
   */
  requiredByRule?: boolean;
  /**
   * The rule that required it, as cited locally.
   */
  ruleReference?: string;
  /**
   * A confirmation, case or report number the recipient gave.
   */
  reference?: string;
}
/**
 * The review of why the event happened and what will change. Many organizations investigate only some events (for example by harm level); leave this out until an investigation starts.
 */
export interface Investigation {
  /**
   * How the event was analyzed: root-cause-analysis (a full systems analysis, as used for sentinel events); apparent-cause-analysis (a more limited review, usually for lower-harm events); failure-mode-and-effects-analysis (a prospective analysis of a process, sometimes triggered by an event); case-review (peer or clinical case review); or none (reviewed and closed without a formal analysis).
   */
  method:
    "root-cause-analysis" | "apparent-cause-analysis" | "failure-mode-and-effects-analysis" | "case-review" | "none";
  lead?: Person2;
  /**
   * When the investigation started.
   */
  startedAt?: string;
  /**
   * When the investigation was completed. Must not be before startedAt.
   */
  completedAt?: string;
  /**
   * What the investigation found, in a few paragraphs.
   */
  summary?: string;
  /**
   * The root or apparent causes identified, one per entry, written as system causes rather than individual blame.
   *
   * Items: One cause.
   */
  causes?: string[];
  /**
   * The action plan: changes to prevent recurrence, each with its strength, owner, due date and measure.
   */
  actions?: CorrectiveAction[];
}
/**
 * Who led the investigation.
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
 * One corrective action.
 */
export interface CorrectiveAction {
  /**
   * What will change.
   */
  action: string;
  /**
   * How strong the action is, on the action hierarchy used in root cause analysis (developed by the US Department of Veterans Affairs National Center for Patient Safety and used in RCA²): stronger actions change the system so the error is hard to make (forcing functions, standardized equipment, removing hazards); intermediate actions make errors less likely or easier to catch (checklists, redundancy, software enhancements); weaker actions rely on people remembering (training, new policy, warnings). Action plans made only of weaker actions rarely prevent recurrence.
   */
  strength?: "stronger" | "intermediate" | "weaker";
  owner?: Person3;
  /**
   * When the action is due.
   */
  dueDate?: string;
  /**
   * planned, in-progress, complete or cancelled (with the reason in the audit trail).
   */
  status: "planned" | "in-progress" | "complete" | "cancelled";
  /**
   * How the organization will know the action worked: a measurable check, not 'staff educated'.
   */
  measure?: string;
}
/**
 * Who is responsible for completing the action.
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
 * Submission of the report to a patient safety organization (PSO), where the organization works with one. In the US, information reported to a PSO can be patient safety work product with privilege and confidentiality protections under the Patient Safety and Quality Improvement Act; this field records the submission and doesn't decide that question.
 */
export interface PSOSubmission {
  /**
   * Whether the report was submitted to the PSO.
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
   * The version of the AHRQ Common Formats the submission used, as the PSO names it.
   */
  commonFormatsVersion?: string;
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
 * Local fields this format doesn't define, namespaced as <namespace>:<field>. Don't use extensions to add patient identifiers the format deliberately leaves out.
 */
export interface Extensions {}
