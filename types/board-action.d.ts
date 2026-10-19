/* Generated from schemas/ by scripts/build-types.mjs. Do not edit by hand: run npm run types. */

/**
 * Ids of related entries in the record's attachments.
 */
export type AttachmentIds = string[];

/**
 * The record of one agenda item taken up by a board, council, commission or committee: the meeting, who attended, the motions made, who moved and seconded them, each member's vote, recusals and the outcome. Informed by parliamentary procedure as described in Robert's Rules of Order and by common open-meetings practice. Works for corporate boards and public bodies alike.
 */
export interface BoardAction {
  /**
   * The $id of this schema, so readers can tell what the record is.
   */
  $schema?: string;
  /**
   * Always board-action.
   */
  recordType: "board-action";
  /**
   * The version of this format the record follows.
   */
  schemaVersion: "0.1.0";
  /**
   * This record's identifier, unique within the system that created it.
   */
  id: string;
  /**
   * Ids for this action in other systems, for example a legislative management or board portal system.
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
   * Every member of the body for this meeting and whether they attended. Motions, votes and recusals refer to members by id.
   *
   * @minItems 1
   */
  members: [Member, ...Member[]];
  agendaItem: AgendaItem;
  /**
   * Motions made on the item, in the order they were made.
   */
  motions?: Motion[];
  /**
   * Members who stepped aside from the item, and why.
   */
  recusals?: Recusal[];
  outcome?: Outcome;
  minutes?: Minutes;
  /**
   * scheduled, in-progress, decided, minutes-approved or withdrawn.
   */
  status: "scheduled" | "in-progress" | "decided" | "minutes-approved" | "withdrawn";
  /**
   * Every status the record has had, oldest first.
   */
  statusHistory?: StatusChange[];
  /**
   * Files that belong to the item: staff reports, draft resolutions, presentations.
   */
  attachments?: Attachment[];
  /**
   * Recorded actions on the record, oldest first.
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
 * The board, council, commission or committee that acted.
 */
export interface Body {
  /**
   * Identifier for the body.
   */
  id?: string;
  /**
   * The body's name, for example Board of Directors or Planning Commission.
   */
  name: string;
  /**
   * board-of-directors, board-committee, board-of-trustees, city-council, county-board, school-board, planning-commission, authority-board, advisory-committee or other.
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
   * Whether open-meetings law applies to the body.
   */
  publicBody?: boolean;
}
/**
 * The organization the body governs, for corporate and nonprofit boards.
 */
export interface Organization {
  /**
   * Identifier in the system the reference comes from.
   */
  id?: string;
  /**
   * The name the organization trades under.
   */
  name: string;
  /**
   * The registered legal name, when it differs from the name.
   */
  legalName?: string;
  /**
   * Registry identifiers such as LEI, EIN, DUNS or UEI.
   */
  identifiers?: ExternalIdentifier[];
  /**
   * Country.
   */
  country?: string;
  /**
   * The organization's public website.
   */
  website?: string;
}
/**
 * The public body's jurisdiction, if any.
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
 * The meeting at which the item was taken up.
 */
export interface Meeting {
  /**
   * Identifier for the meeting.
   */
  id?: string;
  /**
   * regular, special, emergency, annual, closed-session or workshop.
   */
  type: "regular" | "special" | "emergency" | "annual" | "closed-session" | "workshop";
  /**
   * When the meeting was scheduled to start.
   */
  scheduledStart: string;
  /**
   * When the meeting was called to order.
   */
  calledToOrderAt?: string;
  /**
   * When the meeting adjourned.
   */
  adjournedAt?: string;
  /**
   * Where the meeting was held, including any remote access details made public.
   */
  location?: string;
  /**
   * Whether members could take part remotely.
   */
  remoteParticipation?: boolean;
  /**
   * When public notice of the meeting was posted.
   */
  noticePostedAt?: string;
  /**
   * Whether the public could attend this part of the meeting.
   */
  openToPublic?: boolean;
  /**
   * The legal basis for closing the meeting, as cited locally, when it was closed.
   */
  closedSessionBasis?: string;
  /**
   * The member id of the presiding officer.
   */
  presidingOfficerId?: string;
  quorum?: Quorum;
}
/**
 * Whether enough voting members were present to act.
 */
export interface Quorum {
  /**
   * Voting members needed for a quorum.
   */
  required: number;
  /**
   * Voting members present when the item was taken up.
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
   * The member's name.
   */
  name: string;
  /**
   * Office or seat, for example Chair, District 3 or Independent Director.
   */
  seat?: string;
  /**
   * Whether the member has a vote (false for ex officio non-voting members).
   */
  voting: boolean;
  /**
   * present, remote, absent, excused or arrived-late.
   */
  attendance: "present" | "remote" | "absent" | "excused" | "arrived-late";
}
/**
 * The item the body took up.
 */
export interface AgendaItem {
  /**
   * The item's number on the agenda, for example 7.b.
   */
  number: string;
  /**
   * The item's title as published.
   */
  title: string;
  /**
   * consent, action, public-hearing, discussion, report or closed-session.
   */
  section?: "consent" | "action" | "public-hearing" | "discussion" | "report" | "closed-session";
  /**
   * The staff or sponsor summary of the item.
   */
  summary?: string;
  sponsor?: Person;
  attachmentIds?: AttachmentIds;
  /**
   * Comments from the public on the item.
   */
  publicComments?: PublicComment[];
}
/**
 * Who brought the item.
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
 * One comment.
 */
export interface PublicComment {
  /**
   * The speaker's name as given; leave out when they did not give one.
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
 * A motion, its second, the vote and the result.
 */
export interface Motion {
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  id: string;
  /**
   * main, amend, substitute, refer, postpone, table, take-from-table, reconsider, rescind or other.
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
   * The motion as stated.
   */
  text: string;
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  appliesToMotionId?: string;
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  movedBy: string;
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  secondedBy?: string;
  /**
   * voice, roll-call, show-of-hands, ballot, electronic or unanimous-consent.
   */
  voteMethod?: "voice" | "roll-call" | "show-of-hands" | "ballot" | "electronic" | "unanimous-consent";
  /**
   * The vote needed to adopt: majority-of-votes-cast, majority-of-members, two-thirds-of-votes-cast, two-thirds-of-members, unanimous or other.
   */
  threshold?:
    | "majority-of-votes-cast"
    | "majority-of-members"
    | "two-thirds-of-votes-cast"
    | "two-thirds-of-members"
    | "unanimous"
    | "other";
  /**
   * Each member's vote. Members who were absent or recused are listed with that value so the record is complete.
   */
  votes?: Vote[];
  tally?: Tally;
  /**
   * adopted, failed, withdrawn, ruled-out-of-order, died-for-lack-of-second, tabled, postponed or referred.
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
   * When the decision was made.
   */
  decidedAt?: string;
}
/**
 * One member's vote.
 */
export interface Vote {
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  memberId: string;
  /**
   * yes, no, abstain, absent or recused.
   */
  vote: "yes" | "no" | "abstain" | "absent" | "recused";
}
/**
 * The counted result. Must match the individual votes when they are given.
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
   * Abstentions.
   */
  abstain?: number;
  /**
   * Members absent for the vote.
   */
  absent?: number;
  /**
   * Members recused from the vote.
   */
  recused?: number;
}
/**
 * One member's recusal.
 */
export interface Recusal {
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
   */
  memberId: string;
  /**
   * financial-interest, family-relationship, employment, prior-involvement, appearance-of-conflict or other.
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
   * Whether the member left during discussion and vote.
   */
  leftRoom?: boolean;
}
/**
 * What the body decided on the item.
 */
export interface Outcome {
  /**
   * approved, approved-as-amended, denied, continued, referred, tabled, received-and-filed or no-action.
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
   * The resolution, ordinance or minute order number assigned.
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
 * The state of the minutes that record this action.
 */
export interface Minutes {
  /**
   * draft, approved or published.
   */
  status: "draft" | "approved" | "published";
  /**
   * When the minutes were approved.
   */
  approvedAt?: string;
  /**
   * Where the published minutes can be read.
   */
  uri?: string;
}
/**
 * One change of the record's status.
 */
export interface StatusChange {
  /**
   * The status the record moved to (one of the record's status values).
   */
  status: string;
  /**
   * When it happened.
   */
  at: string;
  by?: Person1;
  /**
   * Why the status changed.
   */
  reason?: string;
}
/**
 * Who made the change.
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
 * A document or file that belongs to the record. The SHA-256 digest lets anyone confirm the file they hold is the one the record refers to.
 */
export interface Attachment {
  /**
   * A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.
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
  actor: Person2;
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
 * Local fields this format doesn't define, namespaced as <namespace>:<field>.
 */
export interface Extensions {}
