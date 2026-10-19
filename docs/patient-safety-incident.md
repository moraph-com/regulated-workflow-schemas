<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Patient safety incident

A report of a patient safety event (an incident that reached the patient, a near miss or an unsafe condition), with its harm assessment, contributing factors, immediate actions, notifications and investigation. Informed by the AHRQ Common Formats for Event Reporting and the WHO Conceptual Framework for the International Classification for Patient Safety (ICPS). Designed to carry as little protected health information as possible: there are no fields for patient names, dates of birth or medical record numbers, only an opaque reference into the source system. Records are still not de-identified data: event dates and the facility can identify a patient, and free text can hold anything, so treat them as confidential.

- Schema: [`schemas/patient-safety-incident.schema.json`](../schemas/patient-safety-incident.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/patient-safety-incident.schema.json`
- `recordType`: `patient-safety-incident`, `schemaVersion`: `0.1.0`
- Examples: [`examples/patient-safety-incident/`](../examples/patient-safety-incident/)

## Informed by

- AHRQ Common Formats for Event Reporting (Hospital): the event types (incident, near miss, unsafe condition), the event categories and the harm scale concepts.
- WHO Conceptual Framework for the International Classification for Patient Safety (ICPS): incident type, patient outcome (harm), contributing factors, and actions taken to mitigate harm and reduce risk.
- The hierarchy of actions widely used in root cause analysis (stronger, intermediate, weaker): `investigation.actions[].strength`.

## Privacy by design

The `patient` block allows only an age band, sex and an opaque encounter reference: no names, dates of birth or record numbers, because `additionalProperties` is false there.

That keeps identifiers out of the structured fields; it does not make a record de-identified:

- Event, discovery and report dates, the facility and the location can identify a patient. Under the HIPAA Safe Harbor method, dates related to an individual (other than the year) are identifiers.
- The narrative fields ask reporters not to include identifiers, but a schema can't enforce that. Screen free text before sharing records outside the organization.
- An anonymous report has no `reporter.contact` (the schema enforces that), but `statusHistory[].by` and `auditTrail[].actor` can still name whoever submitted it. Systems that offer anonymous reporting should not record the reporter there.

Treat records as confidential. In the US, reports prepared for a patient safety organization may be patient safety work product with legal protections; this format does not decide that question.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | string (uri) |  | The $id of this schema, so readers can tell what the record is. |
| `recordType` | `"patient-safety-incident"` | yes | Always patient-safety-incident. |
| `schemaVersion` | `"0.1.0"` | yes | The version of this format the record follows. |
| `id` | string (identifier) | yes | This report's identifier, unique within the system that created it. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  | Ids for this report in other systems (incident reporting tool, PSO submission, risk management). |
| `createdAt` | string (date-time) |  | When the record was created. |
| `updatedAt` | string (date-time) |  | When the record was last changed. |
| `facility` | object | yes | Where the event happened. |
| `facility.id` | string (identifier) |  | Identifier for this item, unique within the record. |
| `facility.name` | string | yes | The facility's name. |
| `facility.type` | enum | yes | hospital, ambulatory-surgery-center, clinic, long-term-care, behavioral-health, pharmacy, home-health, emergency-medical-services or other. |
| `facility.identifiers` | array of [External identifier](common.md#external-identifier) |  | Facility identifiers such as a CMS Certification Number or a national provider id. |
| `facility.jurisdiction` | [Jurisdiction](common.md#jurisdiction) |  | Where the facility is regulated. |
| `event` | object | yes | When and where the event happened. |
| `event.occurredAt` | string (date-time) |  | When the event happened. |
| `event.occurredAtPrecision` | enum |  | exact, approximate or unknown. Use approximate when the time was estimated after the fact. |
| `event.discoveredAt` | string (date-time) | yes | When the event was discovered. |
| `event.location` | object |  | Where in the facility the event happened. |
| `event.location.type` | enum |  | inpatient-unit, intensive-care, emergency-department, operating-room, procedure-area, labor-and-delivery, outpatient-area, pharmacy, laboratory, imaging, patient-home, transport, common-area or other. |
| `event.location.unit` | string |  | The unit or department name, for example 4 West Medical. |
| `event.location.detail` | string |  | More precise location, for example bathroom of room 12. |
| `eventType` | enum | yes | incident (reached the patient, whether or not it caused harm), near-miss (did not reach the patient) or unsafe-condition (a circumstance that increases the chance of an event). These follow the AHRQ Common Formats event types. |
| `eventCategory` | enum | yes | The clinical area of the event, following the AHRQ Common Formats event-specific categories: blood-or-blood-product, device-or-medical-supply, fall, healthcare-associated-infection, medication-or-other-substance, perinatal, pressure-injury, surgery-or-anesthesia, venous-thromboembolism, or other. |
| `eventSubcategory` | string |  | A finer classification in the reporting organization's own terms, for example wrong dose. |
| `description` | string | yes | What happened, in the reporter's words. Do not include patient names, dates of birth, record numbers or other direct identifiers. |
| `patient` | object |  | De-identified facts about the patient involved, when the event involved one. Holds no direct identifiers by design. |
| `patient.ageBand` | enum |  | neonate (0-28 days), infant (29 days to 1 year), child (1-12), adolescent (13-17), adult-18-44, adult-45-64, adult-65-84, adult-85-plus or unknown. |
| `patient.sex` | enum |  | female, male, other or unknown. |
| `patient.encounterRef` | string |  | An opaque key that lets authorized staff find the encounter in the source system. Not a medical record number. |
| `reachedPatient` | boolean |  | Whether the event reached the patient. |
| `harm` | object |  | The assessed harm to the patient, using the concepts of the AHRQ Common Formats Harm Scale. |
| `harm.level` | enum | yes | death, severe-harm, moderate-harm, mild-harm, no-harm or unknown. |
| `harm.duration` | enum |  | permanent, temporary or unknown. |
| `harm.additionalTreatment` | boolean |  | Whether the patient needed treatment because of the event. |
| `harm.assessedAt` | string (date-time) |  | When harm was assessed. |
| `harm.assessedBy` | [Person](common.md#person) |  | Who assessed harm. |
| `contributingFactors` | array of object |  | Circumstances that contributed to the event. |
| `contributingFactors[].category` | enum | yes | communication, handoff, staffing, training, policy-or-procedure, equipment-or-device, environment, patient-factors, task-factors, team-factors, organizational-culture, labeling-or-packaging, information-system or other. |
| `contributingFactors[].detail` | string |  | How the factor contributed. |
| `immediateActions` | array of object |  | What was done straight away to care for the patient and make the situation safe. |
| `immediateActions[].action` | string | yes | What was done. |
| `immediateActions[].takenAt` | string (date-time) |  | When the action was taken. |
| `immediateActions[].takenByRole` | string |  | The role of the person who acted, for example charge nurse. |
| `reporter` | object | yes | Who reported the event. Reports may be anonymous; an anonymous report carries no contact details, and systems should also keep the reporter's name out of statusHistory and auditTrail. |
| `reporter.anonymous` | boolean | yes | Whether the reporter chose to stay anonymous. |
| `reporter.role` | enum |  | physician, advanced-practice-provider, nurse, pharmacist, other-clinician, non-clinical-staff, patient-or-family or other. |
| `reporter.contact` | [Person](common.md#person) |  | How to reach the reporter. Not allowed when the report is anonymous. |
| `reporter.reportedAt` | string (date-time) |  | When the report was made. |
| `reporter.wantsFeedback` | boolean |  | Whether the reporter asked to hear what came of the report. |
| `notifications` | array of object |  | Who was told about the event, when and how. |
| `notifications[].recipient` | enum | yes | patient-or-family, attending-clinician, unit-leadership, risk-management, patient-safety-officer, regulatory-agency, patient-safety-organization, accreditation-body, manufacturer, insurer or other. |
| `notifications[].recipientName` | string |  | The named agency, body or person, where relevant, for example a state health department. |
| `notifications[].notifiedAt` | string (date-time) |  | When the recipient was notified. |
| `notifications[].method` | enum |  | in-person, phone, letter, email, portal or other. |
| `notifications[].requiredByRule` | boolean |  | Whether a law, regulation or policy required this notification. |
| `notifications[].ruleReference` | string |  | The rule that required it, as cited locally. |
| `notifications[].reference` | string |  | A confirmation or case number from the recipient. |
| `investigation` | object |  | The review of why the event happened and what will change. |
| `investigation.method` | enum | yes | root-cause-analysis, apparent-cause-analysis, failure-mode-and-effects-analysis, case-review or none. |
| `investigation.lead` | [Person](common.md#person) |  | Who led the investigation. |
| `investigation.startedAt` | string (date-time) |  | When it started. |
| `investigation.completedAt` | string (date-time) |  | When it was completed. |
| `investigation.summary` | string |  | What the investigation found. |
| `investigation.causes` | array of string |  | The root or apparent causes identified. |
| `investigation.actions` | array of object |  | Changes to prevent recurrence. |
| `investigation.actions[].action` | string | yes | What will change. |
| `investigation.actions[].strength` | enum |  | stronger (for example forcing functions, standardized equipment), intermediate (checklists, redundancy) or weaker (training, new policy), following the action hierarchy widely used in root cause analysis. |
| `investigation.actions[].owner` | [Person](common.md#person) |  | Who is responsible. |
| `investigation.actions[].dueDate` | string (date) |  | When it is due. |
| `investigation.actions[].status` | enum | yes | planned, in-progress, complete or cancelled. |
| `investigation.actions[].measure` | string |  | How the organization will know the action worked. |
| `psoSubmission` | object |  | Submission of the report to a patient safety organization, where one is used. |
| `psoSubmission.submitted` | boolean | yes | Whether the report was submitted. |
| `psoSubmission.organization` | string |  | The patient safety organization's name. |
| `psoSubmission.submittedAt` | string (date-time) |  | When it was submitted. |
| `psoSubmission.commonFormatsVersion` | string |  | The version of the AHRQ Common Formats used for the submission, if any. |
| `status` | enum | yes | submitted, triaged, under-investigation, action-plan, closed or not-a-safety-event. |
| `statusHistory` | array of [Status change](common.md#status-change) |  | Every status the record has had, oldest first, each one of the values of status. For an anonymous report, don't record the reporter in by. |
| `attachments` | array of [Attachment](common.md#attachment) |  | Files that belong to the report. Keep identifiable clinical documents in the clinical record, not here. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  | Recorded actions on the report, oldest first. For an anonymous report, don't record the reporter as an actor. |
| `extensions` | [Extensions](common.md#extensions) |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;. |

## Conditional requirements

- In `reporter`, when `anonymous` is `true`, `contact` must be left out.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Attachments have unique ids. |
| `occurred-before-discovered` | The event did not occur after it was discovered. |
| `near-miss-did-not-reach` | A near miss did not reach the patient (reachedPatient is not true). |
| `near-miss-no-harm` | A near miss has a harm level of no-harm or unknown. |
| `incident-reached-patient` | An incident reached the patient (reachedPatient is not false); events that did not are near misses. |
| `unsafe-condition-no-patient` | An unsafe condition did not reach or harm a patient (reachedPatient is not true; harm, if given, is no-harm or unknown). |
| `dates-in-order` | The investigation was not completed before it started. |
