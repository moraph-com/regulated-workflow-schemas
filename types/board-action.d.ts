/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Ids of the item's files in attachments (staff report, draft resolution, presentation).
 *
 * Items: A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
 */
export type AttachmentIds = string[];

/**
 * The record of one agenda item taken up by a board, council, commission or committee: the body and meeting, who attended, the motions made, who moved and seconded them, each member's vote, recusals, public comment and the outcome. Motions, thresholds and voting follow the concepts of parliamentary procedure as described in Robert's Rules of Order Newly Revised (RONR); the format records what happened and doesn't require any body to follow RONR, since bylaws, statutes and local rules take precedence. Works for corporate and nonprofit boards and for public bodies.
 */
export interface BoardAction {
  /**
   * The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing.
   */
  $schema?: string;
  /**
   * Always board-action. Lets a reader (or validate()) tell the format apart from the others in this repository.
   */
  recordType: "board-action";
  /**
   * The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for.
   */
  schemaVersion: "0.1.0";
  /**
   * This record's identifier, unique within the system that created it. One record covers one agenda item, so a meeting with ten items has ten records sharing meeting.id.
   */
  id: string;
  /**
   * Ids for this item in other systems, for example a legislative management system's file number or a board portal's item id.
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
  body: Body;
  meeting: Meeting;
  /**
   * Every member of the body for this meeting, voting and non-voting, with their attendance. Motions, votes and recusals refer to members by id so the validator can check them. Leave vacant seats out: votes based on the entire membership count the members listed here.
   *
   * @minItems 1
   */
  members: [Member, ...Member[]];
  agendaItem: AgendaItem;
  /**
   * Motions made on the item, in the order they were made: the main motion and any secondary motions (amendments, referral, postponement) that applied to it.
   */
  motions?: Motion[];
  /**
   * Members who stepped aside from the item because of a conflict of interest, and why. A recusal is required or expected by conflict-of-interest law or policy and means the member takes no part. It differs from an abstention, where a member takes part but declines to vote: RONR (45:4) says a member with a direct personal or pecuniary interest not common to other members should not vote, but can't be compelled to abstain.
   */
  recusals?: Recusal[];
  outcome?: Outcome;
  minutes?: Minutes;
  /**
   * Where the item is: scheduled (on an agenda); in-progress (taken up, not concluded); decided; minutes-approved (the minutes recording the decision are approved); or withdrawn (removed from the agenda). decided and minutes-approved need an outcome.
   */
  status: "scheduled" | "in-progress" | "decided" | "minutes-approved" | "withdrawn";
  /**
   * Every status the item has had, oldest first, ending at the current status (the validator checks both).
   */
  statusHistory?: (StatusChange & {
    /**
     * The status the record moved to, one of this format's status values.
     */
    status?: "scheduled" | "in-progress" | "decided" | "minutes-approved" | "withdrawn";
  })[];
  /**
   * Files that belong to the item: staff reports, draft resolutions, bid tabulations, presentations.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the record, oldest first.
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
 * The board, council, commission or committee that acted.
 */
export interface Body {
  /**
   * Identifier for the body, so records from many meetings can be grouped.
   */
  id?: string;
  /**
   * The body's name.
   */
  name: string;
  /**
   * board-of-directors (a corporate or credit union board); board-committee (a committee of a board, such as audit or risk); board-of-trustees (nonprofit, pension or university trustees); city-council; county-board (board of supervisors or commissioners); school-board; planning-commission; authority-board (a public authority, district or agency board); advisory-committee; or other.
   */
  type:
    | "board-of-directors"
    | "board-committee"
    | "board-of-trustees"
    | "city-council"
    | "county-board"
    | "school-board"
    | "planning-commission"
    | "authority-board"
    | "advisory-committee"
    | "other";
  organization?: Organization;
  jurisdiction?: Jurisdiction;
  /**
   * Whether open-meetings (sunshine) law applies to the body. Public bodies have notice, public access and minutes obligations that private boards don't.
   */
  publicBody?: boolean;
}
/**
 * The organization the body governs, for corporate and nonprofit boards.
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
 * The public body's jurisdiction, if it is one.
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
 * The meeting at which the item was taken up.
 */
export interface Meeting {
  /**
   * Identifier for the meeting, shared by every item's record from the same meeting.
   */
  id?: string;
  /**
   * regular; special (called for specific business); emergency; annual; closed-session (a meeting or portion closed to the public under a stated legal basis; executive session); or workshop (study session, usually without final action).
   */
  type: "regular" | "special" | "emergency" | "annual" | "closed-session" | "workshop";
  /**
   * When the meeting was scheduled to start, as noticed.
   */
  scheduledStart: string;
  /**
   * When the presiding officer called the meeting to order.
   */
  calledToOrderAt?: string;
  /**
   * When the meeting adjourned.
   */
  adjournedAt?: string;
  /**
   * Where the meeting was held, including any remote access details that were made public.
   */
  location?: string;
  /**
   * Whether members could take part remotely. Whether remote members count toward quorum and may vote depends on the body's rules and, for public bodies, on law.
   */
  remoteParticipation?: boolean;
  /**
   * When public notice of the meeting was posted. Open-meetings laws set minimum notice periods, so this is what shows the notice was timely.
   */
  noticePostedAt?: string;
  /**
   * Whether the public could attend the part of the meeting where the item was taken up.
   */
  openToPublic?: boolean;
  /**
   * The legal basis for closing the meeting to the public, cited as the body cites it, when the item was taken up in closed session.
   */
  closedSessionBasis?: string;
  /**
   * The member id of the presiding officer (chair, mayor, president) for this item.
   */
  presidingOfficerId?: string;
  quorum?: Quorum;
}
/**
 * Whether enough voting members were present to act. Under RONR and most bylaws and statutes, a body without a quorum can't transact business; the validator flags motions recorded as adopted when present is below required.
 */
export interface Quorum {
  /**
   * Voting members needed for a quorum, as set by bylaws, charter or statute (RONR's default for an organization with a defined membership is a majority of the members).
   */
  required: number;
  /**
   * Voting members present when the item was taken up. Can't exceed the voting members listed in members.
   */
  present: number;
}
/**
 * One member of the body.
 */
export interface Member {
  /**
   * Identifier for the member, used by motions, votes and recusals.
   */
  id: string;
  /**
   * The member's name, as it appears in the minutes.
   */
  name: string;
  /**
   * Office or seat.
   */
  seat?: string;
  /**
   * Whether the member has a vote (false for ex officio non-voting members, such as a chief executive on a board or a student member on some school boards).
   */
  voting: boolean;
  /**
   * present; remote (attended by phone or video); absent; excused (absent with the body's leave, which some bodies record differently); or arrived-late (present for this item but not for the whole meeting).
   */
  attendance: "present" | "remote" | "absent" | "excused" | "arrived-late";
}
/**
 * The item the body took up, as published on the agenda.
 */
export interface AgendaItem {
  /**
   * The item's number on the agenda.
   */
  number: string;
  /**
   * The item's title as published.
   */
  title: string;
  /**
   * Where the item was on the agenda: consent (routine items adopted together by one motion without debate; any member may ask to remove an item); action; public-hearing; discussion; report (received for information); or closed-session.
   */
  section?: "consent" | "action" | "public-hearing" | "discussion" | "report" | "closed-session";
  /**
   * The staff or sponsor summary of the item.
   */
  summary?: string;
  sponsor?: Person;
  attachmentIds?: AttachmentIds;
  /**
   * Comments from the public on the item, summarized as the minutes would.
   */
  publicComments?: PublicComment[];
}
/**
 * Who brought the item (a member, a department head, a committee).
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
 * One comment.
 */
export interface PublicComment {
  /**
   * The speaker's name as they gave it; leave out when they didn't give one. Public comment is often a public record, but publish names only as your body's practice and law allow.
   */
  speaker?: string;
  /**
   * support, oppose or neutral.
   */
  position?: "support" | "oppose" | "neutral";
  /**
   * in-person, remote or written.
   */
  format?: "in-person" | "remote" | "written";
  /**
   * What the speaker said, in brief.
   */
  summary: string;
}
/**
 * A motion: who made and seconded it, how it was voted on, the threshold it needed and the result.
 */
export interface Motion {
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  id: string;
  /**
   * main (brings business before the body); amend; substitute (an amendment that replaces the whole text); refer (to a committee); postpone (to a set time; postpone indefinitely is other); table (lay on the table); take-from-table; reconsider; rescind (or amend something previously adopted); or other.
   */
  kind:
    | "main"
    | "amend"
    | "substitute"
    | "refer"
    | "postpone"
    | "table"
    | "take-from-table"
    | "reconsider"
    | "rescind"
    | "other";
  /**
   * The motion as stated by the mover or as the chair put the question.
   */
  text: string;
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  appliesToMotionId?: string;
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  movedBy: string;
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  secondedBy?: string;
  /**
   * voice; roll-call (each member's vote called and recorded by name); show-of-hands; ballot; electronic; or unanimous-consent (the chair asks if there is any objection and, hearing none, declares the motion adopted; RONR calls this general consent).
   */
  voteMethod?: "voice" | "roll-call" | "show-of-hands" | "ballot" | "electronic" | "unanimous-consent";
  /**
   * The vote needed to adopt, as set by RONR, bylaws or law. majority-of-votes-cast: more yes than no votes (RONR's default majority vote; abstentions don't count). two-thirds-of-votes-cast: yes at least twice no (RONR's two-thirds vote). majority-of-members-present and two-thirds-of-members-present: of the members present, so an abstention has the same effect as a no. majority-of-entire-membership and two-thirds-of-entire-membership: of all members in office, present or not. unanimous: no votes against. other: anything else (describe it in extensions).
   */
  threshold?:
    | "majority-of-votes-cast"
    | "two-thirds-of-votes-cast"
    | "majority-of-members-present"
    | "two-thirds-of-members-present"
    | "majority-of-entire-membership"
    | "two-thirds-of-entire-membership"
    | "unanimous"
    | "other";
  /**
   * Each member's vote. For a roll call, list every voting member, using absent or recused for those who didn't vote, so the record is complete (the validator checks this).
   */
  votes?: Vote[];
  tally?: Tally;
  /**
   * adopted; failed (RONR: the motion is lost); withdrawn (by the mover); ruled-out-of-order (by the chair); died-for-lack-of-second; tabled; postponed; or referred. The last three are for a motion disposed of by a secondary motion. The validator checks adopted and failed against the threshold.
   */
  result:
    | "adopted"
    | "failed"
    | "withdrawn"
    | "ruled-out-of-order"
    | "died-for-lack-of-second"
    | "tabled"
    | "postponed"
    | "referred";
  /**
   * When the chair announced the result.
   */
  decidedAt?: string;
}
/**
 * One member's vote.
 */
export interface Vote {
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  memberId: string;
  /**
   * yes; no; abstain (present but declined to vote; RONR doesn't count it as a vote cast); absent (not present for this vote); or recused (stepped aside for a conflict; needs a matching entry in recusals).
   */
  vote: "yes" | "no" | "abstain" | "absent" | "recused";
}
/**
 * The counted result, as announced. Must match the individual votes when both are given.
 */
export interface Tally {
  /**
   * Votes in favor.
   */
  yes: number;
  /**
   * Votes against.
   */
  no: number;
  /**
   * Members who abstained. Counted 0 when left out.
   */
  abstain?: number;
  /**
   * Members absent for the vote. Counted 0 when left out.
   */
  absent?: number;
  /**
   * Members recused from the vote. Counted 0 when left out.
   */
  recused?: number;
}
/**
 * One member's recusal.
 */
export interface Recusal {
  /**
   * A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.
   */
  memberId: string;
  /**
   * financial-interest; family-relationship; employment (the member or a relative works for a party); prior-involvement (for example having acted as an advocate on the matter); appearance-of-conflict; or other.
   */
  reason:
    | "financial-interest"
    | "family-relationship"
    | "employment"
    | "prior-involvement"
    | "appearance-of-conflict"
    | "other";
  /**
   * The disclosure, as stated on the record.
   */
  detail?: string;
  /**
   * When the conflict was disclosed.
   */
  disclosedAt?: string;
  /**
   * Whether the member left the room during discussion and vote, as some laws and policies require.
   */
  leftRoom?: boolean;
}
/**
 * What the body decided on the item, as the minutes and any public summary will state it. The validator checks an approval is backed by an adopted motion.
 */
export interface Outcome {
  /**
   * approved; approved-as-amended; denied; continued (to a later meeting, see continuedTo); referred (to a committee or staff); tabled (laid aside); received-and-filed (accepted for information, no action); or no-action.
   */
  result:
    | "approved"
    | "approved-as-amended"
    | "denied"
    | "continued"
    | "referred"
    | "tabled"
    | "received-and-filed"
    | "no-action";
  /**
   * The resolution, ordinance or minute order number assigned to the action.
   */
  actionNumber?: string;
  /**
   * When the action takes effect.
   */
  effectiveOn?: string;
  /**
   * The date the item was continued to, if continued.
   */
  continuedTo?: string;
  /**
   * The decision in plain words, as it will appear in the minutes.
   */
  summary?: string;
}
/**
 * The state of the minutes that record this action. Minutes are the official record once the body approves them.
 */
export interface Minutes {
  /**
   * draft; approved (by the body, usually at its next meeting); or published.
   */
  status: "draft" | "approved" | "published";
  /**
   * When the body approved the minutes.
   */
  approvedAt?: string;
  /**
   * Where the published minutes can be read.
   */
  uri?: string;
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
  by?: Person1;
  /**
   * Why the status changed, in a sentence, especially for changes a reader wouldn't expect (a reopened review, a withdrawn item).
   */
  reason?: string;
}
/**
 * Who changed the status. Leave out where naming the person would break a promise of anonymity (see patient-safety-incident).
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
  actor: Person2;
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
 * Local fields this format doesn't define, namespaced as <namespace>:<field>, for example examplecity:councilDistrict.
 */
export interface Extensions {}
