<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Vendor risk review

One review of a third-party relationship: what the vendor provides, what data and access it has, how critical it is, the inherent and residual risk, the assessments performed, findings and their remediation, the review cadence and the approval decision. Informed by the US interagency guidance on third-party relationships (OCC Bulletin 2023-17), NIST SP 800-161 Rev. 1 and ISO/IEC 27036.

- Schema: [`schemas/vendor-risk-review.schema.json`](../schemas/vendor-risk-review.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/vendor-risk-review.schema.json`
- `recordType`: `vendor-risk-review`, `schemaVersion`: `0.1.0`
- Examples: [`examples/vendor-risk-review/`](../examples/vendor-risk-review/)

## Informed by

- US interagency guidance on third-party relationships: risk management (OCC Bulletin 2023-17, issued jointly with the Federal Reserve and FDIC, June 2023). Its life cycle (planning, due diligence, contract negotiation, ongoing monitoring, termination) is the `lifecycleStage` field.
- NIST SP 800-161 Rev. 1, *Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations*: criticality, data and access, fourth parties.
- ISO/IEC 27036, *Information security for supplier relationships*.

The format records a review; it does not prescribe how to tier vendors or score risk. Put your method's name in `inherentRisk.method`.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | string (uri) |  | The $id of this schema, so readers can tell what the record is. |
| `recordType` | `"vendor-risk-review"` | yes | Always vendor-risk-review. |
| `schemaVersion` | `"0.1.0"` | yes | The version of this format the record follows. |
| `id` | string (identifier) | yes | This review's identifier, unique within the system that created it. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  | Ids for this review in other systems (GRC tool, procurement, contract repository). |
| `createdAt` | string (date-time) |  | When the record was created. |
| `updatedAt` | string (date-time) |  | When the record was last changed. |
| `reviewingOrganization` | [Organization](common.md#organization) |  | The organization doing the review. |
| `vendor` | [Organization](common.md#organization) | yes | The third party under review. |
| `relationshipOwner` | [Person](common.md#person) |  | The person accountable for the relationship inside the organization. |
| `lifecycleStage` | enum |  | Where the relationship is in the third-party risk life cycle: planning, due-diligence (before contract), contract-negotiation, ongoing-monitoring or termination. |
| `services` | array of object | yes | What the vendor provides under the relationship. |
| `services[].name` | string | yes | The service's name. |
| `services[].description` | string |  | What the service does for the organization. |
| `services[].supportsCriticalActivity` | boolean |  | Whether the service supports an activity whose failure would significantly harm the organization or its customers. |
| `services[].startDate` | string (date) |  | When the service started. |
| `services[].endDate` | string (date) |  | When the service ends or ended. |
| `services[].contractRef` | string |  | The contract or order that covers the service. |
| `services[].annualSpend` | [Money](common.md#money) |  | Expected or actual spend per year. |
| `dataCategories` | array of enum |  | The kinds of data the vendor stores, processes or can reach. Use none, on its own, when it has no access to the organization's data. |
| `access` | object |  | How the vendor reaches the organization's systems and data. |
| `access.systemAccess` | enum |  | The highest level of access the vendor has to the organization's systems: none, read, read-write or administrative. |
| `access.hostsData` | boolean |  | Whether the vendor stores the organization's data on infrastructure it controls. |
| `access.dataLocations` | array of string (country code) |  | Countries where the vendor stores or processes the data. |
| `access.subcontractors` | array of object |  | The vendor's own suppliers that touch the service or data (fourth parties). |
| `access.subcontractors[].name` | string | yes | The subcontractor's name. |
| `access.subcontractors[].service` | string |  | What the subcontractor does for the vendor. |
| `access.subcontractors[].country` | string (country code) |  | Where the subcontractor is based. |
| `criticality` | enum | yes | How much the organization depends on the relationship: low, moderate, high or critical. Critical relationships support critical activities. |
| `criticalityRationale` | string |  | Why the relationship has that criticality. |
| `inherentRisk` | object |  | Risk before the vendor's and the organization's controls are taken into account. |
| `inherentRisk.level` | enum | yes | The overall level: low, moderate, high or critical. |
| `inherentRisk.score` | number |  | A numeric score on the organization's own scale, if it uses one. |
| `inherentRisk.method` | string |  | The scoring method or model used. |
| `inherentRisk.rationale` | string |  | Why the rating is what it is. |
| `residualRisk` | object |  | Risk remaining after controls. |
| `residualRisk.level` | enum | yes | The overall level: low, moderate, high or critical. |
| `residualRisk.score` | number |  | A numeric score on the organization's own scale, if it uses one. |
| `residualRisk.method` | string |  | The scoring method or model used. |
| `residualRisk.rationale` | string |  | Why the rating is what it is. |
| `riskDomains` | array of object |  | Inherent and residual risk for each risk domain that was assessed. |
| `riskDomains[].domain` | enum | yes | The risk domain. Values: `information-security`, `privacy`, `operational-resilience`, `business-continuity`, `financial`, `compliance`, `legal`, `reputational`, `concentration`, `strategic`, `geographic`, `environmental-social`. |
| `riskDomains[].inherent` | enum | yes | Inherent risk in this domain. Values: `low`, `moderate`, `high`, `critical`. |
| `riskDomains[].residual` | enum |  | Residual risk in this domain. Values: `low`, `moderate`, `high`, `critical`. |
| `riskDomains[].rationale` | string |  | What drives the rating, including controls that reduce it. |
| `assessments` | array of object |  | Due-diligence and monitoring activities performed for this review. |
| `assessments[].id` | string (identifier) | yes | Identifier for this item, unique within the record. |
| `assessments[].type` | enum | yes | questionnaire, document-review, independent-report-review (for example a SOC report or certificate), onsite-visit, remote-assessment, financial-review, penetration-test-review, continuous-monitoring or other. |
| `assessments[].description` | string |  | What was assessed and how. |
| `assessments[].evidenceName` | string |  | The report, certificate or questionnaire reviewed, as named by its issuer, for example 'SOC 2 Type II report' or 'ISO/IEC 27001 certificate'. |
| `assessments[].periodStart` | string (date) |  | Start of the period the evidence covers. |
| `assessments[].periodEnd` | string (date) |  | End of the period the evidence covers. |
| `assessments[].performedBy` | [Person](common.md#person) |  | Who performed the assessment. |
| `assessments[].completedAt` | string (date-time) |  | When it was completed. |
| `assessments[].result` | enum |  | satisfactory, satisfactory-with-findings, unsatisfactory or inconclusive. |
| `assessments[].attachmentIds` | array of string (identifier) |  | Ids of related entries in the record's attachments. |
| `findings` | array of object |  | Issues found during the review and what is being done about them. |
| `findings[].id` | string (identifier) | yes | Identifier for the finding, unique within the review. |
| `findings[].title` | string | yes | The issue in one line. |
| `findings[].description` | string |  | What was found and why it matters. |
| `findings[].domain` | enum |  | The risk domain. Values: `information-security`, `privacy`, `operational-resilience`, `business-continuity`, `financial`, `compliance`, `legal`, `reputational`, `concentration`, `strategic`, `geographic`, `environmental-social`. |
| `findings[].severity` | enum | yes | low, medium, high or critical. |
| `findings[].assessmentId` | string (identifier) |  | The assessment that raised the finding. |
| `findings[].status` | enum | yes | open, remediation-planned, in-remediation, remediated, risk-accepted or closed. |
| `findings[].remediation` | object |  | The plan to fix the issue. |
| `findings[].remediation.plan` | string |  | What will be done. |
| `findings[].remediation.owner` | [Person](common.md#person) |  | Who is responsible. |
| `findings[].remediation.dueDate` | string (date) |  | When it is due. |
| `findings[].remediation.completedAt` | string (date-time) |  | When it was completed. |
| `findings[].remediation.verifiedBy` | [Person](common.md#person) |  | Who confirmed the fix works. |
| `findings[].riskAcceptance` | object |  | A documented decision to accept the risk instead of fixing it. Required when status is risk-accepted. |
| `findings[].riskAcceptance.acceptedBy` | [Person](common.md#person) | yes | Who accepted the risk. |
| `findings[].riskAcceptance.acceptedAt` | string (date-time) | yes | When the risk was accepted. |
| `findings[].riskAcceptance.expiresOn` | string (date) |  | When it expires. |
| `findings[].riskAcceptance.rationale` | string | yes | Why the risk is accepted, and any compensating controls. |
| `reviewCadence` | object |  | How often the relationship is reviewed, and when the next review is due. |
| `reviewCadence.frequency` | enum | yes | monthly, quarterly, semiannual, annual, biennial or event-driven. |
| `reviewCadence.lastReviewedOn` | string (date) |  | When the last review was completed. |
| `reviewCadence.nextReviewDue` | string (date) |  | When the next scheduled review is due. |
| `reviewCadence.triggers` | array of string |  | Events that prompt a review outside the schedule, for example a breach notice, change of control or material service change. |
| `decision` | object |  | The outcome of the review. |
| `decision.outcome` | enum | yes | approved, approved-with-conditions, rejected, deferred or terminate-relationship. |
| `decision.conditions` | array of string |  | Conditions attached to the approval. |
| `decision.decidedAt` | string (date-time) |  | When the decision was made. |
| `decision.rationale` | string |  | Why the decision was made. |
| `approvals` | array of object |  | Sign-offs on the decision, in order. |
| `approvals[].approver` | [Person](common.md#person) | yes | Who signed off. |
| `approvals[].capacity` | string |  | The role in which the person approves, for example business owner, CISO, third-party risk committee. |
| `approvals[].decision` | enum | yes | approved, rejected or abstained. |
| `approvals[].at` | string (date-time) | yes | When. |
| `approvals[].comment` | string |  | What the approver said. |
| `status` | enum | yes | draft, in-review, pending-approval, approved, rejected or closed. |
| `statusHistory` | array of [Status change](common.md#status-change) |  | Every status the record has had, oldest first, each one of the values of status. |
| `attachments` | array of [Attachment](common.md#attachment) |  | Files that belong to the review: reports, questionnaires, contracts. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  | Recorded actions on the review, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;. |

## Conditional requirements

- `dataCategories` holds nothing else when it contains `"none"`.
- In `findings[]`, when `status` is `"risk-accepted"`, `riskAcceptance` is required.
- In `decision`, when `outcome` is `"approved-with-conditions"`, `conditions` is required and must not be empty.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Assessments, findings and attachments each have ids that are unique within their list. |
| `assessment-exists` | A finding's assessmentId names an assessment in the same review. |
| `attachment-exists` | Every attachment id an assessment lists is in attachments. |
| `dates-in-order` | An assessment's periodEnd is not before its periodStart. |
| `status-matches-decision` | A review with status approved has a decision of approved or approved-with-conditions; one with status rejected has a decision of rejected (when a decision is given). |
