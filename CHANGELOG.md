# Changelog

All notable changes to `@ytf/contracts` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Consumers pin a tag (e.g. `#v0.1.0`), so **every change must bump the version and add an entry**.

## [Unreleased]

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

[Unreleased]: https://github.com/your-thai-friends/your-thai-friends-contracts/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-thai-friends/your-thai-friends-contracts/releases/tag/v0.1.0
