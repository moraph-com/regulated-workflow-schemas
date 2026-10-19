/**
 * Cross-field rules: checks that JSON Schema can't express.
 *
 * JSON Schema checks each value against its own definition. It can't check that two parts of a record agree: that a
 * finding's `assessmentId` names an assessment that exists, that a tally matches the individual votes, that a near
 * miss didn't reach the patient, or that a status history ends at the current status. Those are the mistakes that
 * survive a schema check and then mislead an examiner, an accreditor or the public, so this module checks them.
 *
 * Every rule has a short stable name (the `keyword` of a {@link ValidationError} with `source: "rule"`) and a sentence
 * in {@link RULE_DOCS}, which the generated docs list per format. A test fails if a rule is reported but not
 * documented, or documented but never reported.
 *
 * `validate()` runs these only after the schema passes. Called directly on a record that isn't schema-valid, each check
 * skips what's missing or malformed instead of throwing.
 *
 * @module
 */
import type { RecordType } from "./schemas.js";

/** One broken rule. */
export interface RuleError {
  /** JSON Pointer (RFC 6901) to the value that breaks the rule. */
  path: string;
  /** Short stable name of the rule, for programs. Listed in {@link RULE_DOCS}. */
  rule: string;
  /** What is wrong, for people. */
  message: string;
}

// The rules read records that have passed (or may have failed) JSON Schema, so property access is dynamic by nature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

/** A format's rules: takes a record, returns every rule it breaks. */
export type RuleCheck = (record: Rec) => RuleError[];

// ---------------------------------------------------------------------------------------------------------------------
// Helpers. Each tolerates malformed input so the rules never throw.
// ---------------------------------------------------------------------------------------------------------------------

/** The objects in a list, skipping anything else. */
const list = (v: unknown): Rec[] =>
  Array.isArray(v) ? v.filter((x): x is Rec => x !== null && typeof x === "object") : [];
/** The strings in a list, skipping anything else. */
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/**
 * Whether `a` is strictly later than `b`. Both must be the same kind of value: two RFC 3339 date-times (compared as
 * instants, so different UTC offsets compare correctly) or two YYYY-MM-DD dates (compared as calendar dates). Returns
 * false when either is missing or unparseable, so a rule never fires on data it can't read.
 */
function later(a: unknown, b: unknown): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnly.test(a) && dateOnly.test(b)) return a > b;
  if (dateOnly.test(a) || dateOnly.test(b)) return false; // a date and an instant aren't comparable without a time zone
  const [x, y] = [Date.parse(a), Date.parse(b)];
  return Number.isFinite(x) && Number.isFinite(y) && x > y;
}

/** A `dates-in-order` error when `earlier` is later than `laterValue`; nothing otherwise. */
const inOrder = (earlier: unknown, laterValue: unknown, path: string, message: string): RuleError[] =>
  later(earlier, laterValue) ? [{ path, rule: "dates-in-order", message }] : [];

/**
 * Every item in the list at `path` has a different `id`.
 *
 * WHY: other parts of the record (and other systems) refer to items by id. Two findings both called "f1" make "close
 * finding f1" ambiguous, and an importer that keys on id silently drops one of them.
 */
function uniqueIds(items: unknown, path: string): RuleError[] {
  const seen = new Set<unknown>();
  const errors: RuleError[] = [];
  list(items).forEach((x, i) => {
    if (x.id === undefined) return;
    if (seen.has(x.id))
      errors.push({
        path: `${path}/${i}/id`,
        rule: "unique-ids",
        message: `${String(x.id)} is used by more than one entry in ${path.slice(1)}`,
      });
    seen.add(x.id);
  });
  return errors;
}

/**
 * Each listed attachment id is in the record's `attachments`.
 *
 * WHY: an assessment or plan sheet that points at a file the record doesn't carry looks evidenced but isn't. Reviewers
 * relying on the SHA-256 in `attachments` have nothing to check.
 */
function attachmentRefs(r: Rec, refs: [path: string, id: unknown][]): RuleError[] {
  const ids = new Set<unknown>(list(r.attachments).map((a) => a.id));
  return refs
    .filter(([, id]) => id !== undefined && !ids.has(id))
    .map(([path, id]) => ({ path, rule: "attachment-exists", message: `${String(id)} is not in attachments` }));
}

