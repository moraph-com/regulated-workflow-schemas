<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Board action

The record of one agenda item taken up by a board, council, commission or committee: the body and meeting, who attended, the motions made, who moved and seconded them, each member's vote, recusals, public comment and the outcome. Motions, thresholds and voting follow the concepts of parliamentary procedure as described in Robert's Rules of Order Newly Revised (RONR); the format records what happened and doesn't require any body to follow RONR, since bylaws, statutes and local rules take precedence. Works for corporate and nonprofit boards and for public bodies.

- Schema: [`schemas/board-action.schema.json`](../schemas/board-action.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json`
- `recordType`: `board-action`, `schemaVersion`: `0.1.0`
- Examples: [`examples/board-action/`](../examples/board-action/)

## Informed by

- **Robert's Rules of Order Newly Revised** (RONR, 12th edition, 2020), the parliamentary authority most US bodies adopt: main and secondary motions, seconds, the presiding officer, general (unanimous) consent, quorum, and the bases for determining a voting result. The thresholds follow RONR's definitions: a majority vote is more than half of the votes cast, and abstentions are not votes cast (RONR 44:1); a two-thirds vote is at least two-thirds of the votes cast (44:3); when a rule requires a majority or two-thirds of the members present or of the entire membership, an abstention has the same effect as a no (44:9). RONR describes a motion that doesn't get the votes it needs as lost; this format calls that result `failed`.
- Conflict-of-interest practice: RONR says a member with a direct personal or pecuniary interest in a question not common to other members should not vote on it, but can't be compelled to abstain (45:4). A **recusal** here is the stronger act that conflict-of-interest laws and policies require of public officials and directors: the member takes no part in the item. An **abstention** is a member taking part but declining to vote.
- Common open-meetings practice for public bodies: notice, quorum, open and closed sessions with a stated basis, public comment, recusal on the record, minutes.

Bylaws, charters, statutes and special rules override RONR, and many bodies follow other authorities. The format records what the body did; the validator's `threshold-met` rule checks only the arithmetic of the threshold the record states.

One record covers one agenda item. A meeting with ten items produces ten records that share `meeting.id`. Members are listed with ids so motions, votes and recusals can refer to them and be checked.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md). Sensitivity is the schema's `x-sensitivity` annotation: `personal` fields identify or contact a person, and `free-text` fields are narrative that may contain anything, including personal data, so screen them before sharing records. Fields of a linked type inherit that type's sensitivity (every [Person](common.md#person) is personal).

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `$schema` | string (uri) |  |  | The `$id` of the schema the record follows, so a reader can tell what the record is without guessing. Optional; recordType and schemaVersion say the same thing. |
| `recordType` | `"board-action"` | yes |  | Always board-action. Lets a reader (or validate()) tell the format apart from the others in this repository. |
| `schemaVersion` | `"0.1.0"` | yes |  | The version of this format the record follows. Each version of the schema accepts only its own version string, so a record never silently passes against a schema it wasn't written for. |
| `id` | string (identifier) | yes |  | This record's identifier, unique within the system that created it. One record covers one agenda item, so a meeting with ten items has ten records sharing meeting.id. Example: `cc-2026-06-10-7b`. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  |  | Ids for this item in other systems, for example a legislative management system's file number or a board portal's item id. |
| `createdAt` | string (date-time) |  |  | When the record was created. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `updatedAt` | string (date-time) |  |  | When the record was last changed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `body` | object | yes |  | The board, council, commission or committee that acted. |
| `body.id` | string (identifier) |  |  | Identifier for the body, so records from many meetings can be grouped. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `body.name` | string | yes |  | The body's name. Examples: `Board of Directors`, `Planning Commission`, `Riverbend City Council`. |
| `body.type` | enum | yes |  | board-of-directors (a corporate or credit union board); board-committee (a committee of a board, such as audit or risk); board-of-trustees (nonprofit, pension or university trustees); city-council; county-board (board of supervisors or commissioners); school-board; planning-commission; authority-board (a public authority, district or agency board); advisory-committee; or other. |
| `body.organization` | [Organization](common.md#organization) |  |  | The organization the body governs, for corporate and nonprofit boards. |
| `body.jurisdiction` | [Jurisdiction](common.md#jurisdiction) |  |  | The public body's jurisdiction, if it is one. |
| `body.publicBody` | boolean |  |  | Whether open-meetings (sunshine) law applies to the body. Public bodies have notice, public access and minutes obligations that private boards don't. |
| `meeting` | object | yes |  | The meeting at which the item was taken up. |
| `meeting.id` | string (identifier) |  |  | Identifier for the meeting, shared by every item's record from the same meeting. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `meeting.type` | enum | yes |  | regular; special (called for specific business); emergency; annual; closed-session (a meeting or portion closed to the public under a stated legal basis; executive session); or workshop (study session, usually without final action). |
| `meeting.scheduledStart` | string (date-time) | yes |  | When the meeting was scheduled to start, as noticed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `meeting.calledToOrderAt` | string (date-time) |  |  | When the presiding officer called the meeting to order. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `meeting.adjournedAt` | string (date-time) |  |  | When the meeting adjourned. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `meeting.location` | string |  |  | Where the meeting was held, including any remote access details that were made public. Example: `Council Chambers, 100 Main St, and by video`. |
| `meeting.remoteParticipation` | boolean |  |  | Whether members could take part remotely. Whether remote members count toward quorum and may vote depends on the body's rules and, for public bodies, on law. |
| `meeting.noticePostedAt` | string (date-time) |  |  | When public notice of the meeting was posted. Open-meetings laws set minimum notice periods, so this is what shows the notice was timely. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `meeting.openToPublic` | boolean |  |  | Whether the public could attend the part of the meeting where the item was taken up. |
| `meeting.closedSessionBasis` | string |  |  | The legal basis for closing the meeting to the public, cited as the body cites it, when the item was taken up in closed session. Example: `California Gov. Code 54956.9(d)(1) (existing litigation)`. |
| `meeting.presidingOfficerId` | string (identifier) |  |  | The member id of the presiding officer (chair, mayor, president) for this item. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `meeting.quorum` | object |  |  | Whether enough voting members were present to act. Under RONR and most bylaws and statutes, a body without a quorum can't transact business; the validator flags motions recorded as adopted when present is below required. |
| `meeting.quorum.required` | integer | yes |  | Voting members needed for a quorum, as set by bylaws, charter or statute (RONR's default for an organization with a defined membership is a majority of the members). |
| `meeting.quorum.present` | integer | yes |  | Voting members present when the item was taken up. Can't exceed the voting members listed in members. |
| `members` | array of object | yes |  | Every member of the body for this meeting, voting and non-voting, with their attendance. Motions, votes and recusals refer to members by id so the validator can check them. Leave vacant seats out: votes based on the entire membership count the members listed here. |
| `members[].id` | string (identifier) | yes |  | Identifier for the member, used by motions, votes and recusals. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `members[].name` | string | yes | personal | The member's name, as it appears in the minutes. |
| `members[].seat` | string |  |  | Office or seat. Examples: `Chair`, `District 3`, `Independent Director`. |
| `members[].voting` | boolean | yes |  | Whether the member has a vote (false for ex officio non-voting members, such as a chief executive on a board or a student member on some school boards). |
| `members[].attendance` | enum | yes |  | present; remote (attended by phone or video); absent; excused (absent with the body's leave, which some bodies record differently); or arrived-late (present for this item but not for the whole meeting). |
| `agendaItem` | object | yes |  | The item the body took up, as published on the agenda. |
| `agendaItem.number` | string | yes |  | The item's number on the agenda. Examples: `7.b`, `4`. |
| `agendaItem.title` | string | yes |  | The item's title as published. Example: `Award of contract for Alder Street water main replacement`. |
| `agendaItem.section` | enum |  |  | Where the item was on the agenda: consent (routine items adopted together by one motion without debate; any member may ask to remove an item); action; public-hearing; discussion; report (received for information); or closed-session. |
| `agendaItem.summary` | string |  | free-text | The staff or sponsor summary of the item. |
| `agendaItem.sponsor` | [Person](common.md#person) |  | personal | Who brought the item (a member, a department head, a committee). |
| `agendaItem.attachmentIds` | array of string (identifier) |  |  | Ids of the item's files in attachments (staff report, draft resolution, presentation). |
| `agendaItem.publicComments` | array of object |  |  | Comments from the public on the item, summarized as the minutes would. |
| `agendaItem.publicComments[].speaker` | string |  | personal | The speaker's name as they gave it; leave out when they didn't give one. Public comment is often a public record, but publish names only as your body's practice and law allow. |
| `agendaItem.publicComments[].position` | enum |  |  | support, oppose or neutral. |
| `agendaItem.publicComments[].format` | enum |  |  | in-person, remote or written. |
| `agendaItem.publicComments[].summary` | string | yes | free-text | What the speaker said, in brief. |
| `motions` | array of object |  |  | Motions made on the item, in the order they were made: the main motion and any secondary motions (amendments, referral, postponement) that applied to it. |
| `motions[].id` | string (identifier) | yes |  | Identifier for the motion, unique within the record, so secondary motions can point at it. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `motions[].kind` | enum | yes |  | main (brings business before the body); amend; substitute (an amendment that replaces the whole text); refer (to a committee); postpone (to a set time; postpone indefinitely is other); table (lay on the table); take-from-table; reconsider; rescind (or amend something previously adopted); or other. |
| `motions[].text` | string | yes | free-text | The motion as stated by the mover or as the chair put the question. |
| `motions[].appliesToMotionId` | string (identifier) |  |  | The motion this one applies to, for amendments, referrals and other secondary motions. Must name another motion in this record. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `motions[].movedBy` | string (identifier) | yes |  | The member id of the mover. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `motions[].secondedBy` | string (identifier) |  |  | The member id of the seconder. Leave out when there was no second or none was needed (RONR's rules for small boards and committees don't require seconds). A member can't second their own motion. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `motions[].voteMethod` | enum |  |  | voice; roll-call (each member's vote called and recorded by name); show-of-hands; ballot; electronic; or unanimous-consent (the chair asks if there is any objection and, hearing none, declares the motion adopted; RONR calls this general consent). |
| `motions[].threshold` | enum |  |  | The vote needed to adopt, as set by RONR, bylaws or law. majority-of-votes-cast: more yes than no votes (RONR's default majority vote; abstentions don't count). two-thirds-of-votes-cast: yes at least twice no (RONR's two-thirds vote). majority-of-members-present and two-thirds-of-members-present: of the members present, so an abstention has the same effect as a no. majority-of-entire-membership and two-thirds-of-entire-membership: of all members in office, present or not. unanimous: no votes against. other: anything else (describe it in extensions). |
| `motions[].votes` | array of object |  |  | Each member's vote. For a roll call, list every voting member, using absent or recused for those who didn't vote, so the record is complete (the validator checks this). |
| `motions[].votes[].memberId` | string (identifier) | yes |  | The member's id in members. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `motions[].votes[].vote` | enum | yes |  | yes; no; abstain (present but declined to vote; RONR doesn't count it as a vote cast); absent (not present for this vote); or recused (stepped aside for a conflict; needs a matching entry in recusals). |
| `motions[].tally` | object |  |  | The counted result, as announced. Must match the individual votes when both are given. |
| `motions[].tally.yes` | integer | yes |  | Votes in favor. |
| `motions[].tally.no` | integer | yes |  | Votes against. |
| `motions[].tally.abstain` | integer |  |  | Members who abstained. Counted 0 when left out. |
| `motions[].tally.absent` | integer |  |  | Members absent for the vote. Counted 0 when left out. |
| `motions[].tally.recused` | integer |  |  | Members recused from the vote. Counted 0 when left out. |
| `motions[].result` | enum | yes |  | adopted; failed (RONR: the motion is lost); withdrawn (by the mover); ruled-out-of-order (by the chair); died-for-lack-of-second; tabled; postponed; or referred. The last three are for a motion disposed of by a secondary motion. The validator checks adopted and failed against the threshold. |
| `motions[].decidedAt` | string (date-time) |  |  | When the chair announced the result. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `recusals` | array of object |  |  | Members who stepped aside from the item because of a conflict of interest, and why. A recusal is required or expected by conflict-of-interest law or policy and means the member takes no part. It differs from an abstention, where a member takes part but declines to vote: RONR (45:4) says a member with a direct personal or pecuniary interest not common to other members should not vote, but can't be compelled to abstain. |
| `recusals[].memberId` | string (identifier) | yes |  | The member's id in members. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `recusals[].reason` | enum | yes |  | financial-interest; family-relationship; employment (the member or a relative works for a party); prior-involvement (for example having acted as an advocate on the matter); appearance-of-conflict; or other. |
| `recusals[].detail` | string |  | free-text | The disclosure, as stated on the record. |
| `recusals[].disclosedAt` | string (date-time) |  |  | When the conflict was disclosed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `recusals[].leftRoom` | boolean |  |  | Whether the member left the room during discussion and vote, as some laws and policies require. |
| `outcome` | object |  |  | What the body decided on the item, as the minutes and any public summary will state it. The validator checks an approval is backed by an adopted motion. |
| `outcome.result` | enum | yes |  | approved; approved-as-amended; denied; continued (to a later meeting, see continuedTo); referred (to a committee or staff); tabled (laid aside); received-and-filed (accepted for information, no action); or no-action. |
| `outcome.actionNumber` | string |  |  | The resolution, ordinance or minute order number assigned to the action. Example: `Resolution 2026-41`. |
| `outcome.effectiveOn` | string (date) |  |  | When the action takes effect. Example: `2026-03-04`. |
| `outcome.continuedTo` | string (date) |  |  | The date the item was continued to, if continued. Example: `2026-03-04`. |
| `outcome.summary` | string |  | free-text | The decision in plain words, as it will appear in the minutes. |
| `minutes` | object |  |  | The state of the minutes that record this action. Minutes are the official record once the body approves them. |
| `minutes.status` | enum | yes |  | draft; approved (by the body, usually at its next meeting); or published. |
| `minutes.approvedAt` | string (date-time) |  |  | When the body approved the minutes. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `minutes.uri` | string (uri) |  |  | Where the published minutes can be read. |
| `status` | enum | yes |  | Where the item is: scheduled (on an agenda); in-progress (taken up, not concluded); decided; minutes-approved (the minutes recording the decision are approved); or withdrawn (removed from the agenda). decided and minutes-approved need an outcome. |
| `statusHistory` | array of [Status change](common.md#status-change) |  |  | Every status the item has had, oldest first, ending at the current status (the validator checks both). |
| `attachments` | array of [Attachment](common.md#attachment) |  |  | Files that belong to the item: staff reports, draft resolutions, bid tabulations, presentations. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  |  | Recorded actions on the record, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;, for example examplecity:councilDistrict. |

## Conditional requirements

None.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Members, motions and attachments each have ids that are unique within their list. |
| `dates-in-order` | Pairs of dates that must be in order are: updatedAt is not before createdAt, plus the format's own pairs listed here. |
| `history-in-order` | statusHistory and auditTrail are oldest first. |
| `history-ends-at-status` | The last entry in statusHistory has the record's current status. |
| `member-exists` | Every member id used (presiding officer, mover, seconder, voters, recusals) is in members. |
| `attachment-exists` | Every attachment id on the agenda item is in attachments. |
| `quorum-consistent` | quorum.present is not more than the number of voting members listed. |
| `quorum-for-action` | No motion is recorded as adopted when quorum.present is below quorum.required. |
| `second-differs` | A member does not second their own motion. |
| `no-second-recorded` | A motion that died for lack of a second has no secondedBy. |
| `recused-not-acting` | A recused member does not move or second a motion. |
| `present-to-act` | A member whose attendance is absent or excused does not move or second a motion. |
| `motion-exists` | appliesToMotionId names another motion on the item, not the motion itself. |
| `one-vote-each` | Each member has at most one vote per motion. |
| `voting-member` | Only voting members cast a vote (non-voting members may be listed as absent). |
| `present-to-vote` | A member whose attendance is absent or excused has no yes, no or abstain vote. |
| `recused-vote` | A recused member's vote is recorded as recused. |
| `recusal-recorded` | A vote of recused has a matching entry in recusals. |
| `roll-call-complete` | A roll-call vote that lists individual votes lists every voting member (as absent or recused if they didn't vote). |
| `tally-matches-votes` | When both are given, the tally agrees with the individual votes. |
| `threshold-met` | A motion adopted or failed under a stated threshold has counts that agree with it: votes cast (yes against no; abstentions are not votes cast), members present (yes against everyone who answered yes, no or abstain; needs individual votes), the entire membership (the voting members listed in members), or unanimous (no votes against). Checked only when the threshold and the votes or tally are given. |
| `outcome-matches-motions` | An outcome of approved has an adopted main or substitute motion, and approved-as-amended also has an adopted amendment or substitute, whenever motions are recorded. |
| `decided-has-outcome` | An item with status decided or minutes-approved has an outcome. |
