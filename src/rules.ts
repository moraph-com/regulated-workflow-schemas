// Checks that JSON Schema can't express: references between parts of a record, ids that must be unique, counts that
// must agree, and dates that must be in order. validate() runs them only after the schema passes; called directly on a
// record that isn't schema-valid they skip what's missing instead of throwing.
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

/** The objects in a list, skipping anything else, so the rules hold up on records that failed the schema. */
const list = (v: unknown): Rec[] => (Array.isArray(v) ? v.filter((x) => x !== null && typeof x === "object") : []);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
const before = (a: string | undefined, b: string | undefined) => !!a && !!b && Date.parse(a) > Date.parse(b);

/** Every item in the list at `path` has a different id. */
const uniqueIds = (items: unknown, path: string): RuleError[] => {
  const seen = new Set<string>();
  const errors: RuleError[] = [];
  list(items).forEach((x, i) => {
    if (x.id === undefined) return;
    if (seen.has(x.id)) errors.push({ path: `${path}/${i}/id`, rule: "unique-ids", message: `${x.id} is used by more than one entry in ${path.slice(1)}` });
    seen.add(x.id);
  });
  return errors;
};

const attachmentRefs = (r: Rec, refs: [string, string | undefined][]): RuleError[] => {
  const ids = new Set<string>(list(r.attachments).map((a) => a.id));
  return refs.filter(([, id]) => id !== undefined && !ids.has(id)).map(([path, id]) => ({ path, rule: "attachment-exists", message: `${id} is not in attachments` }));
};

const CAST = ["yes", "no", "abstain"];

/** Whether a motion's counts meet its threshold, or null when the record doesn't say enough to tell. */
function thresholdMet(m: Rec, votingMembers: number): boolean | null {
  const votes = list(m.votes);
  const count = (k: string) => (votes.length ? votes.filter((v) => v.vote === k).length : m.tally ? (m.tally[k] ?? 0) : null);
  const yes = count("yes"), no = count("no");
  if (yes === null || no === null) return null;
  switch (m.threshold) {
    case "majority-of-votes-cast": return yes > no;
    case "two-thirds-of-votes-cast": return yes > 0 && yes >= 2 * no;
    case "majority-of-members": return yes * 2 > votingMembers;
    case "two-thirds-of-members": return yes * 3 >= votingMembers * 2;
    case "unanimous": return yes > 0 && no === 0;
    default: return null;
  }
}

