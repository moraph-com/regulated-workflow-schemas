<!-- Generated from schemas/ by scripts/build-docs.mjs. Do not edit by hand: run npm run docs. -->
# Common definitions

Building blocks shared by every record format in this repository: identifiers, dates, codes, people and organizations, money, places, attachments, status history, audit trail and extensions. Each format refers to these with `common.schema.json#/$defs/<name>`, so a person, an amount of money or an attachment looks the same in a vendor review as in a permit, and code written for one works for all. Fields that can hold personal data or free text are marked with the annotation keyword `x-sensitivity` (`personal` or `free-text`), which validators ignore and redaction or export tools can read.

Schema: [`schemas/common.schema.json`](../schemas/common.schema.json). Refer to these from your own schemas with `common.schema.json#/$defs/<name>`.

## Identifier

`#/$defs/identifier`: A stable identifier for a record or for an item inside one (a finding, a motion, an attachment). Letters, digits and . _ : - only, starting with a letter or digit, up to 128 characters, so it is safe in URLs, file names and spreadsheet cells without escaping. Ids inside a record (for example `f1` for a finding) need only be unique within their list, and the validator checks that. Ids of whole records should be unique within the system that issues them; use a UUID or ULID when records from several systems will be combined.

Type: string. Pattern: `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`.

## External identifier

`#/$defs/externalId`: An identifier assigned by another system or registry, kept so a record can be matched to the same thing elsewhere without guessing from names. Use it for registry numbers (a Legal Entity Identifier, a tax id) and for the record's id in a source or destination system.

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `scheme` | string | yes |  | Who assigned the value: a registry (LEI, EIN, DUNS, UEI, company-number, NPI, CCN) or a system's name (for example riverbend-permits). Use the same spelling every time so values can be matched across records. Not validated against a list, because registries differ by country. Examples: `LEI`, `EIN`, `UEI`, `NPI`, `company-number`, `riverbend-permits`. |
| `value` | string | yes |  | The identifier exactly as the scheme writes it, including any punctuation (for example 12-3456789 for an EIN). Examples: `5493001KJTIIGC8Y1R12`, `12-3456789`. |

## Date

`#/$defs/date`: A calendar date with no time of day (RFC 3339 full-date, YYYY-MM-DD), for things that happen on a day rather than at an instant: due dates, expiry dates, effective dates. A date has no time zone; where the zone matters (a statutory deadline), the format says which zone the date is in.

Type: string. Format: `date`. Examples: `2026-03-04`.

## Date and time

`#/$defs/dateTime`: An instant (RFC 3339 date-time) with its UTC offset, so systems in different time zones agree on when something happened. Write local time with its offset (2026-06-10T19:41:00-07:00) or UTC with Z; both name the same instant. A time without an offset is rejected because it is ambiguous.

Type: string. Format: `date-time`. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`.

## Country code

`#/$defs/countryCode`: ISO 3166-1 alpha-2 country code in upper case, for example US, GB, DE or IN. Codes are used instead of names so records sort, filter and compare across languages. The pattern checks the shape only; it doesn't reject unassigned codes.

Type: string. Pattern: `^[A-Z]{2}$`. Examples: `US`, `GB`, `IE`.

## Subdivision code

`#/$defs/subdivisionCode`: ISO 3166-2 subdivision code: the country code, a hyphen, and the subdivision's 1 to 3 letter or digit code, for example US-CA (California), GB-ENG (England) or CA-ON (Ontario). The pattern checks the shape only.

Type: string. Pattern: `^[A-Z]{2}-[A-Z0-9]{1,3}$`. Examples: `US-OR`, `GB-ENG`, `CA-ON`.

## Currency code

`#/$defs/currencyCode`: ISO 4217 alphabetic currency code in upper case, for example USD, EUR or GBP.

Type: string. Pattern: `^[A-Z]{3}$`. Examples: `USD`, `EUR`, `GBP`.