/**
 * Rules every format shares: unique attachment ids, the record's own timestamps in order, and a status history that is
 * oldest first and ends at the current status.
 *
 * WHY the status history rules: `statusHistory` is what an auditor reads to reconstruct who moved the record when. A
 * history out of order, or one whose last entry disagrees with `status`, is usually an export that dropped or
 * reordered entries, and it makes the record contradict itself.
 */
function envelope(r: Rec): RuleError[] {
  const errors = [
    ...uniqueIds(r.attachments, "/attachments"),
    ...inOrder(r.createdAt, r.updatedAt, "/updatedAt", "updatedAt is before createdAt"),
  ];
  const history = list(r.statusHistory);
  history.forEach((h, i) => {
    if (i > 0 && later(history[i - 1]!.at, h.at)) {
      errors.push({
        path: `/statusHistory/${i}/at`,
        rule: "history-in-order",
        message: "statusHistory must be oldest first, but this entry is earlier than the one before it",
      });
    }
  });
  const last = history.at(-1);
  if (last && typeof r.status === "string" && last.status !== r.status) {
    errors.push({
      path: `/statusHistory/${history.length - 1}/status`,
      rule: "history-ends-at-status",
      message: `the last status in statusHistory is ${String(last.status)}, but status is ${r.status}`,
    });
  }
  const audit = list(r.auditTrail);
  audit.forEach((a, i) => {
    if (i > 0 && later(audit[i - 1]!.at, a.at)) {
      errors.push({
        path: `/auditTrail/${i}/at`,
        rule: "history-in-order",
        message: "auditTrail must be oldest first, but this entry is earlier than the one before it",
      });
    }
  });
  return errors;
}

// ---------------------------------------------------------------------------------------------------------------------
// board-action
// ---------------------------------------------------------------------------------------------------------------------

/** Responses that show the member was present and participating when the vote was taken. */
const PRESENT_RESPONSES = ["yes", "no", "abstain"];
/** Attendance values that mean the member wasn't at the meeting at all. */
const NOT_AT_MEETING = ["absent", "excused"];

/**
 * Whether a motion's counts meet its threshold; `null` when the record doesn't say enough to tell, in which case the
 * `threshold-met` rule stays silent rather than guess.
 *
 * The arithmetic follows Robert's Rules of Order Newly Revised (RONR, 12th ed.):
 *
 * - majority of votes cast: more yes than no. Abstentions and blanks are not votes cast (RONR 44:1-44:3).
 * - two-thirds of votes cast: yes at least twice no (RONR 44:4).
 * - majority / two-thirds of the members present: the base is everyone present and able to vote, so an abstention
 *   counts the same as a no (RONR 44:9). It's computed only from individual votes, where yes, no and abstain responses
 *   show who was present; a bare tally can't show members who were present but silent.
 * - majority / two-thirds of the entire membership: the base is the voting members listed in `members` (RONR 44:9
 *   counts the members in office, so leave vacant seats out of `members`).
 * - unanimous: at least one yes and no votes against. Bylaws and statutes differ on whether abstentions break
 *   unanimity; this check doesn't treat them as doing so.
 */
function thresholdMet(m: Rec, votingMembers: number): boolean | null {
  const votes = list(m.votes);
  const fromVotes = (k: string) => votes.filter((v) => v.vote === k).length;
  const tally = m.tally && typeof m.tally === "object" ? (m.tally as Rec) : null;
  const count = (k: string): number | null =>
    votes.length ? fromVotes(k) : tally && typeof tally[k] === "number" ? (tally[k] as number) : tally ? 0 : null;
  const yes = count("yes");
  const no = count("no");
  if (yes === null || no === null) return null;
  const present = votes.length ? votes.filter((v) => PRESENT_RESPONSES.includes(v.vote)).length : null;
  switch (m.threshold) {
    case "majority-of-votes-cast":
      return yes > no;
    case "two-thirds-of-votes-cast":
      return yes > 0 && yes >= 2 * no;
    case "majority-of-members-present":
      return present === null ? null : yes * 2 > present;
    case "two-thirds-of-members-present":
      return present === null ? null : present > 0 && yes * 3 >= present * 2;
    case "majority-of-entire-membership":
      return yes * 2 > votingMembers;
    case "two-thirds-of-entire-membership":
      return yes * 3 >= votingMembers * 2;
    case "unanimous":
      return yes > 0 && no === 0;
    default:
      return null;
  }
}

