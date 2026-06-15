import { z } from "zod";

/** Account role. Hosts also carry a `partnerId` on the User. */
export const Role = z.enum(["traveller", "host", "admin"]);
export type Role = z.infer<typeof Role>;

/** The three product verticals. */
export const ListingType = z.enum(["stay", "experience", "learn"]);
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

/** Enquiry/booking lifecycle. v1 is enquiry-first (no charge). */
export const BookingStatus = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
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

/** Ledger entry kind for billing/commission. */
export const TransactionKind = z.enum([
  "booking_commission",
  "payout",
  "refund",
  "adjustment",
]);
export type TransactionKind = z.infer<typeof TransactionKind>;

export const TransactionStatus = z.enum(["pending", "settled", "void"]);
export type TransactionStatus = z.infer<typeof TransactionStatus>;
