# Changelog

All notable changes to `@ytf/contracts` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Consumers pin a tag (e.g. `#v0.1.0`), so **every change must bump the version and add an entry**.

## [Unreleased]

## [0.16.0] - 2026-08-18

### Changed
- **The listing `details` schemas now describe what is actually stored.** They had drifted into
  fiction, and because nothing imported them, nothing caught it:
  - `StayDetails` had no `rooms` at all — the field that drives room selection, per-room pricing and
    the `listing::roomType` cart line key.
  - `LearnDetails.certification` was a `string`; every real course stores an object.
  - `ExperienceDetails.includes` never existed under that name (`included` does), and `pickup` was a
    boolean where the app derives hotel pickup by matching text.
  - `bedrooms`, `beds`, and details-level `checkIn` / `checkOut` / `maxGuests` appeared in no row
    anywhere. Removed.
  - Missing entirely: `rooms`, `hostNote`, `honest`, `personas`, `booking`, `roomMax`, `minNights`,
    `gallery`, `videos`, `tags`, `priceSub`, `locationLine`, `about`, `itinerary`, `curriculum`,
    `instructor`, `stayWith`, `faq`, and the card-only `bullets` / `departFrom` / `groupLabel` /
    `durationLabel`.
- **Verified against a seeded database, not by reading the code.** All 69 listings (9 stays, 22
  experiences, 34 courses, 4 transfers) parse clean, and no row loses a key on parse. That check
  caught two things review had not: `places` and `languages` are comma-joined **strings**, not
  arrays, and every dive course carries a `durationLabel` that the schema was about to strip.
- New exported building blocks: `HostNote`, `HonestNotes`, `Persona`, `StayRoom`, `CurriculumDay`,
  `ExperienceItineraryStop`, `EditorialDetails`. The experience stop is named apart from the trip
  planner's `ItineraryStop`, which is a different concept that shares the word.
- Arrays are `.optional()` rather than `.default([])`, so a parsed shape matches what is stored
  instead of inventing empty arrays the database does not have.
- **These are deliberately not `.loose()`.** A loose object infers an index signature, which makes
  `d.hostnote` compile as `unknown` instead of failing — and the consumers are render components
  that reach for fields by name. The cost is that a `.parse()` strips undeclared keys, so a new
  generator field must be added here first; the 69-row check above is how you confirm it.

### Fixed
- **`EnquiryCreateInput` was missing the fields that set the price.** `roomType`, `rooms` and `pax`
  on each item, and `cardTokenId` on the body, were sent by the web checkout and used by the backend
  for months while absent from this schema — so `safeParse` stripped them, and *both* the BFF
  (`app/api/enquiry/route.ts`) and the backend handler re-read them off the raw request body by array
  index. The endpoint's "defense in depth" validation was therefore validating a shape no client
  sends, and which room, how many rooms, how many people, and the card token reached the money path
  unvalidated. Both workarounds are deleted now that the contract carries them.
  - The new fields are **deliberately tolerant** (`z.coerce.number().positive().optional().catch()`),
    reproducing the hand-rolled normalization exactly: `0`, a negative, an unparseable string or the
    wrong type becomes `undefined` rather than a 400. Verified across all 4,913 combinations of a
    17-value matrix — **zero behavioural differences**, which is the bar for changing an endpoint
    that authorizes cards.
  - `cardSecurityCode` (the CVV) is deliberately NOT added. It is used for one Beam authorize call
    and never persisted; keeping it out of the shared schema keeps it out of the types and error
    dumps built from it. It stays a raw-body passthrough, now the only one.

### Note
- Tags `v0.11.0` through `v0.15.0` exist with no changelog entries. Not reconstructed here — the
  history is in the diffs, and guessing at it would be worse than the gap.


## [0.10.0] - 2026-07-26

### Added
- `EnquiryItemInput.pickupLocation` / `.noPickup` — where to collect the guest, **per item**. A trip
  can hold bookings in different destinations, so a single trip-level address would be wrong the
  moment someone books a Phuket boat day and a Chiang Mai class together. The checkout offers a
  "same for all" shortcut, but still sends one value per item.
- `dto/pickup`: `BookingPickupUpdateInput` — change the pickup point after booking, authorized like
  any other guest action on a booking (session, or ref + email).

## [0.9.0] - 2026-07-25

### Added
- `dto/partner`: `PartnerRespondInput`, `PartnerDecisionInput`, `PartnerDecisionAction`,
  `GuestAlternativesRespondInput`, `GuestAlternativeDecisionInput` — the partner confirm and guest
  accept/decline payloads, which until now were hand-validated in the backend controller with no
  shared type. Covers cross-property offers (`listingId`) and host discounts (`discount`).