/** Motions that dispose of the main question, so their adoption can carry an "approved" outcome. */
const MAIN_KINDS = ["main", "substitute"];

const boardAction: RuleCheck = (r) => {
  const errors: RuleError[] = [
    ...envelope(r),
    ...uniqueIds(r.members, "/members"),
    ...uniqueIds(r.motions, "/motions"),
  ];
  const members = new Map<unknown, Rec>(list(r.members).map((m) => [m.id, m]));
  const votingMembers = list(r.members).filter((m) => m.voting === true).length;
  const recused = new Set<unknown>(list(r.recusals).map((x) => x.memberId));
  const motions = list(r.motions);
  const motionIds = new Set<unknown>(motions.map((m) => m.id));

  // WHY member-exists: votes and motions refer to members by id so they can be checked; an id with no member behind it
  // is usually a roster that wasn't updated after an appointment, and it hides who actually acted.
  const known = (path: string, id: unknown) => {
    if (id !== undefined && !members.has(id))
      errors.push({ path, rule: "member-exists", message: `${String(id)} is not in members` });
  };
  known("/meeting/presidingOfficerId", r.meeting?.presidingOfficerId);
  list(r.recusals).forEach((x, i) => known(`/recusals/${i}/memberId`, x.memberId));
  errors.push(
    ...attachmentRefs(
      r,
      strings(r.agendaItem?.attachmentIds).map((id, j) => [`/agendaItem/attachmentIds/${j}`, id]),
    ),
  );

  // WHY quorum-consistent: a quorum count larger than the voting membership is a typo that would make every quorum
  // check meaningless.
  const quorum = r.meeting?.quorum;
  if (quorum && typeof quorum.present === "number" && quorum.present > votingMembers) {
    errors.push({
      path: "/meeting/quorum/present",
      rule: "quorum-consistent",
      message: `quorum.present is ${quorum.present}, but members lists only ${votingMembers} voting members`,
    });
  }
  // WHY quorum-for-action: without a quorum a body can't transact business; anything it "adopts" is void (RONR 40:6).
  // Recording an adopted motion while showing fewer members present than the quorum requires is either a counting
  // error or an invalid action, and both need a clerk's attention before the minutes are approved.
  const noQuorum =
    quorum &&
    typeof quorum.present === "number" &&
    typeof quorum.required === "number" &&
    quorum.present < quorum.required;

  motions.forEach((m, i) => {
    const at = `/motions/${i}`;
    known(`${at}/movedBy`, m.movedBy);
    known(`${at}/secondedBy`, m.secondedBy);

    if (noQuorum && m.result === "adopted") {
      errors.push({
        path: `${at}/result`,
        rule: "quorum-for-action",
        message: `the motion is recorded as adopted, but only ${quorum.present} voting members were present and the quorum is ${quorum.required}`,
      });
    }
    // WHY second-differs: a second shows that at least one other member wants the question discussed (RONR 4:9). A
    // member seconding their own motion defeats that purpose, and in minutes it almost always means the wrong name was
    // picked from a list.
    if (m.secondedBy !== undefined && m.secondedBy === m.movedBy) {
      errors.push({
        path: `${at}/secondedBy`,
        rule: "second-differs",
        message: "a member cannot second their own motion",
      });
    }
    // WHY no-second-recorded: the record can't say both that a member seconded the motion and that it died for lack of
    // a second; one of the two is wrong.
    if (m.secondedBy !== undefined && m.result === "died-for-lack-of-second") {
      errors.push({
        path: `${at}/secondedBy`,
        rule: "no-second-recorded",
        message: "the motion died for lack of a second, so it has no seconder",
      });
    }
    for (const [field, id] of [
      ["movedBy", m.movedBy],
      ["secondedBy", m.secondedBy],
    ] as const) {
      if (id === undefined) continue;
      // WHY recused-not-acting: a member who has stepped aside for a conflict of interest takes no part in the item.
      // Moving or seconding is taking part, and a record showing it undermines the recusal.
      if (recused.has(id))
        errors.push({
          path: `${at}/${field}`,
          rule: "recused-not-acting",
          message: `${String(id)} is recused and cannot move or second`,
        });
      // WHY present-to-act: only members at the meeting can make or second motions; an absent member's name here is a
      // mis-keyed minute.
      const member = members.get(id);
      if (member && NOT_AT_MEETING.includes(member.attendance)) {
        errors.push({
          path: `${at}/${field}`,
          rule: "present-to-act",
          message: `${String(id)} was ${String(member.attendance)} from the meeting, so they cannot move or second`,
        });
      }
    }
    // WHY motion-exists: an amendment or referral modifies another motion; pointing at itself or at nothing loses
    // which question was changed.
    if (m.appliesToMotionId !== undefined && (m.appliesToMotionId === m.id || !motionIds.has(m.appliesToMotionId))) {
      errors.push({
        path: `${at}/appliesToMotionId`,
        rule: "motion-exists",
        message:
          m.appliesToMotionId === m.id
            ? "a motion cannot apply to itself"
            : `${String(m.appliesToMotionId)} is not in motions`,
      });
    }

    const votes = list(m.votes);
    const seen = new Set<unknown>();
    votes.forEach((v, j) => {
      const vp = `${at}/votes/${j}`;
      known(`${vp}/memberId`, v.memberId);
      // WHY one-vote-each: a member listed twice is double-counted in any tally computed from the votes.
      if (seen.has(v.memberId))
        errors.push({ path: vp, rule: "one-vote-each", message: `${String(v.memberId)} has more than one vote` });
      seen.add(v.memberId);
      const member = members.get(v.memberId);
      // WHY voting-member: ex officio non-voting members (a CEO on a board, a student member on a school board) often
      // sit at the table; recording a yes from one inflates the count.
      if (member && member.voting !== true && v.vote !== "absent")
        errors.push({ path: vp, rule: "voting-member", message: `${String(v.memberId)} is not a voting member` });
      // WHY present-to-vote: an absent member can't vote (RONR doesn't allow proxy voting unless the bylaws or law
      // provide for it). A yes from an absent member is the classic "copied last meeting's roll call" error.
      if (member && NOT_AT_MEETING.includes(member.attendance) && PRESENT_RESPONSES.includes(v.vote)) {
        errors.push({
          path: `${vp}/vote`,
          rule: "present-to-vote",
          message: `${String(v.memberId)} was ${String(member.attendance)} from the meeting, so their vote must be absent`,
        });
      }
      // WHY recused-vote and recusal-recorded: a recusal and a vote contradict each other, and a "recused" vote with no
      // recusal entry hides the disclosure the public is entitled to see.
      if (recused.has(v.memberId) && v.vote !== "recused")
        errors.push({
          path: `${vp}/vote`,
          rule: "recused-vote",
          message: `${String(v.memberId)} is recused, so their vote must be recused`,
        });
      if (v.vote === "recused" && !recused.has(v.memberId))
        errors.push({
          path: `${vp}/vote`,
          rule: "recusal-recorded",
          message: `${String(v.memberId)} voted recused but has no entry in recusals`,
        });
    });

    // WHY roll-call-complete: the point of a roll call is a record of how each member voted. A roll call that leaves
    // out a voting member can't be told apart from one that lost a name, so list absent and recused members too.
    if (m.voteMethod === "roll-call" && votes.length) {
      for (const [id, member] of members) {
        if (member.voting === true && !seen.has(id))
          errors.push({
            path: `${at}/votes`,
            rule: "roll-call-complete",
            message: `the roll call has no entry for voting member ${String(id)}; record them as absent or recused if they didn't vote`,
          });
      }
    }

    // WHY tally-matches-votes: published minutes often show both the count and the names. When they disagree, nobody
    // can tell which is right.
    if (m.tally && votes.length) {
      for (const k of ["yes", "no", "abstain", "absent", "recused"] as const) {
        const counted = votes.filter((v) => v.vote === k).length;
        const stated = typeof m.tally[k] === "number" ? m.tally[k] : 0;
        if (counted !== stated)
          errors.push({
            path: `${at}/tally/${k}`,
            rule: "tally-matches-votes",
            message: `tally says ${String(stated)} ${k} but the votes have ${counted}`,
          });
      }
    }

    // WHY threshold-met: the result must follow from the votes under the stated threshold. "Adopted" on a 3-2 vote
    // that needed two-thirds is an invalid action that a court or auditor would set aside.
    if (m.result === "adopted" || m.result === "failed") {
      const met = thresholdMet(m, votingMembers);
      if (met !== null && met !== (m.result === "adopted")) {
        errors.push({
          path: `${at}/result`,
          rule: "threshold-met",
          message: `the votes ${met ? "meet" : "don't meet"} the ${String(m.threshold)} threshold, but the result is ${String(m.result)}`,
        });
      }
    }
  });

  // WHY outcome-matches-motions: the outcome is what the public reads; the motions are the evidence for it. An item
  // recorded as approved whose main motion failed (or was never adopted) contradicts itself.
  const result = r.outcome?.result;
  const mains = motions.filter((m) => MAIN_KINDS.includes(m.kind));
  if (
    (result === "approved" || result === "approved-as-amended") &&
    mains.length &&
    !mains.some((m) => m.result === "adopted")
  ) {
    errors.push({
      path: "/outcome/result",
      rule: "outcome-matches-motions",
      message: `the outcome is ${String(result)}, but no main or substitute motion was adopted`,
    });
  }
  if (
    result === "approved-as-amended" &&
    motions.length &&
    !motions.some((m) => (m.kind === "amend" || m.kind === "substitute") && m.result === "adopted")
  ) {
    errors.push({
      path: "/outcome/result",
      rule: "outcome-matches-motions",
      message: "the outcome is approved-as-amended, but no amendment or substitute was adopted",
    });
  }
  // WHY decided-has-outcome: once an item is decided, the outcome is the one thing every reader needs.
  if ((r.status === "decided" || r.status === "minutes-approved") && !r.outcome) {
    errors.push({
      path: "/outcome",
      rule: "decided-has-outcome",
      message: `status is ${String(r.status)}, so the record needs an outcome`,
    });
  }
  return errors;
};

