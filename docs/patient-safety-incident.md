<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Patient safety incident

A report of one patient safety event: an incident that reached a patient, a near miss that didn't, or an unsafe condition that could lead to either. It holds the event's classification, the harm assessment, contributing factors, immediate actions, notifications, the investigation and its action plan, and any submission to a patient safety organization. The event types, categories and harm levels follow the concepts of the AHRQ Common Formats for Event Reporting – Hospital and the WHO Conceptual Framework for the International Classification for Patient Safety (ICPS), so reports can be mapped to them; the format is not an implementation of either and is not certified by AHRQ or WHO. It carries as little protected health information as it can: there are no fields for patient names, dates of birth, contact details or record numbers. Records are still not de-identified data (event dates, the facility and free text can identify a patient), so treat every record as confidential.

- Schema: [`schemas/patient-safety-incident.schema.json`](../schemas/patient-safety-incident.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/patient-safety-incident.schema.json`
- `recordType`: `patient-safety-incident`, `schemaVersion`: `0.1.0`
- Examples: [`examples/patient-safety-incident/`](../examples/patient-safety-incident/)

## Informed by

- **AHRQ Common Formats for Event Reporting – Hospital** (Agency for Healthcare Research and Quality; current version 2.0, published through the [PSO Privacy Protection Center](https://www.psoppc.org)). From it come the three event types (incident, near miss, unsafe condition), the event categories in `eventCategory`, the harm levels in `harm.level` (the Harm Scale of version 1.2: death, severe, moderate, mild, no harm, unknown) and the patient age bands in `patient.ageBand` (from the version 1.1 patient information form). Definitions in the field descriptions are summaries; the AHRQ documents are authoritative. A record in this format is not a Common Formats submission: a patient safety organization that accepts Common Formats data needs it mapped to that specification's own data elements.
- **WHO Conceptual Framework for the International Classification for Patient Safety (ICPS)**, version 1.1 (2009): incident (no-harm and harmful), near miss and reportable circumstance; degree of harm; contributing factors and hazards; ameliorating actions and actions taken to reduce risk. The ICPS term for each concept is noted in the field descriptions.
- **The action hierarchy** used in root cause analysis (US Department of Veterans Affairs National Center for Patient Safety; RCA², National Patient Safety Foundation, 2015): `investigation.actions[].strength`.

The format is not certified by AHRQ or WHO and is not an implementation of either.

## Privacy by design

Patient safety records describe care given to real people, so the format keeps patient information to what analysis needs:

- The `patient` block allows only an age band, sex and an opaque encounter reference, and it is closed (`additionalProperties: false`), so a name, date of birth, medical record number or address put there is rejected, not stored. Ages are bands, not dates of birth.
- `patient.encounterRef` must be a surrogate key held in a lookup table inside the organization, not the medical record, account or visit number (those are identifiers under HIPAA). With the lookup table it re-identifies the patient, so don't share it outside the organization.
- Fields that can hold personal data or narrative are marked `x-sensitivity` in the schema (`personal` or `free-text`), and in the table below, so export and redaction tools can find them.

That keeps identifiers out of the structured fields. It does not make a record de-identified:

- Event, discovery and report dates, the facility and the location can identify a patient. Under the HIPAA Safe Harbor method (45 CFR 164.514(b)(2)), all elements of dates related to an individual other than the year are identifiers.
- The narrative fields ask reporters not to include identifiers, but a schema can't enforce that. Screen free text before sharing records outside the organization.
- Staff named in the record (the reporter, the harm assessor, the investigation lead, action owners) are personal data too.
- An anonymous report has no `reporter.contact` (the schema enforces that), and the validator checks that the submission entries in `statusHistory` and `auditTrail` don't name the reporter. Systems must keep the reporter out of everything else they record about the report.

Treat every record as confidential. In the US, information prepared for reporting to a patient safety organization may be patient safety work product with privilege and confidentiality protections under the Patient Safety and Quality Improvement Act of 2005; this format records whether a report was submitted to a PSO and does not decide that question.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md). Sensitivity is the schema's `x-sensitivity` annotation: `personal` fields identify or contact a person, and `free-text` fields are narrative that may contain anything, including personal data, so screen them before sharing records. Fields of a linked type inherit that type's sensitivity (every [Person](common.md#person) is personal).

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `$schema` | string (uri) |  |  | The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing. |
| `recordType` | `"patient-safety-incident"` | yes |  | Always patient-safety-incident. Lets a reader (or validate()) tell the format apart from the others in this repository. |
| `schemaVersion` | `"0.1.0"` | yes |  | The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for. |
| `id` | string (identifier) | yes |  | This report's identifier, unique within the system that created it, such as the incident reporting system's event number. Example: `PSI-2026-00871`. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  |  | Ids for this report in other systems: the incident reporting tool, a patient safety organization (PSO) submission, risk management or a state reporting portal. |
| `createdAt` | string (date-time) |  |  | When the record was created in the system that holds it. The report's own time is reporter.reportedAt. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `updatedAt` | string (date-time) |  |  | When the record was last changed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `facility` | object | yes |  | The facility where the event happened. A small facility plus an event date can identify a patient, which is one reason records remain confidential. |
| `facility.id` | string (identifier) |  |  | The facility's id in the system the report comes from. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `facility.name` | string | yes |  | The facility's name. Example: `Riverbend General Hospital`. |
| `facility.type` | enum | yes |  | The kind of facility: hospital; ambulatory-surgery-center; clinic (physician office, outpatient clinic); long-term-care (skilled nursing, nursing home, assisted living); behavioral-health; pharmacy (community or outpatient pharmacy); home-health; emergency-medical-services; or other. The AHRQ Common Formats have separate versions for hospitals, community pharmacies and skilled nursing facilities; this field records the setting either way. |
| `facility.identifiers` | array of [External identifier](common.md#external-identifier) |  |  | Facility identifiers, such as the CMS Certification Number (scheme CCN), a National Provider Identifier (scheme NPI) or a state license number. These identify the facility, not the patient. |
| `facility.jurisdiction` | [Jurisdiction](common.md#jurisdiction) |  |  | Where the facility is licensed and regulated, which decides what must be reported and to whom. |
| `event` | object | yes |  | When and where the event happened and when it was found. The gap between occurredAt and discoveredAt is itself a safety measure (time to detection). |
| `event.occurredAt` | string (date-time) |  |  | When the event happened, with the UTC offset in effect at the facility. Leave out if unknown; set occurredAtPrecision to say how sure the time is. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `event.occurredAtPrecision` | enum |  |  | How exact occurredAt is: exact (observed or recorded at the time), approximate (estimated afterwards, for example an unwitnessed fall) or unknown (occurredAt is a placeholder or left out). |
| `event.discoveredAt` | string (date-time) | yes |  | When staff discovered the event. Required, because every report has a discovery time even when the event time is unknown. Must not be before occurredAt. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `event.location` | object |  |  | Where in the facility the event happened. Keep it to what trending needs: a room number with a date can identify a patient. |
| `event.location.type` | enum |  |  | The kind of area: inpatient-unit, intensive-care, emergency-department, operating-room, procedure-area (endoscopy, cath lab, interventional radiology), labor-and-delivery, outpatient-area, pharmacy, laboratory, imaging, patient-home (for home health), transport (between areas or facilities), common-area (hallways, lobbies, grounds) or other. |
| `event.location.unit` | string |  |  | The unit or department name as the facility uses it. Examples: `4 West Medical`, `Main OR`. |
| `event.location.detail` | string |  | free-text | A more precise place, when it matters to the analysis (for example patient bathroom, medication room). Avoid room or bed numbers in records shared outside the facility. Example: `Patient bathroom`. |
| `eventType` | enum | yes |  | What kind of patient safety event this is, using the three event types of the AHRQ Common Formats. incident: an event that reached the patient, whether or not the patient was harmed (ICPS splits these into no-harm incidents and harmful incidents, or adverse events). near-miss: an event that did not reach the patient, also called a close call (the ICPS near miss). unsafe-condition: any circumstance that increases the probability of a patient safety event, and that does not involve an identifiable patient (the ICPS reportable circumstance). The validator checks reachedPatient, harm and patient agree with the type. |
| `eventCategory` | enum | yes |  | The clinical area of the event, following the event categories of the AHRQ Common Formats for Event Reporting – Hospital: blood-or-blood-product; device-or-medical-supply (AHRQ: Device or Medical/Surgical Supply, including Health Information Technology); fall; healthcare-associated-infection; medication-or-other-substance; perinatal; pressure-injury (Pressure Ulcer in Common Formats versions 1.1 and 1.2); surgery-or-anesthesia (includes invasive procedures); venous-thromboembolism; or other, for events outside these categories (describe them with eventSubcategory). Pick the category the event is about, not every category it touches; use contributingFactors for the rest. |
| `eventSubcategory` | string |  | free-text | A finer classification in the reporting organization's own taxonomy, for trending within the category. Examples: `Wrong dose`, `Unassisted fall while toileting`, `Look-alike packaging`. |
| `description` | string | yes | free-text | What happened, in the reporter's words: the sequence of events, what was found and what was done. Don't include patient names, dates of birth, record numbers, addresses or other direct identifiers; refer to 'the patient'. The schema can't enforce that, so screen this field before sharing a record outside the organization. |
| `patient` | object |  |  | Facts about the patient involved that analysis needs and that can't identify the patient on their own. The object is closed (additionalProperties is false), so names, dates of birth, medical record numbers, addresses and the like are rejected rather than stored. Leave the whole block out for an unsafe condition, which by definition involves no identifiable patient. |
| `patient.ageBand` | enum |  |  | The patient's age at the time of the event, as a band rather than a date of birth (a date of birth is a direct identifier). The bands are those of the AHRQ Common Formats (version 1.1) patient information form: neonate (0 to 28 days), infant (more than 28 days and under 1 year), child (1 to 12 years), adolescent (13 to 17), adult-18-64, adult-65-74, adult-75-84, adult-85-plus, or unknown. |
| `patient.sex` | enum |  |  | The patient's sex as recorded in the source system: female, male, other, or unknown (not recorded or not disclosed). |
| `patient.encounterRef` | string |  | personal | An opaque key that lets authorized staff find the encounter in the source system. It must be a surrogate (a random token kept in a lookup table that stays inside the organization), not the medical record number, account number or visit number, because those are direct identifiers under HIPAA. With the lookup table, this key re-identifies the patient, so don't share it outside the organization. Example: `enc-7f3c91`. |
| `reachedPatient` | boolean |  |  | Whether the event reached the patient. true for an incident, false for a near miss; leave out for an unsafe condition. Recording it separately from eventType lets the validator catch a misclassified report. |
| `harm` | object |  |  | The assessed harm to the patient, for events that reached the patient (incidents) only. The levels follow the AHRQ Common Formats Harm Scale (version 1.2): harm remaining after the event was discovered and any attempts to reduce its consequences, assessed at a stated time. Near misses and unsafe conditions have no harm block; the validator checks this. |
| `harm.level` | enum | yes |  | death: the patient died, and the event caused or brought forward the death. severe-harm: bodily or psychological injury, including pain or disfigurement, that interferes significantly with functional ability or quality of life. moderate-harm: bodily or psychological injury that adversely affects functional ability or quality of life, but not at the level of severe harm. mild-harm: minimal symptoms or loss of function, or injury limited to additional treatment, monitoring or a longer stay. no-harm: the event reached the patient, but no harm was evident. unknown: harm can't be assessed yet; update the record when it can. |
| `harm.duration` | enum |  |  | For mild, moderate or severe harm, whether it is expected to be permanent (lifelong) or temporary, at the time of assessment; unknown when the prognosis isn't clear yet. |
| `harm.additionalTreatment` | boolean |  |  | Whether the patient needed additional treatment, monitoring or a longer stay because of the event. Recorded separately because it drives cost and is often known before the final harm level. |
| `harm.assessedAt` | string (date-time) |  |  | When harm was assessed. The harm level is a prognosis at this time and can change; reassess and update the record (the audit trail keeps the earlier value). Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `harm.assessedBy` | [Person](common.md#person) |  | personal | Who assessed harm, usually a clinician or the patient safety officer. |
| `contributingFactors` | array of object |  |  | Circumstances that contributed to the event, as many as apply. This list is this format's own, chosen for the factors safety teams most often trend; it maps onto the WHO ICPS contributing factor groups (staff, patient, work environment, organizational and service, external) but is not either framework's list. |
| `contributingFactors[].category` | enum | yes |  | communication (between staff, or with the patient or family); handoff (transfer of care or information between people or units); staffing (numbers or skill mix); training (knowledge or competence); policy-or-procedure (missing, unclear or not followed); equipment-or-device (failure, design or use); environment (layout, lighting, noise, clutter); patient-factors (condition, behavior, language, adherence); task-factors (complexity, interruptions, time pressure); team-factors (supervision, roles, teamwork); organizational-culture (reporting culture, normalized deviance, priorities); labeling-or-packaging (look-alike or sound-alike products, unclear labels); information-system (EHR, order entry or other IT design or failure); other. |
| `contributingFactors[].detail` | string |  | free-text | How this factor contributed, specifically enough that someone could act on it. |
| `immediateActions` | array of object |  |  | What was done straight away to care for the patient and make the situation safe, before any investigation. Corrective actions to prevent recurrence go in investigation.actions. |
| `immediateActions[].action` | string | yes | free-text | What was done. |
| `immediateActions[].takenAt` | string (date-time) |  |  | When the action was taken. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `immediateActions[].takenByRole` | string |  |  | The role of the person who acted, rather than their name: roles are what analysis needs, and names of staff in safety reports are sensitive. Examples: `Charge nurse`, `Pharmacist`. |
| `reporter` | object | yes |  | Who reported the event. Reporting systems commonly allow anonymous reports, because people report more when they can't be blamed. An anonymous report has no contact details (the schema rejects them), and the validator also checks that the submission entries in statusHistory and auditTrail don't name the reporter. Even then, role plus unit can identify someone on a small team; systems should consider that before showing role to wide audiences. |
| `reporter.anonymous` | boolean | yes |  | Whether the reporter chose to stay anonymous. When true, contact must be left out. |
| `reporter.role` | enum |  |  | The reporter's role: physician; advanced-practice-provider (nurse practitioner, physician assistant, nurse anesthetist, nurse midwife); nurse; pharmacist; other-clinician (therapist, technologist, other licensed clinical staff); non-clinical-staff; patient-or-family; or other. |
| `reporter.contact` | [Person](common.md#person) |  | personal | How to reach the reporter for follow-up questions or feedback. Not allowed when the report is anonymous. |
| `reporter.reportedAt` | string (date-time) |  |  | When the report was made. Must not be before event.discoveredAt. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `reporter.wantsFeedback` | boolean |  |  | Whether the reporter asked to hear what came of the report. Closing the loop with reporters is a mark of a working reporting culture, so systems should track it. |
| `notifications` | array of object |  |  | Who was told about the event, when and how: the patient or family (disclosure), clinicians and leaders, and outside bodies such as a state agency, an accreditor, a patient safety organization or a device manufacturer. Recording whether a rule required each notification makes missed or late mandatory reports visible. |
| `notifications[].recipient` | enum | yes |  | Who was notified: patient-or-family; attending-clinician; unit-leadership; risk-management; patient-safety-officer; regulatory-agency (for example a state health department); patient-safety-organization (a PSO); accreditation-body; manufacturer (for example under a device reporting program); insurer; or other. |
| `notifications[].recipientName` | string |  |  | The named agency or body, where it matters which one. For patient-or-family, leave this out rather than naming the person. Examples: `State Department of Health`, `Example Patient Safety Organization`. |
| `notifications[].notifiedAt` | string (date-time) |  |  | When the recipient was notified. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `notifications[].method` | enum |  |  | How: in-person, phone, letter, email, portal (a reporting portal or patient portal) or other. |
| `notifications[].requiredByRule` | boolean |  |  | Whether a law, regulation, accreditation standard or internal policy required this notification. |
| `notifications[].ruleReference` | string |  |  | The rule that required it, as cited locally. Example: `Hospital disclosure policy PS-12`. |
| `notifications[].reference` | string |  |  | A confirmation, case or report number the recipient gave. |
| `investigation` | object |  |  | The review of why the event happened and what will change. Many organizations investigate only some events (for example by harm level); leave this out until an investigation starts. |
| `investigation.method` | enum | yes |  | How the event was analyzed: root-cause-analysis (a full systems analysis, as used for sentinel events); apparent-cause-analysis (a more limited review, usually for lower-harm events); failure-mode-and-effects-analysis (a prospective analysis of a process, sometimes triggered by an event); case-review (peer or clinical case review); or none (reviewed and closed without a formal analysis). |
| `investigation.lead` | [Person](common.md#person) |  | personal | Who led the investigation. |
| `investigation.startedAt` | string (date-time) |  |  | When the investigation started. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `investigation.completedAt` | string (date-time) |  |  | When the investigation was completed. Must not be before startedAt. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `investigation.summary` | string |  | free-text | What the investigation found, in a few paragraphs. |
| `investigation.causes` | array of string |  |  | The root or apparent causes identified, one per entry, written as system causes rather than individual blame. |
| `investigation.actions` | array of object |  |  | The action plan: changes to prevent recurrence, each with its strength, owner, due date and measure. |
| `investigation.actions[].action` | string | yes | free-text | What will change. |
| `investigation.actions[].strength` | enum |  |  | How strong the action is, on the action hierarchy used in root cause analysis (developed by the US Department of Veterans Affairs National Center for Patient Safety and used in RCA²): stronger actions change the system so the error is hard to make (forcing functions, standardized equipment, removing hazards); intermediate actions make errors less likely or easier to catch (checklists, redundancy, software enhancements); weaker actions rely on people remembering (training, new policy, warnings). Action plans made only of weaker actions rarely prevent recurrence. |
| `investigation.actions[].owner` | [Person](common.md#person) |  | personal | Who is responsible for completing the action. |
| `investigation.actions[].dueDate` | string (date) |  |  | When the action is due. Example: `2026-03-04`. |
| `investigation.actions[].status` | enum | yes |  | planned, in-progress, complete or cancelled (with the reason in the audit trail). |
| `investigation.actions[].measure` | string |  | free-text | How the organization will know the action worked: a measurable check, not 'staff educated'. Example: `Monthly audit of 20 beds finds no alarms below minimum volume.`. |
| `psoSubmission` | object |  |  | Submission of the report to a patient safety organization (PSO), where the organization works with one. In the US, information reported to a PSO can be patient safety work product with privilege and confidentiality protections under the Patient Safety and Quality Improvement Act; this field records the submission and doesn't decide that question. |
| `psoSubmission.submitted` | boolean | yes |  | Whether the report was submitted to the PSO. |
| `psoSubmission.organization` | string |  |  | The patient safety organization's name. |
| `psoSubmission.submittedAt` | string (date-time) |  |  | When it was submitted. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `psoSubmission.commonFormatsVersion` | string |  |  | The version of the AHRQ Common Formats the submission used, as the PSO names it. Examples: `Hospital 2.0`, `Hospital 1.2`. |
| `status` | enum | yes |  | Where the report is in its review: submitted (received, not yet looked at); triaged (classified and assigned); under-investigation; action-plan (investigation done, corrective actions in progress); closed; or not-a-safety-event (reviewed and found not to be a patient safety event, for example a pure facilities issue). |
| `statusHistory` | array of [Status change](common.md#status-change) |  |  | Every status the report has had, oldest first, ending at the current status (the validator checks both). For an anonymous report, leave by out of the submission entry. |
| `attachments` | array of [Attachment](common.md#attachment) |  |  | Files that belong to the report, such as an investigation report or a photograph of a device. Keep identifiable clinical documents in the clinical record, not here. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  |  | Recorded actions on the report, oldest first. For an anonymous report, don't record the reporter as the actor who created or submitted it. |
| `extensions` | [Extensions](common.md#extensions) |  |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;. Don't use extensions to add patient identifiers the format deliberately leaves out. |

## Conditional requirements

- In `reporter`, when `anonymous` is `true`, `contact` must be left out.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Attachments have unique ids. |
| `dates-in-order` | updatedAt is not before createdAt; the report is not dated before the event was discovered; the investigation was not completed before it started. |
| `history-in-order` | statusHistory and auditTrail are oldest first. |
| `history-ends-at-status` | The last entry in statusHistory has the record's current status. |
| `occurred-before-discovered` | The event did not occur after it was discovered. |
| `near-miss-did-not-reach` | A near miss did not reach the patient (reachedPatient is not true). |
| `incident-reached-patient` | An incident reached the patient (reachedPatient is not false); events that did not are near misses. |
| `harm-only-if-reached` | Only an event that reached the patient has a harm assessment: near misses, unsafe conditions and events with reachedPatient false have no harm block. |
| `unsafe-condition-no-patient` | An unsafe condition involves no identifiable patient: reachedPatient is not true and there is no patient block. |
| `anonymous-not-named` | For an anonymous report, the first statusHistory entry has no by, and no auditTrail entry records who created or submitted it. |
