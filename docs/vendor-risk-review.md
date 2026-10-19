<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Vendor risk review

One review of a third-party relationship: what the third party provides, what data and access it has, how critical the relationship is, inherent and residual risk, the assessments performed, findings and their remediation or acceptance, the review cadence, and the decision and its approvals. The structure follows the third-party risk management life cycle in the US banking agencies' Interagency Guidance on Third-Party Relationships: Risk Management (OCC Bulletin 2023-17), with supply chain concepts from NIST SP 800-161 Rev. 1 and ISO/IEC 27036. It records a review; it doesn't prescribe how to tier vendors or score risk, and using it does not by itself satisfy any of that guidance.

- Schema: [`schemas/vendor-risk-review.schema.json`](../schemas/vendor-risk-review.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/vendor-risk-review.schema.json`
- `recordType`: `vendor-risk-review`, `schemaVersion`: `0.1.0`
- Examples: [`examples/vendor-risk-review/`](../examples/vendor-risk-review/)

## Informed by

- **Interagency Guidance on Third-Party Relationships: Risk Management** (Board of Governors of the Federal Reserve System, FDIC and OCC, June 2023; [OCC Bulletin 2023-17](https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html)). Its third-party relationship life cycle (planning; due diligence and third-party selection; contract negotiation; ongoing monitoring; termination) is the `lifecycleStage` field. Oversight and accountability, independent reviews, and documentation and reporting run through the whole life cycle in the guidance, so they are not stages here. Its description of critical activities is quoted in `services[].supportsCriticalActivity`, and its term for a third party's own suppliers, subcontractors, is used in `access.subcontractors`.
- In September 2026 the same agencies, joined by the NCUA, proposed replacement guidance ([OCC Bulletin 2026-46](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-46.html)) that would organize third-party risk management around risk management components instead of life-cycle stages. This format follows the 2023 guidance, which applies until any replacement is final; it will be revised if the replacement is adopted.
- **NIST SP 800-161 Rev. 1**, *Cybersecurity Supply Chain Risk Management Practices for Systems and Organizations* (May 2022, updated November 2024): criticality, data and access, subcontractors in the supply chain.
- **ISO/IEC 27036**, *Cybersecurity — Supplier relationships* (parts 1 to 3): the supplier relationship concepts behind assessments, findings and remediation.

The format records a review. It doesn't prescribe how to tier vendors or score risk (name your method in `inherentRisk.method`), and recording reviews in it doesn't by itself meet any of the guidance above.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md). Sensitivity is the schema's `x-sensitivity` annotation: `personal` fields identify or contact a person, and `free-text` fields are narrative that may contain anything, including personal data, so screen them before sharing records. Fields of a linked type inherit that type's sensitivity (every [Person](common.md#person) is personal).

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `$schema` | string (uri) |  |  | The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing. |
| `recordType` | `"vendor-risk-review"` | yes |  | Always vendor-risk-review. Lets a reader (or validate()) tell the format apart from the others in this repository. |
| `schemaVersion` | `"0.1.0"` | yes |  | The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for. |
| `id` | string (identifier) | yes |  | This review's identifier, unique within the system that created it. A relationship reviewed every year has one record per review, each with its own id; link them through vendor.id or externalIds. Example: `vrr-2026-0142`. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  |  | Ids for this review in other systems: the GRC tool, procurement, the contract repository. |
| `createdAt` | string (date-time) |  |  | When the record was created. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `updatedAt` | string (date-time) |  |  | When the record was last changed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `reviewingOrganization` | [Organization](common.md#organization) |  |  | The organization doing the review (the bank, hospital or agency that relies on the third party). Optional because it is usually obvious inside one organization; give it when records are shared or consolidated. |
| `vendor` | [Organization](common.md#organization) | yes |  | The third party under review. The interagency guidance uses third-party relationship broadly: vendors, service providers, fintech partners, affiliates and others. |
| `relationshipOwner` | [Person](common.md#person) |  | personal | The person inside the organization accountable for the relationship day to day (often the business line manager), as distinct from the risk staff who assess it. |
| `lifecycleStage` | enum |  |  | Where the relationship is in the third-party risk management life cycle of the interagency guidance (OCC Bulletin 2023-17): planning; due-diligence (the guidance's Due Diligence and Third-Party Selection); contract-negotiation; ongoing-monitoring; or termination. The guidance treats oversight and accountability, independent reviews, and documentation and reporting as running throughout the life cycle rather than as stages, so they are not values here. In September 2026 the agencies proposed replacement guidance (OCC Bulletin 2026-46) organized around risk management components rather than these stages; this field follows the 2023 guidance, which applies until any replacement is final. |
| `services` | array of object | yes |  | What the third party provides under the relationship, one entry per distinct service or product. At least one is required, because a review is always of something specific. |
| `services[].name` | string | yes |  | The service's name, as the business knows it. Examples: `Payroll processing`, `Core banking platform`. |
| `services[].description` | string |  | free-text | What the service does for the organization, in a sentence or two a reviewer outside the business line would understand. |
| `services[].supportsCriticalActivity` | boolean |  |  | Whether the service supports a critical activity as the organization defines it. The interagency guidance (OCC Bulletin 2023-17) describes critical activities as ones that could cause the organization to face significant risk if the third party fails to meet expectations, have significant customer impacts, or have a significant impact on its financial condition or operations, and leaves each organization to identify its own. Higher-risk and critical activities call for more rigorous oversight. |
| `services[].startDate` | string (date) |  |  | When the service started or will start. Example: `2026-03-04`. |
| `services[].endDate` | string (date) |  |  | When the service ends or ended (contract expiry or exit). Must not be before startDate. Example: `2026-03-04`. |
| `services[].contractRef` | string |  |  | The contract, order or statement of work that covers the service, as the contract repository names it. Example: `MSA-2023-017`. |
| `services[].annualSpend` | [Money](common.md#money) |  |  | Expected or actual spend per year, used for tiering and concentration analysis. |
| `dataCategories` | array of enum |  |  | The kinds of the organization's data the third party stores, processes or can reach, as many as apply; use none, on its own, when it has no access to the organization's data. Values: none; public; internal; confidential (business confidential); personal-data (information about an identifiable person); sensitive-personal-data (special-category or high-risk personal data such as government ids, financial account numbers, biometrics); nonpublic-personal-information (consumer information protected under the US Gramm-Leach-Bliley Act; not employee data); protected-health-information (as defined by HIPAA); payment-card-data (cardholder data in scope for PCI DSS); controlled-unclassified-information (US federal CUI); authentication-credentials (passwords, keys, tokens that grant access); source-code. |
| `access` | object |  |  | How the third party reaches the organization's systems and data, and where the data goes. |
| `access.systemAccess` | enum |  |  | The highest level of access the third party (or its staff) has to the organization's own systems: none; read; read-write; or administrative (can change configuration, users or security settings). |
| `access.hostsData` | boolean |  |  | Whether the third party stores the organization's data on infrastructure it controls (including its cloud providers), rather than only reaching it inside the organization's systems. |
| `access.dataLocations` | array of string (country code) |  |  | Countries where the third party stores or processes the data, including through subcontractors. Matters for data transfer law, government access and resilience planning. |
| `access.subcontractors` | array of object |  |  | The third party's own suppliers that support the service or touch the data. The interagency guidance calls these subcontractors; many programs call them fourth parties. NIST SP 800-161 Rev. 1 treats them as part of the supply chain the organization must understand. |
| `access.subcontractors[].name` | string | yes |  | The subcontractor's name. |
| `access.subcontractors[].service` | string |  |  | What the subcontractor does for the third party. Examples: `Infrastructure hosting`, `Paper statement printing`. |
| `access.subcontractors[].country` | string (country code) |  |  | Where the subcontractor performs the work. Examples: `US`, `GB`, `IE`. |
| `criticality` | enum | yes |  | How much the organization depends on the relationship, on its own tiering scale mapped to four levels: low, moderate, high or critical. Reserve critical for relationships that support critical activities (see services[].supportsCriticalActivity). Rigor of due diligence, monitoring and contract terms should scale with this rating. |
| `criticalityRationale` | string |  | free-text | Why the relationship has that criticality, in terms an examiner can follow: what would happen if the service failed. |
| `inherentRisk` | object |  |  | Risk before the organization's and the third party's controls are taken into account, based on the service, data, access and criticality. |
| `inherentRisk.level` | enum | yes |  | The overall level. Values: `low`, `moderate`, `high`, `critical`. |
| `inherentRisk.score` | number |  |  | A numeric score on the organization's own scale, if its method produces one. Not comparable between organizations; level is. |
| `inherentRisk.method` | string |  |  | The scoring method or model used, with its version. Example: `Bank TPRM tiering model v3`. |
| `inherentRisk.rationale` | string |  | free-text | Why the rating is what it is. |
| `residualRisk` | object |  |  | Risk remaining after controls, given what the assessments showed. The gap between inherent and residual risk is what the controls are credited with. |
| `residualRisk.level` | enum | yes |  | The overall level. Values: `low`, `moderate`, `high`, `critical`. |
| `residualRisk.score` | number |  |  | A numeric score on the organization's own scale, if its method produces one. Not comparable between organizations; level is. |
| `residualRisk.method` | string |  |  | The scoring method or model used, with its version. Example: `Bank TPRM tiering model v3`. |
| `residualRisk.rationale` | string |  | free-text | Why the rating is what it is. |
| `riskDomains` | array of object |  |  | Inherent and residual risk for each risk domain assessed. Optional; many programs rate only overall risk. |
| `riskDomains[].domain` | enum | yes |  | The risk domain. Values: `information-security`, `privacy`, `operational-resilience`, `business-continuity`, `financial`, `compliance`, `legal`, `reputational`, `concentration`, `strategic`, `geographic`, `environmental-social`. |
| `riskDomains[].inherent` | enum | yes |  | Inherent risk in this domain. Values: `low`, `moderate`, `high`, `critical`. |
| `riskDomains[].residual` | enum |  |  | Residual risk in this domain, once assessed. Values: `low`, `moderate`, `high`, `critical`. |
| `riskDomains[].rationale` | string |  | free-text | What drives the rating, including the controls that reduce it. |
| `assessments` | array of object |  |  | The due diligence and monitoring work performed for this review: questionnaires, document and independent report reviews, visits, financial reviews, test reviews. Findings point at the assessment that raised them. |
| `assessments[].id` | string (identifier) | yes |  | Identifier for the assessment, unique within the review; findings refer to it. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `assessments[].type` | enum | yes |  | questionnaire (security or due diligence questionnaire); document-review (policies, plans, insurance, contracts); independent-report-review (an independent audit or certification report, for example a SOC 1 or SOC 2 report, an ISO/IEC 27001 certificate or a PCI DSS attestation); onsite-visit; remote-assessment (interviews or walkthroughs by video); financial-review (financial statements and condition); penetration-test-review; continuous-monitoring (outside-in security ratings, news, sanctions or financial alerts); other. |
| `assessments[].description` | string |  | free-text | What was assessed and how. |
| `assessments[].evidenceName` | string |  |  | The report, certificate or questionnaire reviewed, named the way its issuer names it. Examples: `SOC 2 Type 2 report`, `ISO/IEC 27001 certificate`, `SIG Core questionnaire`. |
| `assessments[].periodStart` | string (date) |  |  | Start of the period the evidence covers (for a SOC 2 Type 2 report, the start of its examination period). Example: `2026-03-04`. |
| `assessments[].periodEnd` | string (date) |  |  | End of the period the evidence covers. Must not be before periodStart; a stale period (long before the review) is itself worth a finding. Example: `2026-03-04`. |
| `assessments[].performedBy` | [Person](common.md#person) |  | personal | Who performed the assessment. |
| `assessments[].completedAt` | string (date-time) |  |  | When it was completed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `assessments[].result` | enum |  |  | satisfactory; satisfactory-with-findings (acceptable, with findings recorded below); unsatisfactory; or inconclusive (not enough evidence to conclude, for example an unanswered questionnaire). |
| `assessments[].attachmentIds` | array of string (identifier) |  |  | Ids of the evidence files in the record's attachments. |
| `findings` | array of object |  |  | Issues found during the review and what is being done about each: remediation, or a documented risk acceptance. |
| `findings[].id` | string (identifier) | yes |  | Identifier for the finding, unique within the review, used in conditions and follow-up. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `findings[].title` | string | yes |  | The issue in one line. Example: `Quarterly user access reviews not evidenced for Q3`. |
| `findings[].description` | string |  | free-text | What was found and why it matters. |
| `findings[].domain` | enum |  |  | The risk domain the finding falls in. Values: `information-security`, `privacy`, `operational-resilience`, `business-continuity`, `financial`, `compliance`, `legal`, `reputational`, `concentration`, `strategic`, `geographic`, `environmental-social`. |
| `findings[].severity` | enum | yes |  | low, medium, high or critical, on the organization's issue-rating scale. |
| `findings[].assessmentId` | string (identifier) |  |  | The assessment that raised the finding. The validator checks it exists. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `findings[].status` | enum | yes |  | open; remediation-planned; in-remediation; remediated (fixed, awaiting or past verification); risk-accepted (not being fixed; riskAcceptance is required); or closed. |
| `findings[].remediation` | object |  |  | The plan to fix the issue. |
| `findings[].remediation.plan` | string |  | free-text | What will be done, by whom (the third party or the organization). |
| `findings[].remediation.owner` | [Person](common.md#person) |  | personal | Who is responsible for seeing it done. |
| `findings[].remediation.dueDate` | string (date) |  |  | When it is due. Example: `2026-03-04`. |
| `findings[].remediation.completedAt` | string (date-time) |  |  | When it was completed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `findings[].remediation.verifiedBy` | [Person](common.md#person) |  | personal | Who confirmed the fix works. Separation between the person fixing and the person verifying is what examiners look for. |
| `findings[].riskAcceptance` | object |  |  | A documented decision to accept the risk instead of fixing it: who accepted it, when, why, and until when. Required when status is risk-accepted, because an undocumented acceptance is indistinguishable from an ignored finding. |
| `findings[].riskAcceptance.acceptedBy` | [Person](common.md#person) | yes | personal | Who accepted the risk. Should be someone with authority to accept risk of this severity under the organization's policy. |
| `findings[].riskAcceptance.acceptedAt` | string (date-time) | yes |  | When the risk was accepted. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `findings[].riskAcceptance.expiresOn` | string (date) |  |  | When the acceptance expires and must be revisited. Must not be before acceptedAt. Open-ended acceptances are a common examination finding; give a date. Example: `2026-03-04`. |
| `findings[].riskAcceptance.rationale` | string | yes | free-text | Why the risk is accepted, and any compensating controls. |
| `reviewCadence` | object |  |  | How often the relationship is reviewed and when the next review is due, plus the events that should prompt an earlier review. Cadence normally follows criticality. |
| `reviewCadence.frequency` | enum | yes |  | monthly, quarterly, semiannual, annual, biennial (every two years) or event-driven (no fixed schedule; reviewed only on a trigger). |
| `reviewCadence.lastReviewedOn` | string (date) |  |  | When the last review was completed. Example: `2026-03-04`. |
| `reviewCadence.nextReviewDue` | string (date) |  |  | When the next scheduled review is due. Must not be before lastReviewedOn. Example: `2026-03-04`. |
| `reviewCadence.triggers` | array of string |  |  | Events that prompt a review outside the schedule. |
| `decision` | object |  |  | The outcome of the review, once one is made. |
| `decision.outcome` | enum | yes |  | approved; approved-with-conditions (conditions must be listed); rejected (don't enter or renew the relationship); deferred (more information needed before deciding); or terminate-relationship (exit an existing relationship). |
| `decision.conditions` | array of string |  |  | Conditions attached to the approval, each specific and checkable. Required, and must not be empty, when the outcome is approved-with-conditions. |
| `decision.decidedAt` | string (date-time) |  |  | When the decision was made. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `decision.rationale` | string |  | free-text | Why the decision was made, especially when it accepts elevated residual risk. |
| `approvals` | array of object |  |  | Sign-offs on the decision, in the order they were given. Who must approve depends on the organization's policy and the relationship's criticality (critical relationships often go to a committee or the board). |
| `approvals[].approver` | [Person](common.md#person) | yes | personal | Who signed off. |
| `approvals[].capacity` | string |  |  | The role in which the person approves, which is what policy requires (a person may hold several). Examples: `Business owner`, `CISO`, `Third-party risk committee chair`. |
| `approvals[].decision` | enum | yes |  | approved, rejected or abstained (for example because of a conflict of interest). |
| `approvals[].at` | string (date-time) | yes |  | When the sign-off was given. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `approvals[].comment` | string |  | free-text | What the approver said, if anything. |
| `status` | enum | yes |  | Where the review is in its workflow: draft; in-review (assessments under way); pending-approval; approved; rejected; or closed (complete with no further action, for example after termination). The validator checks approved and rejected agree with decision.outcome. |
| `statusHistory` | array of [Status change](common.md#status-change) |  |  | Every status the review has had, oldest first, ending at the current status (the validator checks both). |
| `attachments` | array of [Attachment](common.md#attachment) |  |  | Files that belong to the review: independent reports, questionnaires, contracts, financial statements. Many are shared under NDA; set classification accordingly. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  |  | Recorded actions on the review, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;, for example examplebank:costCenter. |

## Conditional requirements

- `dataCategories` holds nothing else when it contains `"none"`.
- In `findings[]`, when `status` is `"risk-accepted"`, `riskAcceptance` is required.
- In `decision`, when `outcome` is `"approved-with-conditions"`, `conditions` is required and must not be empty.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Assessments, findings and attachments each have ids that are unique within their list. |
| `dates-in-order` | updatedAt is not before createdAt; a service's endDate is not before its startDate; an assessment's periodEnd is not before its periodStart; a risk acceptance doesn't expire before it was accepted; nextReviewDue is not before lastReviewedOn. |
| `history-in-order` | statusHistory and auditTrail are oldest first. |
| `history-ends-at-status` | The last entry in statusHistory has the record's current status. |
| `assessment-exists` | A finding's assessmentId names an assessment in the same review. |
| `attachment-exists` | Every attachment id an assessment lists is in attachments. |
| `status-matches-decision` | A review with status approved has a decision of approved or approved-with-conditions; one with status rejected has a decision of rejected (when a decision is given). |