// ---------------------------------------------------------------------------------------------------------------------
// patient-safety-incident
// ---------------------------------------------------------------------------------------------------------------------

const patientSafety: RuleCheck = (r) => {
  const errors: RuleError[] = [...envelope(r)];
  // WHY occurred-before-discovered: an event can't be found before it happens. The usual cause is a time entered in
  // local time but labelled UTC (or the reverse), which also corrupts any time-to-detection measure.
  if (later(r.event?.occurredAt, r.event?.discoveredAt)) {
    errors.push({
      path: "/event/occurredAt",
      rule: "occurred-before-discovered",
      message: "occurredAt is after discoveredAt",
    });
  }
  errors.push(
    ...inOrder(
      r.event?.discoveredAt,
      r.reporter?.reportedAt,
      "/reporter/reportedAt",
      "the event was reported before it was discovered",
    ),
  );
  // WHY the event-type rules: in the AHRQ Common Formats an incident is an event that reached the patient, a near miss
  // did not reach the patient, and an unsafe condition involves no identifiable patient. Mixing them up moves the
  // report into the wrong category for trending and for any submission to a patient safety organization.
  if (r.eventType === "near-miss" && r.reachedPatient === true) {
    errors.push({
      path: "/reachedPatient",
      rule: "near-miss-did-not-reach",
      message: "a near miss did not reach the patient by definition; use incident if it did",
    });
  }
  if (r.eventType === "incident" && r.reachedPatient === false) {
    errors.push({
      path: "/reachedPatient",
      rule: "incident-reached-patient",
      message: "an incident reached the patient by definition; use near-miss if it did not",
    });
  }
  // WHY harm-only-if-reached: the AHRQ Harm Scale rates harm to a patient an event reached; even its "no harm" level
  // means "reached the patient, but no harm was evident". A harm rating on a near miss or unsafe condition is either
  // a misclassified incident or a rating that doesn't apply.
  if ((r.eventType === "near-miss" || r.eventType === "unsafe-condition") && r.harm) {
    errors.push({
      path: "/harm",
      rule: "harm-only-if-reached",
      message: `${r.eventType === "near-miss" ? "a near miss" : "an unsafe condition"} did not reach a patient, so it has no harm assessment; use incident if the event reached the patient`,
    });
  } else if (r.reachedPatient === false && r.harm) {
    errors.push({
      path: "/harm",
      rule: "harm-only-if-reached",
      message: "the event did not reach the patient, so it has no harm assessment",
    });
  }
  if (r.eventType === "unsafe-condition" && (r.reachedPatient === true || r.patient)) {
    errors.push({
      path: r.reachedPatient === true ? "/reachedPatient" : "/patient",
      rule: "unsafe-condition-no-patient",
      message:
        "an unsafe condition involves no identifiable patient; use near-miss or incident if a patient was involved",
    });
  }
  // WHY anonymous-not-named: an anonymous reporter is promised that the report can't be traced to them. A
  // statusHistory or auditTrail entry made "by" the reporter at the moment of submission names them anyway. The check
  // can only see the first entries' actors; systems must also keep the reporter out of everything else.
  if (r.reporter?.anonymous === true) {
    const first = list(r.statusHistory)[0];
    if (first?.by)
      errors.push({
        path: "/statusHistory/0/by",
        rule: "anonymous-not-named",
        message: "the report is anonymous, so the submission entry must not record who made it",
      });
    const created = list(r.auditTrail).findIndex((a) => a.action === "created" || a.action === "submitted");
    if (created >= 0)
      errors.push({
        path: `/auditTrail/${created}/actor`,
        rule: "anonymous-not-named",
        message: "the report is anonymous, so the audit trail must not record who created or submitted it",
      });
  }
  errors.push(
    ...inOrder(
      r.investigation?.startedAt,
      r.investigation?.completedAt,
      "/investigation/completedAt",
      "the investigation was completed before it started",
    ),
  );
  return errors;
};

