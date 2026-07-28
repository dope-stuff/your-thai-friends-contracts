import { z } from "zod";

/** Account role. Hosts also carry a `partnerId` on the User. */
export const Role = z.enum(["traveller", "host", "admin"]);
export type Role = z.infer<typeof Role>;

/** Product verticals. `transport` = bookable transfers (bus+ferry bundles);
 *  hidden from the stay/experience/learn browse grids by construction. */
export const ListingType = z.enum(["stay", "experience", "learn", "transport"]);
export type ListingType = z.infer<typeof ListingType>;

/** How a listing's price is expressed. */
export const PriceUnit = z.enum([
  "per_night",
  "per_trip",
  "per_course",
  "per_person",
]);
export type PriceUnit = z.infer<typeof PriceUnit>;

export const ListingStatus = z.enum(["draft", "published", "archived"]);
export type ListingStatus = z.infer<typeof ListingStatus>;

/**
 * Enquiry/booking lifecycle. Mirrors the backend `bookingStatus` enum exactly —
 * these had drifted apart, so anything validating against this was silently
 * rejecting states the database can actually hold.
 */
export const BookingStatus = z.enum([
  "pending",
  "confirmed",
  "rejected",
  "paid",
  "completed",
  "cancelled",
  "expired",
  "alternative_proposed",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

/** Whether a booking sits in the future or the past (drives UI tabs). */
export const BookingWhen = z.enum(["upcoming", "past"]);
export type BookingWhen = z.infer<typeof BookingWhen>;

/** Itinerary sharing model. */
export const Visibility = z.enum(["public", "unlisted", "private"]);
export type Visibility = z.infer<typeof Visibility>;

export const PartnerStatus = z.enum(["pending", "active", "suspended"]);
export type PartnerStatus = z.infer<typeof PartnerStatus>;

/** What a saved/wishlist row points at. */
export const SavedKind = z.enum(["item", "itin"]);
export type SavedKind = z.infer<typeof SavedKind>;

export const Currency = z.enum(["THB"]);
export type Currency = z.infer<typeof Currency>;

/* TransactionKind / TransactionStatus removed in v0.13.0 — the `transaction`
 * content type is retired. Every figure it held is derived from `payment-event`
 * (which carries commissionRateSnapshot) plus `payout`. See the backend's
 * docs/money-ledger.md §4a. */

/**
 * Every kind of money event the ledger records. Attempt/outcome pairs by design:
 * an attempt with no matching outcome means the process died mid-gateway-call,
 * which is otherwise invisible. See the backend's `docs/money-ledger.md`.
 */
export const PaymentEventType = z.enum([
  "authorization_attempted",
  "authorized",
  "authorization_failed",
  "capture_attempted",
  "captured",
  "capture_failed",
  "release_attempted",
  "released",
  "release_failed",
  "upcharge_authorization_attempted",
  "upcharge_authorized",
  "upcharge_authorization_failed",
  "upcharge_capture_attempted",
  "upcharge_captured",
  "upcharge_capture_failed",
  "refund_attempted",
  "refunded",
  "refund_failed",
  "refund_owed_uncollectable",
  "fee_recorded",
  "adjustment",
  "capture_unverified",
]);
export type PaymentEventType = z.infer<typeof PaymentEventType>;

/** What `gatewayRef` points at on a payment event. */
export const GatewayRefType = z.enum(["authorization", "charge", "refund", "none"]);
export type GatewayRefType = z.infer<typeof GatewayRefType>;