## Money

`#/$defs/money`: An amount of money in a stated currency. The amount is a decimal string, not a JSON number, because many JSON parsers read numbers as binary floating point, which can't represent 0.10 exactly and silently changes amounts like 1412.60. Keep money as a string end to end and convert with a decimal library.

Example:

```json
{
  "currency": "USD",
  "amount": "1412.60"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `currency` | string (currency code) | yes |  | The currency the amount is in (ISO 4217). Examples: `USD`, `EUR`, `GBP`. |
| `amount` | string | yes |  | The amount in the currency's major unit (dollars, not cents), as a decimal string: an optional minus sign, digits with no leading zeros, and an optional fractional part. No thousands separators, plus signs or exponents. Negative amounts are for refunds and credits. Write as many decimal places as the source system holds; this format doesn't round. Examples: `1250.00`, `-15.5`, `0`. |

## Email address

`#/$defs/email`: An email address (RFC 5321 form). Addresses with non-ASCII characters in the local part are not accepted by this format.

Type: string. Format: `email`. Examples: `clerk@city.example`.

## Person

`#/$defs/personRef`: A person acting in a role on the record: an approver, a reviewer, an inspector, a contact. Only `name` is required, and the rest is optional on purpose: give what readers of the record need and no more, because every field here is personal data that travels wherever the record goes. `name` is one string so names from any culture fit without being split into given and family names.

Example:

```json
{
  "name": "Morgan Example",
  "title": "Chief Risk Officer"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `id` | string (identifier) |  |  | The person's id in the system the reference comes from (an HR system, a directory, a member roster), so the same person can be matched across records without relying on the spelling of their name. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `name` | string | yes | personal | The person's name as it should appear on the record, in the order and script the person uses. A role description (Building Official, Charge nurse) is acceptable where the record shouldn't name an individual. Examples: `Morgan Example`, `Building Official`. |
| `title` | string |  |  | Job title or position, for example Chief Risk Officer or Plans Examiner. Often more useful to a later reader than the name, because people change jobs. Examples: `Chief Risk Officer`, `Plans Examiner II`. |
| `organization` | string |  |  | The name of the organization the person acts for, when it isn't obvious from the record (for example an outside engineer on a permit). |
| `email` | string (email) |  | personal | Work email address, when readers need to contact the person. Example: `clerk@city.example`. |
| `phone` | string |  | personal | Work phone number, ideally in E.164 international form (+ then country code and number, no spaces), which every phone system can dial. Free text is accepted because extensions and local formats are common. Example: `+15555550123`. |

## Organization

`#/$defs/organizationRef`: An organization: a company, agency, facility operator, contractor or other legal entity. `name` is what people read; `identifiers` are what systems match on.

Example:

```json
{
  "name": "Ledgerline Payroll (fictional)",
  "identifiers": [
    {
      "scheme": "EIN",
      "value": "00-0000000"
    }
  ],
  "country": "US"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `id` | string (identifier) |  |  | The organization's id in the system the reference comes from (a vendor master, a contractor registry). Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `name` | string | yes |  | The name the organization is known by and trades under. Use legalName as well when the registered name differs. |
| `legalName` | string |  |  | The registered legal name, when it differs from the name (for example Ledgerline Payroll Services, Inc. for Ledgerline Payroll). Contracts and registry lookups use this name. |
| `identifiers` | array of [External identifier](common.md#external-identifier) |  |  | Registry identifiers for the organization, such as a Legal Entity Identifier (LEI), US Employer Identification Number (EIN), Unique Entity ID (UEI, used in US federal awards), DUNS number or national company number. Prefer an LEI where one exists: it is global and its reference data is public. |
| `country` | string (country code) |  |  | The country where the organization is established or registered. Examples: `US`, `GB`, `IE`. |
| `website` | string (uri) |  |  | The organization's public website, as an absolute URI including https://. Example: `https://ledgerline.example`. |