// ---------------------------------------------------------------------------------------------------------------------
// permit-application
// ---------------------------------------------------------------------------------------------------------------------

/** Statuses that can only follow a decision with the same outcome. */
const PERMIT_STATUS_OUTCOME: Readonly<Record<string, string>> = {
  approved: "approved",
  denied: "denied",
  withdrawn: "withdrawn",
  revoked: "revoked",
};

const permit: RuleCheck = (r) => {
  const errors: RuleError[] = [
    ...envelope(r),
    ...attachmentRefs(
      r,
      list(r.documents).map((d, i) => [`/documents/${i}/attachmentId`, d.attachmentId]),
    ),
    // WHY dates-in-order on pauses: a pause that ends before it starts subtracts negative days from the statutory
    // clock, pushing the decision deadline earlier than the law allows.
    ...list(r.statutoryClock?.pauses).flatMap((p, i) =>
      inOrder(p.from, p.to, `/statutoryClock/pauses/${i}/to`, "the pause ends before it starts"),
    ),
    ...list(r.reviews).flatMap((v, i) =>
      inOrder(v.startedAt, v.completedAt, `/reviews/${i}/completedAt`, "the review was completed before it started"),
    ),
    ...inOrder(
      r.submittedAt,
      r.decision?.decidedAt,
      "/decision/decidedAt",
      "the decision is dated before the application was submitted",
    ),
    ...inOrder(
      r.decision?.decidedAt?.slice?.(0, 10),
      r.decision?.expiresOn,
      "/decision/expiresOn",
      "the permit expires before it was decided",
    ),
  ];
  // WHY issued-has-decision: a permit under inspection or finaled was issued first. Without the issued decision the
  // record has no permit number, issue date or conditions, which are what an inspector and a future buyer look for.
  if (["issued", "under-inspection", "finaled"].includes(r.status) && r.decision?.outcome !== "issued") {
    errors.push({
      path: "/decision",
      rule: "issued-has-decision",
      message: `status is ${String(r.status)} but there is no decision with outcome issued`,
    });
  }
  // WHY status-matches-decision: the status and the decision are both published; "approved" over a decision of
  // "denied" tells the applicant two different things.
  const outcome = PERMIT_STATUS_OUTCOME[r.status];
  if (outcome && r.decision && r.decision.outcome !== outcome) {
    errors.push({
      path: "/decision/outcome",
      rule: "status-matches-decision",
      message: `status is ${String(r.status)} but the decision is ${String(r.decision.outcome)}`,
    });
  }
  return errors;
};