- `dto/cancellation`: `BookingCancelInput`.
- `policy/cancellation`: `cancellationTerms()`, `cancellationSummary()`, `CANCELLATION_CUTOFF_DAYS`,
  `CANCELLATION_REFUND_RATE` — 50% refunded until 3 days before the start date, nothing after. Kept
  here so checkout copy, the booking page, and server-side enforcement quote one number.

- `bookingItemRef` — one booking within a trip (`YTF-260461-1`). `bookingRef` only ever matched the
  trip reference, so anything acting on a single booking needs this.

### Fixed
- `BookingStatus` was missing `rejected`, `paid`, `expired` and `alternative_proposed`, so it
  rejected states the database has held since the enquiry-window work.

## [0.8.0] - 2026-06-24

Tagged but never released (`package.json` and this file were left at 0.7.0); recorded here so the
tag isn't a mystery.

### Changed
- Renamed `status` → `bookingStatus` / `transactionStatus` / `partnerStatus` / `listingStatus`,
  matching the backend rename (`status` is reserved by Strapi's draft/publish param).

### Added
- `transport` listing type.

## [0.7.0] - 2026-06-16

### Added
- `Vibe` editorial fields (`tagline`, `about`, `tags`, `highlights`, `places`, `seasonality`) so the
  vibe detail page can use the same rich landing template as a destination.

## [0.6.0] - 2026-06-15

### Added
- Destination editorial fields for the destination landing-page template: `tagline`, `about`,
  `tags`, `highlights` (DestinationHighlight), `places` (DestinationPlace), `gettingHere`,
  `seasonality` (SeasonMonth).
- `Partner.role` and `Partner.destinationId` (drives the per-destination "people" section).
- Shared listing detail fields (`SharedDetails`: `opinion`, `fit` (ListingFit), `nearby`,
  `includesGuide`) merged into Stay/Experience/Learn details — matches the prototype stay cards.

## [0.5.0] - 2026-06-15

### Added
- `Profile` entity — app-specific user data kept out of the auth user table, linked one-way
  (`profile → user`) so the users-permissions user content type is never modified.

## [0.4.1] - 2026-06-15

### Added
- `prepare` script — installing this package as a git dependency now builds `dist/`
  automatically, so consumers get the compiled output even though `dist/` stays gitignored.

## [0.4.0] - 2026-06-15

### Changed
- **zod 3 → 4** (`^4.4.3`). Build + runtime validation verified; consumers should align on zod 4.
- Tooling to latest: `tsup ^8.5.1`, `typescript ^5.9.3`.

## [0.3.0] - 2026-06-15

### Added
- `Transaction` entity (billing/commission ledger) + `TransactionKind` / `TransactionStatus` enums.
- `EnquiryItemInput` — per-item `startDate` / `endDate` / `guests`; `EnquiryCreateInput` gains
  `contactName` (manual availability flow: user picks dates, you confirm with partners).
- `isPublished` boolean on `Destination`, `Guide`, `Vibe` (own publish flag — Strapi draft/publish
  is off; see ADR 0005).

## [0.2.0] - 2026-06-15

### Added
- `Vibe` entity (curated taxonomy / page metadata).
- Listing per-type detail schemas (`StayDetails`, `ExperienceDetails`, `LearnDetails`) +
  `ListingDetailsByType` / `detailsSchemaFor(type)` for service-layer validation of `details` jsonb.
- Listing promoted filter columns (`summary`, `durationHours`, `maxGuests`, `level`) and
  `vibeSlugs` taxonomy array.
- `Partner.commissionRate`.
- Optional `locale` on i18n-enabled editorial entities (Partner, Destination, Listing, Guide, Vibe).

### Changed
- Listing model reworked: single-table strategy — real filter columns + jsonb `details` tail
  (see ADR 0003).

## [0.1.0] - 2026-06-15

### Added
- Initial domain contracts: enums, common primitives, entities, and DTOs.
- Enums: `Role`, `ListingType`, `PriceUnit`, `ListingStatus`, `BookingStatus`, `BookingWhen`,
  `Visibility`, `PartnerStatus`, `SavedKind`, `Currency`.
- Common: `id`, `timestamps`, `GeoPoint`, `MediaRef`, `Socials`.
- Entities: `User`, `Partner`, `Destination`, `Listing`, `Guide` (+ `GuideSpot`),
  `Itinerary` (+ `ItineraryStop`, `ManualStop`), `Booking` (+ `bookingRef`), `Cart` (+ `CartItem`),
  `Saved`, `NewsletterSub`.
- DTOs: `BookingLookupInput` (ref + email/phone), `EnquiryCreateInput`.
- Dual ESM+CJS build with type declarations via `tsup`.
- Canonical system spec `ARCHITECTURE.md`.

[Unreleased]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/releases/tag/v0.1.0