## Postal address

`#/$defs/address`: A postal address that works in any country: free-text street lines plus optional locality, region and postal code, and a required country. Countries order and name address parts differently, so this format doesn't split house numbers or street names. When a record is about a person's home, remember that the address is personal data.

Example:

```json
{
  "lines": [
    "118 Alder Way"
  ],
  "locality": "Riverbend",
  "region": "OR",
  "postalCode": "97000",
  "country": "US"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `lines` | array of string | yes |  | The street part of the address, one line per entry, in the order the local postal service expects (most specific first in most countries). Include building, unit, street and any district line here. |
| `locality` | string |  |  | City, town or village. Example: `Riverbend`. |
| `region` | string |  |  | State, province, county or prefecture as written locally (OR, Ontario, Kent). Use the jurisdiction's subdivision code where you need a code. Examples: `OR`, `Ontario`. |
| `postalCode` | string |  |  | ZIP or postal code as written locally, including any space or hyphen. Examples: `97000`, `ZZ1 1ZZ`. |
| `country` | string (country code) | yes |  | The country of the address. Examples: `US`, `GB`, `IE`. |

## Geographic point

`#/$defs/geoPoint`: A point on the earth in WGS 84 latitude and longitude, decimal degrees (the system GPS and web maps use). Give at least five decimal places (about one metre) when the point locates a site.

Example:

```json
{
  "latitude": 44.05207,
  "longitude": -123.08675
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `latitude` | number | yes |  | Degrees north (positive) or south (negative) of the equator, -90 to 90. |
| `longitude` | number | yes |  | Degrees east (positive) or west (negative) of the prime meridian, -180 to 180. |

## Jurisdiction

`#/$defs/jurisdiction`: Where a rule applies or an authority acts: a country, optionally narrowed to an ISO 3166-2 subdivision and a named locality, and the agency or body that acts. Used for the permitting authority, a public body's jurisdiction and a facility's regulator.

Example:

```json
{
  "country": "US",
  "subdivision": "US-OR",
  "locality": "City of Riverbend",
  "authority": "Development Services Department"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `country` | string (country code) | yes |  | The country. Examples: `US`, `GB`, `IE`. |
| `subdivision` | string (subdivision code) |  |  | The state, province or other ISO 3166-2 subdivision, when the rules or the authority are subnational. Examples: `US-OR`, `GB-ENG`, `CA-ON`. |
| `locality` | string |  |  | The city, county, borough or district, as the authority itself writes its name. Examples: `City of Riverbend`, `Example Borough Council`. |
| `authority` | string |  |  | The agency, department or body that exercises the jurisdiction. Examples: `Department of Building Safety`, `State Department of Health`. |

## Attachment

`#/$defs/attachment`: A file that belongs to the record: a report, a plan set, a staff report, a photograph. The record carries the file's SHA-256 digest rather than the file itself, so anyone holding a copy can confirm it is byte for byte the file the record refers to, and the record stays small. Other parts of the record point at attachments by id (the validator checks those ids exist).

Example:

```json
{
  "id": "doc-plans",
  "title": "Architectural plans, revision 2",
  "mediaType": "application/pdf",
  "sha256": "f4282100b56efa34e5c7870445b86b4f3408a83f29cbcd92868dc8f03173a234",
  "classification": "public"
}
```

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `id` | string (identifier) | yes |  | Identifier for the attachment, unique within the record's attachments, used by documents, assessments and agenda items to point at it. Examples: `PSI-2026-00871`, `f1`, `01J9ZQ4V6X3W7N8R5T2Y0KABCD`, `3f2b8c1e-5d4a-4f6b-9a7c-2e1d0b9c8a7f`. |
| `title` | string | yes |  | What the file is, in a few words a reader will recognize. Examples: `Structural calculations`, `SOC 2 Type 2 report, 2025`. |
| `mediaType` | string | yes |  | The file's IANA media type (MIME type), so readers know how to open it. Examples: `application/pdf`, `image/jpeg`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. |
| `sha256` | string | yes |  | The SHA-256 digest of the file's exact bytes, as 64 lower-case hexadecimal characters (what `sha256sum` or `shasum -a 256` prints). Any change to the file, even re-saving it, changes the digest. Example: `09b9cbec08e1b19ce93e661fd2e6dbda13be9d71ab0b408374db9cf6dadc9648`. |
| `byteSize` | integer |  |  | The file's size in bytes. Optional; useful for checking a transfer before computing the digest. |
| `uri` | string (uri) |  |  | Where an authorized reader can fetch the file, as an absolute URI. Records often travel further than their files should: don't put pre-signed or token-bearing links (that grant access by themselves) in records shared outside the organization. |
| `classification` | enum |  |  | How widely the file may be shared. public: may be published (a staff report, issued plans). internal: staff of the organization only. confidential: named roles only (a vendor's SOC report under NDA). restricted: the most sensitive (security test results, anything with health information). Organizations map their own labels onto these four. |
| `addedAt` | string (date-time) |  |  | When the file was added to the record. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |

## Attachment ids

`#/$defs/attachmentIds`: Ids of entries in the record's attachments, each listed once. The validator checks each id exists.

Type: array.

## Status change

`#/$defs/statusChange`: One change of the record's status: the new status, when, who made it and why. Each format lists its own status values and limits this field to them.

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `status` | string | yes |  | The status the record moved to. |
| `at` | string (date-time) | yes |  | When the status changed. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `by` | [Person](common.md#person) |  | personal | Who changed the status. Leave out where naming the person would break a promise of anonymity (see patient-safety-incident). |
| `reason` | string |  | free-text | Why the status changed, in a sentence, especially for changes a reader wouldn't expect (a reopened review, a withdrawn item). |

## Audit entry

`#/$defs/auditEntry`: One recorded action on the record: who did what, when, and to which field. Systems append entries and never rewrite them, so the trail shows how the record came to say what it says. The audit trail records actions; the status history records only status changes.

| Field | Type | Required | Sensitivity | Description |
| --- | --- | --- | --- | --- |
| `at` | string (date-time) | yes |  | When the action happened. Examples: `2026-03-04T15:20:00Z`, `2026-06-10T19:41:00-07:00`. |
| `actor` | [Person](common.md#person) | yes | personal | Who acted: a person, or a system account named as a person reference (for example name: Nightly import). |
| `action` | string | yes |  | What happened, as a short lower-case verb phrase. Use the same vocabulary across records so trails can be filtered; created, field-changed, attachment-added, approved, exported and viewed cover most systems. Examples: `created`, `field-changed`, `approved`, `exported`. |
| `field` | string |  |  | JSON Pointer (RFC 6901) to the field that changed, when one did. Examples: `/decision/outcome`, `/findings/0/status`. |
| `from` | string |  | free-text | The previous value, as text. Leave out for sensitive fields (narratives, personal data), so the trail doesn't keep a copy of what was deliberately removed. |
| `to` | string |  | free-text | The new value, as text. Leave out for sensitive fields. |
| `note` | string |  | free-text | Free-text context for the action, such as why a value was corrected. |
| `system` | string |  |  | The application that recorded the action, so entries merged from several systems can be traced. Examples: `GRC platform`, `Permit portal`. |

## Extensions

`#/$defs/extensions`: Fields this format doesn't define, for local needs: a cost center, a council district, an internal risk score. Every key is namespaced as <namespace>:<field>, where the namespace is lower-case letters, digits and hyphens chosen by the organization (often its domain name without the dot), so extensions from different organizations never collide. Values may be any JSON. Readers that don't recognize a key must ignore it. If several organizations need the same extension, propose it as a field.

Type: object. Examples: `{"examplecity:councilDistrict":"3","examplebank:costCenter":"HR-210"}`.