// ---------------------------------------------------------------------------------------------------------------------
// vendor-risk-review
// ---------------------------------------------------------------------------------------------------------------------

const vendorRisk: RuleCheck = (r) => {
  const assessments = new Set<unknown>(list(r.assessments).map((a) => a.id));
  const errors: RuleError[] = [
    ...envelope(r),
    ...uniqueIds(r.assessments, "/assessments"),
    ...uniqueIds(r.findings, "/findings"),
  ];
  list(r.services).forEach((s, i) =>
    errors.push(...inOrder(s.startDate, s.endDate, `/services/${i}/endDate`, "the service ends before it starts")),
  );
  list(r.assessments).forEach((a, i) => {
    errors.push(
      ...attachmentRefs(
        r,
        strings(a.attachmentIds).map((id, j) => [`/assessments/${i}/attachmentIds/${j}`, id]),
      ),
    );
    // WHY: an independent report whose period ends before it starts can't support any conclusion about the period.
    errors.push(
      ...inOrder(a.periodStart, a.periodEnd, `/assessments/${i}/periodEnd`, "periodEnd is before periodStart"),
    );
  });
  list(r.findings).forEach((f, i) => {
    // WHY assessment-exists: examiners trace each finding to the work that raised it. A dangling assessmentId breaks
    // that trail.
    if (f.assessmentId !== undefined && !assessments.has(f.assessmentId)) {
      errors.push({
        path: `/findings/${i}/assessmentId`,
        rule: "assessment-exists",
        message: `${String(f.assessmentId)} is not in assessments`,
      });
    }
    // WHY: a risk acceptance that expired before it was granted accepts nothing, and the finding is in fact unmanaged.
    errors.push(
      ...inOrder(
        f.riskAcceptance?.acceptedAt?.slice?.(0, 10),
        f.riskAcceptance?.expiresOn,
        `/findings/${i}/riskAcceptance/expiresOn`,
        "the risk acceptance expires before it was accepted",
      ),
    );
  });
  // WHY: a next review due before the last one was done means the schedule was never updated, and monitoring reports
  // will show the relationship as overdue (or, worse, as current).
  errors.push(
    ...inOrder(
      r.reviewCadence?.lastReviewedOn,
      r.reviewCadence?.nextReviewDue,
      "/reviewCadence/nextReviewDue",
      "the next review is due before the last one was completed",
    ),
  );
  // WHY status-matches-decision: a review shown as approved over a decision of rejected tells procurement two
  // different things.
  const allowed: Record<string, string[]> = {
    approved: ["approved", "approved-with-conditions"],
    rejected: ["rejected"],
  };
  const ok = allowed[r.status];
  if (ok && r.decision && !ok.includes(r.decision.outcome)) {
    errors.push({
      path: "/decision/outcome",
      rule: "status-matches-decision",
      message: `status is ${String(r.status)} but the decision is ${String(r.decision.outcome)}`,
    });
  }
  return errors;
};