const boardAction: Check = (r) => {
  const errors: RuleError[] = [...uniqueIds(r.members, "/members"), ...uniqueIds(r.motions, "/motions"), ...uniqueIds(r.attachments, "/attachments")];
  const members = new Map<string, Rec>(list(r.members).map((m) => [m.id, m]));
  const votingMembers = list(r.members).filter((m) => m.voting).length;
  const recused = new Set<string>(list(r.recusals).map((x) => x.memberId));
  const known = (path: string, id: string | undefined) => {
    if (id !== undefined && !members.has(id)) errors.push({ path, rule: "member-exists", message: `${id} is not in members` });
  };
  known("/meeting/presidingOfficerId", r.meeting?.presidingOfficerId);
  errors.push(...attachmentRefs(r, strings(r.agendaItem?.attachmentIds).map((id, j) => [`/agendaItem/attachmentIds/${j}`, id])));
  list(r.recusals).forEach((x, i) => known(`/recusals/${i}/memberId`, x.memberId));
  const motionIds = new Set<string>(list(r.motions).map((m) => m.id));
  list(r.motions).forEach((m, i) => {
    const at = `/motions/${i}`;
    known(`${at}/movedBy`, m.movedBy);
    known(`${at}/secondedBy`, m.secondedBy);
    if (m.secondedBy !== undefined && m.secondedBy === m.movedBy) errors.push({ path: `${at}/secondedBy`, rule: "second-differs", message: "a member cannot second their own motion" });
    if (m.secondedBy !== undefined && m.result === "died-for-lack-of-second") errors.push({ path: `${at}/secondedBy`, rule: "no-second-recorded", message: "the motion died for lack of a second, so it has no seconder" });
    for (const id of [m.movedBy, m.secondedBy]) {
      if (id !== undefined && recused.has(id)) errors.push({ path: at, rule: "recused-not-acting", message: `${id} is recused and cannot move or second` });
    }
    if (m.appliesToMotionId !== undefined && (m.appliesToMotionId === m.id || !motionIds.has(m.appliesToMotionId))) {
      errors.push({ path: `${at}/appliesToMotionId`, rule: "motion-exists", message: m.appliesToMotionId === m.id ? "a motion cannot apply to itself" : `${m.appliesToMotionId} is not in motions` });
    }
    const votes = list(m.votes);
    const seen = new Set<string>();
    votes.forEach((v, j) => {
      const vp = `${at}/votes/${j}`;
      known(`${vp}/memberId`, v.memberId);
      if (seen.has(v.memberId)) errors.push({ path: vp, rule: "one-vote-each", message: `${v.memberId} has more than one vote` });
      seen.add(v.memberId);
      const member = members.get(v.memberId);
      if (member && !member.voting && v.vote !== "absent") errors.push({ path: vp, rule: "voting-member", message: `${v.memberId} is not a voting member` });
      if (member && ["absent", "excused"].includes(member.attendance) && CAST.includes(v.vote)) {
        errors.push({ path: `${vp}/vote`, rule: "present-to-vote", message: `${v.memberId} was ${member.attendance} from the meeting, so their vote must be absent` });
      }
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
    if (m.result === "adopted" || m.result === "failed") {
      const met = thresholdMet(m, votingMembers);
      if (met !== null && met !== (m.result === "adopted")) {
        errors.push({ path: `${at}/result`, rule: "threshold-met", message: `the votes ${met ? "meet" : "don't meet"} the ${m.threshold} threshold, but the result is ${m.result}` });
      }
    }
  });
  return errors;
};

const patientSafety: Check = (r) => {
  const errors: RuleError[] = uniqueIds(r.attachments, "/attachments");
  if (before(r.event?.occurredAt, r.event?.discoveredAt)) errors.push({ path: "/event/occurredAt", rule: "occurred-before-discovered", message: "occurredAt is after discoveredAt" });
  if (r.eventType === "near-miss" && r.reachedPatient === true) errors.push({ path: "/reachedPatient", rule: "near-miss-did-not-reach", message: "a near miss did not reach the patient by definition" });
  if (r.eventType === "near-miss" && r.harm && !["no-harm", "unknown"].includes(r.harm.level)) errors.push({ path: "/harm/level", rule: "near-miss-no-harm", message: "a near miss cannot have caused harm" });
  if (r.eventType === "incident" && r.reachedPatient === false) errors.push({ path: "/reachedPatient", rule: "incident-reached-patient", message: "an incident reached the patient by definition; use near-miss if it did not" });
  if (r.eventType === "unsafe-condition" && (r.reachedPatient === true || (r.harm && !["no-harm", "unknown"].includes(r.harm.level)))) {
    errors.push({ path: r.reachedPatient === true ? "/reachedPatient" : "/harm/level", rule: "unsafe-condition-no-patient", message: "an unsafe condition involves no patient, so it cannot have reached or harmed one; use incident" });
  }
  if (before(r.investigation?.startedAt, r.investigation?.completedAt)) errors.push({ path: "/investigation/completedAt", rule: "dates-in-order", message: "completedAt is before startedAt" });
  return errors;
};

// Statuses that only follow a particular decision outcome.
const PERMIT_STATUS_OUTCOME: Readonly<Record<string, string>> = { approved: "approved", denied: "denied", withdrawn: "withdrawn", revoked: "revoked" };

const permit: Check = (r) => {
  const errors: RuleError[] = [
    ...uniqueIds(r.attachments, "/attachments"),
    ...attachmentRefs(r, list(r.documents).map((d, i) => [`/documents/${i}/attachmentId`, d.attachmentId])),
    ...list(r.statutoryClock?.pauses).flatMap((p, i) =>
      before(p.from, p.to) ? [{ path: `/statutoryClock/pauses/${i}/to`, rule: "dates-in-order", message: "the pause ends before it starts" }] : [],
    ),
  ];
  if (["issued", "under-inspection", "finaled"].includes(r.status) && r.decision?.outcome !== "issued") {
    errors.push({ path: "/decision", rule: "issued-has-decision", message: `status is ${r.status} but there is no issued decision` });
  }
  const outcome = PERMIT_STATUS_OUTCOME[r.status];
  if (outcome && r.decision && r.decision.outcome !== outcome) {
    errors.push({ path: "/decision/outcome", rule: "status-matches-decision", message: `status is ${r.status} but the decision is ${r.decision.outcome}` });
  }
  return errors;
};

const vendorRisk: Check = (r) => {
  const assessments = new Set<string>(list(r.assessments).map((a) => a.id));
  const errors: RuleError[] = [...uniqueIds(r.assessments, "/assessments"), ...uniqueIds(r.findings, "/findings"), ...uniqueIds(r.attachments, "/attachments")];
  list(r.assessments).forEach((a, i) => {
    errors.push(...attachmentRefs(r, strings(a.attachmentIds).map((id, j) => [`/assessments/${i}/attachmentIds/${j}`, id])));
    if (a.periodStart && a.periodEnd && a.periodStart > a.periodEnd) errors.push({ path: `/assessments/${i}/periodEnd`, rule: "dates-in-order", message: "periodEnd is before periodStart" });
  });
  list(r.findings).forEach((f, i) => {
    if (f.assessmentId !== undefined && !assessments.has(f.assessmentId)) errors.push({ path: `/findings/${i}/assessmentId`, rule: "assessment-exists", message: `${f.assessmentId} is not in assessments` });
  });
  const allowed: Record<string, string[]> = { approved: ["approved", "approved-with-conditions"], rejected: ["rejected"] };
  if (allowed[r.status] && r.decision && !allowed[r.status]!.includes(r.decision.outcome)) {
    errors.push({ path: "/decision/outcome", rule: "status-matches-decision", message: `status is ${r.status} but the decision is ${r.decision.outcome}` });
  }
  return errors;
};

/** What each cross-field rule checks, by record type. The docs list these; tests check every rule is described. */
export const RULE_DOCS: Readonly<Record<RecordType, Readonly<Record<string, string>>>> = {
  "vendor-risk-review": {
    "unique-ids": "Assessments, findings and attachments each have ids that are unique within their list.",
    "assessment-exists": "A finding's assessmentId names an assessment in the same review.",
    "attachment-exists": "Every attachment id an assessment lists is in attachments.",
    "dates-in-order": "An assessment's periodEnd is not before its periodStart.",
    "status-matches-decision": "A review with status approved has a decision of approved or approved-with-conditions; one with status rejected has a decision of rejected (when a decision is given).",
  },
  "patient-safety-incident": {
    "unique-ids": "Attachments have unique ids.",
    "occurred-before-discovered": "The event did not occur after it was discovered.",
    "near-miss-did-not-reach": "A near miss did not reach the patient (reachedPatient is not true).",
    "near-miss-no-harm": "A near miss has a harm level of no-harm or unknown.",
    "incident-reached-patient": "An incident reached the patient (reachedPatient is not false); events that did not are near misses.",
    "unsafe-condition-no-patient": "An unsafe condition did not reach or harm a patient (reachedPatient is not true; harm, if given, is no-harm or unknown).",
    "dates-in-order": "The investigation was not completed before it started.",
  },
  "permit-application": {
    "unique-ids": "Attachments have unique ids.",
    "attachment-exists": "Every submitted document points at an entry in attachments.",
    "dates-in-order": "A statutory clock pause does not end before it starts.",
    "issued-has-decision": "An application with status issued, under-inspection or finaled has a decision with outcome issued.",
    "status-matches-decision": "An application with status approved, denied, withdrawn or revoked has a decision with the same outcome, when a decision is given.",
  },
  "board-action": {
    "unique-ids": "Members, motions and attachments each have ids that are unique within their list.",
    "member-exists": "Every member id used (presiding officer, mover, seconder, voters, recusals) is in members.",
    "attachment-exists": "Every attachment id on the agenda item is in attachments.",
    "second-differs": "A member does not second their own motion.",
    "no-second-recorded": "A motion that died for lack of a second has no secondedBy.",
    "recused-not-acting": "A recused member does not move or second a motion.",
    "motion-exists": "appliesToMotionId names another motion on the item, not the motion itself.",
    "one-vote-each": "Each member has at most one vote per motion.",
    "voting-member": "Only voting members cast a vote (non-voting members may be listed as absent).",
    "present-to-vote": "A member whose attendance is absent or excused has no yes, no or abstain vote.",
    "recused-vote": "A recused member's vote is recorded as recused.",
    "recusal-recorded": "A vote of recused has a matching entry in recusals.",
    "tally-matches-votes": "When both are given, the tally agrees with the individual votes.",
    "threshold-met": "A motion adopted or failed under a stated threshold has counts that agree: votes cast (yes against no, abstentions not counted), unanimous (no votes against), or members (the voting members listed in members). Checked only when the threshold and the votes or tally are given.",
  },
};

export const RULES: Readonly<Record<RecordType, Check>> = {
  "board-action": boardAction,
  "patient-safety-incident": patientSafety,
  "permit-application": permit,
  "vendor-risk-review": vendorRisk,
};
