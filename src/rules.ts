// Checks that JSON Schema can't express: references between parts of a record, counts that must agree, and dates
// that must be in order. They run after the schema passes, so they can rely on the record's shape.
import type { RecordType } from "./schemas.js";

export interface RuleError {
  /** JSON Pointer to the value that breaks the rule. */
  path: string;
  /** Short stable name of the rule, for programs. */
  rule: string;
  /** What is wrong, for people. */
  message: string;
}

type Rec = Record<string, any>;
type Check = (record: Rec) => RuleError[];

const before = (a: string | undefined, b: string | undefined) => !!a && !!b && Date.parse(a) > Date.parse(b);

const attachmentRefs = (r: Rec, refs: [string, string | undefined][]): RuleError[] => {
  const ids = new Set<string>((r.attachments ?? []).map((a: Rec) => a.id));
  return refs.filter(([, id]) => id !== undefined && !ids.has(id)).map(([path, id]) => ({ path, rule: "attachment-exists", message: `${id} is not in attachments` }));
};

const boardAction: Check = (r) => {
  const errors: RuleError[] = [];
  const members = new Map<string, Rec>((r.members as Rec[]).map((m) => [m.id, m]));
  const recused = new Set<string>((r.recusals ?? []).map((x: Rec) => x.memberId));
  const known = (path: string, id: string | undefined) => {
    if (id !== undefined && !members.has(id)) errors.push({ path, rule: "member-exists", message: `${id} is not in members` });
  };
  known("/meeting/presidingOfficerId", r.meeting?.presidingOfficerId);
  errors.push(...attachmentRefs(r, (r.agendaItem?.attachmentIds ?? []).map((id: string, j: number) => [`/agendaItem/attachmentIds/${j}`, id])));
  (r.recusals ?? []).forEach((x: Rec, i: number) => known(`/recusals/${i}/memberId`, x.memberId));
  const motionIds = new Set<string>((r.motions ?? []).map((m: Rec) => m.id));
  (r.motions ?? []).forEach((m: Rec, i: number) => {
    const at = `/motions/${i}`;
    known(`${at}/movedBy`, m.movedBy);
    known(`${at}/secondedBy`, m.secondedBy);
    if (m.secondedBy !== undefined && m.secondedBy === m.movedBy) errors.push({ path: `${at}/secondedBy`, rule: "second-differs", message: "a member cannot second their own motion" });
    for (const id of [m.movedBy, m.secondedBy]) {
      if (id !== undefined && recused.has(id)) errors.push({ path: at, rule: "recused-not-acting", message: `${id} is recused and cannot move or second` });
    }
    if (m.appliesToMotionId !== undefined && !motionIds.has(m.appliesToMotionId)) errors.push({ path: `${at}/appliesToMotionId`, rule: "motion-exists", message: `${m.appliesToMotionId} is not in motions` });
    const votes: Rec[] = m.votes ?? [];
    const seen = new Set<string>();
    votes.forEach((v, j) => {
      const vp = `${at}/votes/${j}`;
      known(`${vp}/memberId`, v.memberId);
      if (seen.has(v.memberId)) errors.push({ path: vp, rule: "one-vote-each", message: `${v.memberId} has more than one vote` });
      seen.add(v.memberId);
      const member = members.get(v.memberId);
      if (member && !member.voting && v.vote !== "absent") errors.push({ path: vp, rule: "voting-member", message: `${v.memberId} is not a voting member` });
      if (recused.has(v.memberId) && v.vote !== "recused") errors.push({ path: `${vp}/vote`, rule: "recused-vote", message: `${v.memberId} is recused, so their vote must be recused` });
      if (v.vote === "recused" && !recused.has(v.memberId)) errors.push({ path: `${vp}/vote`, rule: "recusal-recorded", message: `${v.memberId} voted recused but has no entry in recusals` });
    });
    if (m.tally && votes.length) {
      for (const k of ["yes", "no", "abstain", "absent", "recused"] as const) {
        const counted = votes.filter((v) => v.vote === k).length;
        const stated = m.tally[k] ?? 0;
        if (counted !== stated) errors.push({ path: `${at}/tally/${k}`, rule: "tally-matches-votes", message: `tally says ${stated} ${k} but the votes have ${counted}` });
      }
    }
  });
  return errors;
};