// ---------------------------------------------------------------------------------------------------------------------
// Rule documentation and the rule table
// ---------------------------------------------------------------------------------------------------------------------

/** Rules every format shares, documented once and merged into each format's entry. */
const ENVELOPE_DOCS = {
  "unique-ids": "Ids in each list (attachments, and the format's other id-bearing lists) are unique within that list.",
  "dates-in-order":
    "Pairs of dates that must be in order are: updatedAt is not before createdAt, plus the format's own pairs listed here.",
  "history-in-order": "statusHistory and auditTrail are oldest first.",
  "history-ends-at-status": "The last entry in statusHistory has the record's current status.",
} as const;

/**
 * What each cross-field rule checks, by record type, in one sentence each. The generated docs list these; a test
 * checks that every rule the code can report is described here and every description is reported by some code path.
 */
export const RULE_DOCS: Readonly<Record<RecordType, Readonly<Record<string, string>>>> = {
  "vendor-risk-review": {
    ...ENVELOPE_DOCS,
    "unique-ids": "Assessments, findings and attachments each have ids that are unique within their list.",
    "dates-in-order":
      "updatedAt is not before createdAt; a service's endDate is not before its startDate; an assessment's periodEnd is not before its periodStart; a risk acceptance doesn't expire before it was accepted; nextReviewDue is not before lastReviewedOn.",
    "assessment-exists": "A finding's assessmentId names an assessment in the same review.",
    "attachment-exists": "Every attachment id an assessment lists is in attachments.",
    "status-matches-decision":
      "A review with status approved has a decision of approved or approved-with-conditions; one with status rejected has a decision of rejected (when a decision is given).",
  },
  "patient-safety-incident": {
    ...ENVELOPE_DOCS,
    "unique-ids": "Attachments have unique ids.",
    "dates-in-order":
      "updatedAt is not before createdAt; the report is not dated before the event was discovered; the investigation was not completed before it started.",
    "occurred-before-discovered": "The event did not occur after it was discovered.",
    "near-miss-did-not-reach": "A near miss did not reach the patient (reachedPatient is not true).",
    "incident-reached-patient":
      "An incident reached the patient (reachedPatient is not false); events that did not are near misses.",
    "harm-only-if-reached":
      "Only an event that reached the patient has a harm assessment: near misses, unsafe conditions and events with reachedPatient false have no harm block.",
    "unsafe-condition-no-patient":
      "An unsafe condition involves no identifiable patient: reachedPatient is not true and there is no patient block.",
    "anonymous-not-named":
      "For an anonymous report, the first statusHistory entry has no by, and no auditTrail entry records who created or submitted it.",
  },
  "permit-application": {
    ...ENVELOPE_DOCS,
    "unique-ids": "Attachments have unique ids.",
    "dates-in-order":
      "updatedAt is not before createdAt; a statutory clock pause doesn't end before it starts; a plan review isn't completed before it started; the decision isn't dated before submission; the permit doesn't expire before it was decided.",
    "attachment-exists": "Every submitted document points at an entry in attachments.",
    "issued-has-decision":
      "An application with status issued, under-inspection or finaled has a decision with outcome issued.",
    "status-matches-decision":
      "An application with status approved, denied, withdrawn or revoked has a decision with the same outcome, when a decision is given.",
  },
  "board-action": {
    ...ENVELOPE_DOCS,
    "unique-ids": "Members, motions and attachments each have ids that are unique within their list.",
    "member-exists": "Every member id used (presiding officer, mover, seconder, voters, recusals) is in members.",
    "attachment-exists": "Every attachment id on the agenda item is in attachments.",
    "quorum-consistent": "quorum.present is not more than the number of voting members listed.",
    "quorum-for-action": "No motion is recorded as adopted when quorum.present is below quorum.required.",
    "second-differs": "A member does not second their own motion.",
    "no-second-recorded": "A motion that died for lack of a second has no secondedBy.",
    "recused-not-acting": "A recused member does not move or second a motion.",
    "present-to-act": "A member whose attendance is absent or excused does not move or second a motion.",
    "motion-exists": "appliesToMotionId names another motion on the item, not the motion itself.",
    "one-vote-each": "Each member has at most one vote per motion.",
    "voting-member": "Only voting members cast a vote (non-voting members may be listed as absent).",
    "present-to-vote": "A member whose attendance is absent or excused has no yes, no or abstain vote.",
    "recused-vote": "A recused member's vote is recorded as recused.",
    "recusal-recorded": "A vote of recused has a matching entry in recusals.",
    "roll-call-complete":
      "A roll-call vote that lists individual votes lists every voting member (as absent or recused if they didn't vote).",
    "tally-matches-votes": "When both are given, the tally agrees with the individual votes.",
    "threshold-met":
      "A motion adopted or failed under a stated threshold has counts that agree with it: votes cast (yes against no; abstentions are not votes cast), members present (yes against everyone who answered yes, no or abstain; needs individual votes), the entire membership (the voting members listed in members), or unanimous (no votes against). Checked only when the threshold and the votes or tally are given.",
    "outcome-matches-motions":
      "An outcome of approved has an adopted main or substitute motion, and approved-as-amended also has an adopted amendment or substitute, whenever motions are recorded.",
    "decided-has-outcome": "An item with status decided or minutes-approved has an outcome.",
  },
};

/** The cross-field rules for each format. `validate()` runs these after the schema passes. */
export const RULES: Readonly<Record<RecordType, RuleCheck>> = {
  "board-action": boardAction,
  "patient-safety-incident": patientSafety,
  "permit-application": permit,
  "vendor-risk-review": vendorRisk,
};
