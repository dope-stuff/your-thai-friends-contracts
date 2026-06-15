# Changelog

All notable changes to `@ytf/contracts` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Consumers pin a tag (e.g. `#v0.1.0`), so **every change must bump the version and add an entry**.

## [Unreleased]

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

[Unreleased]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/releases/tag/v0.1.0
