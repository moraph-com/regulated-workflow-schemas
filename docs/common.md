<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Common definitions

Building blocks shared by every record format in this repository: identifiers, people and organizations, money, places, attachments, status history, audit trail and extensions.

Schema: [`schemas/common.schema.json`](../schemas/common.schema.json). Refer to these from your own schemas with `common.schema.json#/$defs/<name>`.

## Identifier

`#/$defs/identifier`: A stable identifier for a record or an item inside one. Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters. UUIDs and ULIDs both fit.

Type: string. Pattern: `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`.

## External identifier

`#/$defs/externalId`: An identifier assigned by another system or registry.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `scheme` | string | yes | The registry or system that assigned the value, for example LEI, EIN, DUNS, UEI, company-number, NPI, or a source system's name. |
| `value` | string | yes | The identifier as the scheme writes it. |

## Date

`#/$defs/date`: A calendar date (RFC 3339 full-date, YYYY-MM-DD).

Type: string. Format: `date`.

## Date and time

`#/$defs/dateTime`: An instant with a time-zone offset (RFC 3339 date-time), for example 2026-03-04T15:20:00Z.

Type: string. Format: `date-time`.

## Country code

`#/$defs/countryCode`: ISO 3166-1 alpha-2 country code, upper case.

Type: string. Pattern: `^[A-Z]{2}$`.

## Subdivision code

`#/$defs/subdivisionCode`: ISO 3166-2 subdivision code, for example US-CA or GB-ENG.

Type: string. Pattern: `^[A-Z]{2}-[A-Z0-9]{1,3}$`.

## Currency code

`#/$defs/currencyCode`: ISO 4217 alphabetic currency code, upper case.

Type: string. Pattern: `^[A-Z]{3}$`.

## Money

`#/$defs/money`: An amount of money. The amount is a decimal string so no precision is lost to floating point.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `currency` | string (currency code) | yes | The currency. |
| `amount` | string | yes | Decimal amount in the currency's major unit, as a string, for example "1250.00" or "-15.5". |

## Email address

`#/$defs/email`: An email address.

Type: string. Format: `email`.

## Person

`#/$defs/personRef`: A person acting in a role on the record. Give an id when the person exists in another system; the name is what people read.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string (identifier) |  | Identifier in the system the reference comes from. |
| `name` | string | yes | The person's name as it should appear on the record. |
| `title` | string |  | Job title or position, for example Chief Risk Officer. |
| `organization` | string |  | The organization the person acts for, by name. |
| `email` | string (email) |  | Email address. |
| `phone` | string |  | Phone number, ideally in E.164 form (+15555550123). |

## Organization

`#/$defs/organizationRef`: An organization: a company, agency, facility operator or other legal entity.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string (identifier) |  | Identifier in the system the reference comes from. |
| `name` | string | yes | The name the organization trades under. |
| `legalName` | string |  | The registered legal name, when it differs from the name. |
| `identifiers` | array of [External identifier](common.md#external-identifier) |  | Registry identifiers such as LEI, EIN, DUNS or UEI. |
| `country` | string (country code) |  | Country. |
| `website` | string (uri) |  | The organization's public website. |

## Postal address

`#/$defs/address`: A postal address.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `lines` | array of string | yes | Street address lines, most specific first. |
| `locality` | string |  | City, town or village. |
| `region` | string |  | State, province or county as written locally. |
| `postalCode` | string |  | ZIP or postal code. |
| `country` | string (country code) | yes | Country. |

## Geographic point

`#/$defs/geoPoint`: A WGS 84 latitude and longitude in decimal degrees.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `latitude` | number | yes | Decimal degrees, -90 to 90. |
| `longitude` | number | yes | Decimal degrees, -180 to 180. |

## Jurisdiction

`#/$defs/jurisdiction`: Where a rule applies or an authority acts: a country, optionally narrowed to an ISO 3166-2 subdivision and a named locality.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `country` | string (country code) | yes | Country. |
| `subdivision` | string (subdivision code) |  | State, province or other ISO 3166-2 subdivision. |
| `locality` | string |  | City, county or district name, as the authority writes it. |
| `authority` | string |  | The agency or body with jurisdiction, for example Department of Building Safety. |

## Attachment

`#/$defs/attachment`: A document or file that belongs to the record. The SHA-256 digest lets anyone confirm the file they hold is the one the record refers to.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string (identifier) | yes | Identifier in the system the reference comes from. |
| `title` | string | yes | What the file is, in a few words. |
| `mediaType` | string | yes | IANA media type, for example application/pdf. |
| `sha256` | string | yes | Lower-case hex SHA-256 digest of the file's bytes. |
| `byteSize` | integer |  | The file's size in bytes. |
| `uri` | string (uri) |  | Where an authorized reader can fetch the file. Records shared outside the organization should not carry links that grant access by themselves. |
| `classification` | enum |  | How the file may be shared: public, internal, confidential or restricted. |
| `addedAt` | string (date-time) |  | When the file was added. |

## Attachment ids

`#/$defs/attachmentIds`: Ids of entries in the record's attachments list.

Type: array.

## Status change

`#/$defs/statusChange`: One change of the record's status.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | string | yes | The status the record moved to (one of the record's status values). |
| `at` | string (date-time) | yes | When it happened. |
| `by` | [Person](common.md#person) |  | Who made the change. |
| `reason` | string |  | Why the status changed. |

## Audit entry

`#/$defs/auditEntry`: One recorded action on the record: who did what, when. Systems append entries and never rewrite them.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `at` | string (date-time) | yes | When it happened. |
| `actor` | [Person](common.md#person) | yes | Who acted. |
| `action` | string | yes | What happened, as a short verb phrase, for example created, field-changed, approved, exported. |
| `field` | string |  | JSON Pointer (RFC 6901) to the field that changed, when one did. |
| `from` | string |  | The previous value, as text. Leave out for sensitive fields. |
| `to` | string |  | The new value, as text. Leave out for sensitive fields. |
| `note` | string |  | Free-text context for the action. |
| `system` | string |  | The application that recorded the action. |

## Extensions

`#/$defs/extensions`: Fields this format doesn't define, for local needs. Keys are namespaced as <namespace>:<field> (for example acme:costCenter) so extensions from different organizations never collide. Readers that don't know a key ignore it.

Type: object.