const patientSafety: Check = (r) => {
  const errors: RuleError[] = [];
  if (before(r.event?.occurredAt, r.event?.discoveredAt)) errors.push({ path: "/event/occurredAt", rule: "occurred-before-discovered", message: "occurredAt is after discoveredAt" });
  if (r.eventType === "near-miss" && r.reachedPatient === true) errors.push({ path: "/reachedPatient", rule: "near-miss-did-not-reach", message: "a near miss did not reach the patient by definition" });
  if (r.eventType === "near-miss" && r.harm && !["no-harm", "unknown"].includes(r.harm.level)) errors.push({ path: "/harm/level", rule: "near-miss-no-harm", message: "a near miss cannot have caused harm" });
  if (before(r.investigation?.startedAt, r.investigation?.completedAt)) errors.push({ path: "/investigation/completedAt", rule: "dates-in-order", message: "completedAt is before startedAt" });
  return errors;
};

const permit: Check = (r) => [
  ...attachmentRefs(r, (r.documents ?? []).map((d: Rec, i: number) => [`/documents/${i}/attachmentId`, d.attachmentId])),
  ...(r.statutoryClock?.pauses ?? []).flatMap((p: Rec, i: number) =>
    before(p.from, p.to) ? [{ path: `/statutoryClock/pauses/${i}/to`, rule: "dates-in-order", message: "the pause ends before it starts" }] : [],
  ),
  ...(r.status === "issued" && r.decision?.outcome !== "issued"
    ? [{ path: "/decision", rule: "issued-has-decision", message: "status is issued but there is no issued decision" }]
    : []),
];

const vendorRisk: Check = (r) => {
  const assessments = new Set<string>((r.assessments ?? []).map((a: Rec) => a.id));
  const errors: RuleError[] = [];
  (r.assessments ?? []).forEach((a: Rec, i: number) => {
    errors.push(...attachmentRefs(r, (a.attachmentIds ?? []).map((id: string, j: number) => [`/assessments/${i}/attachmentIds/${j}`, id])));
    if (a.periodStart && a.periodEnd && a.periodStart > a.periodEnd) errors.push({ path: `/assessments/${i}/periodEnd`, rule: "dates-in-order", message: "periodEnd is before periodStart" });
  });
  (r.findings ?? []).forEach((f: Rec, i: number) => {
    if (f.assessmentId !== undefined && !assessments.has(f.assessmentId)) errors.push({ path: `/findings/${i}/assessmentId`, rule: "assessment-exists", message: `${f.assessmentId} is not in assessments` });
  });
  if (r.status === "approved" && r.decision && !["approved", "approved-with-conditions"].includes(r.decision.outcome)) {
    errors.push({ path: "/decision/outcome", rule: "status-matches-decision", message: `status is approved but the decision is ${r.decision.outcome}` });
  }
  return errors;
};

/** What each cross-field rule checks, by record type. The docs list these; tests check every rule is described. */
export const RULE_DOCS: Readonly<Record<RecordType, Readonly<Record<string, string>>>> = {
  "vendor-risk-review": {
    "assessment-exists": "A finding's assessmentId names an assessment in the same review.",
    "attachment-exists": "Every attachment id an assessment lists is in attachments.",
    "dates-in-order": "An assessment's periodEnd is not before its periodStart.",
    "status-matches-decision": "A review with status approved has a decision of approved or approved-with-conditions.",
  },
  "patient-safety-incident": {
    "occurred-before-discovered": "The event did not occur after it was discovered.",
    "near-miss-did-not-reach": "A near miss did not reach the patient (reachedPatient is not true).",
    "near-miss-no-harm": "A near miss has a harm level of no-harm or unknown.",
    "dates-in-order": "The investigation was not completed before it started.",
  },
  "permit-application": {
    "attachment-exists": "Every submitted document points at an entry in attachments.",
    "dates-in-order": "A statutory clock pause does not end before it starts.",
    "issued-has-decision": "An application with status issued has a decision with outcome issued.",
  },
  "board-action": {
    "member-exists": "Every member id used (presiding officer, mover, seconder, voters, recusals) is in members.",
    "attachment-exists": "Every attachment id on the agenda item is in attachments.",
    "second-differs": "A member does not second their own motion.",
    "recused-not-acting": "A recused member does not move or second a motion.",
    "motion-exists": "appliesToMotionId names another motion on the item.",
    "one-vote-each": "Each member has at most one vote per motion.",
    "voting-member": "Only voting members cast a vote (non-voting members may be listed as absent).",
    "recused-vote": "A recused member's vote is recorded as recused.",
    "recusal-recorded": "A vote of recused has a matching entry in recusals.",
    "tally-matches-votes": "When both are given, the tally agrees with the individual votes.",
  },
};

export const RULES: Readonly<Record<RecordType, Check>> = {
  "board-action": boardAction,
  "patient-safety-incident": patientSafety,
  "permit-application": permit,
  "vendor-risk-review": vendorRisk,
};
