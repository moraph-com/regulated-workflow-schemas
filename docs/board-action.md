<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Board action

The record of one agenda item taken up by a board, council, commission or committee: the meeting, who attended, the motions made, who moved and seconded them, each member's vote, recusals and the outcome. Informed by parliamentary procedure as described in Robert's Rules of Order and by common open-meetings practice. Works for corporate boards and public bodies alike.

- Schema: [`schemas/board-action.schema.json`](../schemas/board-action.schema.json)
- `$id`: `https://raw.githubusercontent.com/moraph-com/regulated-workflow-schemas/v0.1.0/schemas/board-action.schema.json`
- `recordType`: `board-action`, `schemaVersion`: `0.1.0`
- Examples: [`examples/board-action/`](../examples/board-action/)

## Informed by

- Parliamentary procedure as described in *Robert's Rules of Order*: main and secondary motions, seconds, vote thresholds, the presiding officer.
- Common open-meetings practice for public bodies: notice, quorum, open and closed sessions with a stated basis, public comment, recusal on the record, minutes.

One record covers one agenda item. A meeting with ten items produces ten records that share `meeting.id`. Members are listed with ids so motions, votes and recusals can refer to them and be checked.

## Fields

Required means required whenever the containing object is present. Types in links are shared definitions in [common.md](common.md).

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | string (uri) |  | The $id of this schema, so readers can tell what the record is. |
| `recordType` | `"board-action"` | yes | Always board-action. |
| `schemaVersion` | `"0.1.0"` | yes | The version of this format the record follows. |
| `id` | string (identifier) | yes | This record's identifier, unique within the system that created it. |
| `externalIds` | array of [External identifier](common.md#external-identifier) |  | Ids for this action in other systems, for example a legislative management or board portal system. |
| `createdAt` | string (date-time) |  | When the record was created. |
| `updatedAt` | string (date-time) |  | When the record was last changed. |
| `body` | object | yes | The board, council, commission or committee that acted. |
| `body.id` | string (identifier) |  | Identifier for the body. |
| `body.name` | string | yes | The body's name, for example Board of Directors or Planning Commission. |
| `body.type` | enum | yes | board-of-directors, board-committee, board-of-trustees, city-council, county-board, school-board, planning-commission, authority-board, advisory-committee or other. |
| `body.organization` | [Organization](common.md#organization) |  | The organization the body governs, for corporate and nonprofit boards. |
| `body.jurisdiction` | [Jurisdiction](common.md#jurisdiction) |  | The public body's jurisdiction, if any. |
| `body.publicBody` | boolean |  | Whether open-meetings law applies to the body. |
| `meeting` | object | yes | The meeting at which the item was taken up. |
| `meeting.id` | string (identifier) |  | Identifier for the meeting. |
| `meeting.type` | enum | yes | regular, special, emergency, annual, closed-session or workshop. |
| `meeting.scheduledStart` | string (date-time) | yes | When the meeting was scheduled to start. |
| `meeting.calledToOrderAt` | string (date-time) |  | When the meeting was called to order. |
| `meeting.adjournedAt` | string (date-time) |  | When the meeting adjourned. |
| `meeting.location` | string |  | Where the meeting was held, including any remote access details made public. |
| `meeting.remoteParticipation` | boolean |  | Whether members could take part remotely. |
| `meeting.noticePostedAt` | string (date-time) |  | When public notice of the meeting was posted. |
| `meeting.openToPublic` | boolean |  | Whether the public could attend this part of the meeting. |
| `meeting.closedSessionBasis` | string |  | The legal basis for closing the meeting, as cited locally, when it was closed. |
| `meeting.presidingOfficerId` | string (identifier) |  | The member id of the presiding officer. |
| `meeting.quorum` | object |  | Whether enough voting members were present to act. |
| `meeting.quorum.required` | integer | yes | Voting members needed for a quorum. |
| `meeting.quorum.present` | integer | yes | Voting members present when the item was taken up. |
| `members` | array of object | yes | Every member of the body for this meeting and whether they attended. Motions, votes and recusals refer to members by id. |
| `members[].id` | string (identifier) | yes | Identifier for the member, used by motions, votes and recusals. |
| `members[].name` | string | yes | The member's name. |
| `members[].seat` | string |  | Office or seat, for example Chair, District 3 or Independent Director. |
| `members[].voting` | boolean | yes | Whether the member has a vote (false for ex officio non-voting members). |
| `members[].attendance` | enum | yes | present, remote, absent, excused or arrived-late. |
| `agendaItem` | object | yes | The item the body took up. |
| `agendaItem.number` | string | yes | The item's number on the agenda, for example 7.b. |
| `agendaItem.title` | string | yes | The item's title as published. |
| `agendaItem.section` | enum |  | consent, action, public-hearing, discussion, report or closed-session. |
| `agendaItem.summary` | string |  | The staff or sponsor summary of the item. |
| `agendaItem.sponsor` | [Person](common.md#person) |  | Who brought the item. |
| `agendaItem.attachmentIds` | array of string (identifier) |  | Ids of related entries in the record's attachments. |
| `agendaItem.publicComments` | array of object |  | Comments from the public on the item. |
| `agendaItem.publicComments[].speaker` | string |  | The speaker's name as given; leave out when they did not give one. |
| `agendaItem.publicComments[].position` | enum |  | support, oppose or neutral. |
| `agendaItem.publicComments[].format` | enum |  | in-person, remote or written. |
| `agendaItem.publicComments[].summary` | string | yes | What the speaker said, in brief. |
| `motions` | array of object |  | Motions made on the item, in the order they were made. |
| `motions[].id` | string (identifier) | yes | Identifier for the motion, unique within the record. |
| `motions[].kind` | enum | yes | main, amend, substitute, refer, postpone, table, take-from-table, reconsider, rescind or other. |
| `motions[].text` | string | yes | The motion as stated. |
| `motions[].appliesToMotionId` | string (identifier) |  | The motion this one applies to (for amendments, referrals and other secondary motions). |
| `motions[].movedBy` | string (identifier) | yes | The member id of the mover. |
| `motions[].secondedBy` | string (identifier) |  | The member id of the seconder. |
| `motions[].voteMethod` | enum |  | voice, roll-call, show-of-hands, ballot, electronic or unanimous-consent. |
| `motions[].threshold` | enum |  | The vote needed to adopt: majority-of-votes-cast, majority-of-members, two-thirds-of-votes-cast, two-thirds-of-members, unanimous or other. |
| `motions[].votes` | array of object |  | Each member's vote. Members who were absent or recused are listed with that value so the record is complete. |
| `motions[].votes[].memberId` | string (identifier) | yes | The member's id in members. |
| `motions[].votes[].vote` | enum | yes | yes, no, abstain, absent or recused. |
| `motions[].tally` | object |  | The counted result. Must match the individual votes when they are given. |
| `motions[].tally.yes` | integer | yes | Votes in favor. |
| `motions[].tally.no` | integer | yes | Votes against. |
| `motions[].tally.abstain` | integer |  | Abstentions. |
| `motions[].tally.absent` | integer |  | Members absent for the vote. |
| `motions[].tally.recused` | integer |  | Members recused from the vote. |
| `motions[].result` | enum | yes | adopted, failed, withdrawn, ruled-out-of-order, died-for-lack-of-second, tabled, postponed or referred. |
| `motions[].decidedAt` | string (date-time) |  | When the decision was made. |
| `recusals` | array of object |  | Members who stepped aside from the item, and why. |
| `recusals[].memberId` | string (identifier) | yes | The member's id in members. |
| `recusals[].reason` | enum | yes | financial-interest, family-relationship, employment, prior-involvement, appearance-of-conflict or other. |
| `recusals[].detail` | string |  | The disclosure, as stated on the record. |
| `recusals[].disclosedAt` | string (date-time) |  | When the conflict was disclosed. |
| `recusals[].leftRoom` | boolean |  | Whether the member left during discussion and vote. |
| `outcome` | object |  | What the body decided on the item. |
| `outcome.result` | enum | yes | approved, approved-as-amended, denied, continued, referred, tabled, received-and-filed or no-action. |
| `outcome.actionNumber` | string |  | The resolution, ordinance or minute order number assigned. |
| `outcome.effectiveOn` | string (date) |  | When the action takes effect. |
| `outcome.continuedTo` | string (date) |  | The date the item was continued to, if continued. |
| `outcome.summary` | string |  | The decision in plain words, as it will appear in the minutes. |
| `minutes` | object |  | The state of the minutes that record this action. |
| `minutes.status` | enum | yes | draft, approved or published. |
| `minutes.approvedAt` | string (date-time) |  | When the minutes were approved. |
| `minutes.uri` | string (uri) |  | Where the published minutes can be read. |
| `status` | enum | yes | scheduled, in-progress, decided, minutes-approved or withdrawn. |
| `statusHistory` | array of [Status change](common.md#status-change) |  | Every status the record has had, oldest first, each one of the values of status. |
| `attachments` | array of [Attachment](common.md#attachment) |  | Files that belong to the item: staff reports, draft resolutions, presentations. |
| `auditTrail` | array of [Audit entry](common.md#audit-entry) |  | Recorded actions on the record, oldest first. |
| `extensions` | [Extensions](common.md#extensions) |  | Local fields this format doesn't define, namespaced as &lt;namespace&gt;:&lt;field&gt;. |

## Conditional requirements

None.

## Cross-field rules

JSON Schema can't check these; the validator in this package does (`rws-validate`, or `validate()` without `schemaOnly`).

| Rule | Checks that |
| --- | --- |
| `unique-ids` | Members, motions and attachments each have ids that are unique within their list. |
| `member-exists` | Every member id used (presiding officer, mover, seconder, voters, recusals) is in members. |
| `attachment-exists` | Every attachment id on the agenda item is in attachments. |
| `second-differs` | A member does not second their own motion. |
| `no-second-recorded` | A motion that died for lack of a second has no secondedBy. |
| `recused-not-acting` | A recused member does not move or second a motion. |
| `motion-exists` | appliesToMotionId names another motion on the item, not the motion itself. |
| `one-vote-each` | Each member has at most one vote per motion. |
| `voting-member` | Only voting members cast a vote (non-voting members may be listed as absent). |
| `present-to-vote` | A member whose attendance is absent or excused has no yes, no or abstain vote. |
| `recused-vote` | A recused member's vote is recorded as recused. |
| `recusal-recorded` | A vote of recused has a matching entry in recusals. |
| `tally-matches-votes` | When both are given, the tally agrees with the individual votes. |
| `threshold-met` | A motion adopted or failed under a stated threshold has counts that agree: votes cast (yes against no, abstentions not counted), unanimous (no votes against), or members (the voting members listed in members). Checked only when the threshold and the votes or tally are given. |
