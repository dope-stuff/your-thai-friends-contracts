import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef } from "../common";
import { ListingType, PriceUnit, ListingStatus, Currency } from "../enums";

/* ── Per-type variant detail shapes (stored in listing.details jsonb) ────────
   The discriminant is the parent `listing.type`, so we expose a lookup rather
   than a discriminated union. Validate in the service: detailsSchemaFor(type). */

/** The friend's "perfect if you… / maybe not if…" fit guidance. */
export const ListingFit = z.object({
  perfect: z.string().optional(),
  notFor: z.string().optional(),
});
export type ListingFit = z.infer<typeof ListingFit>;

/** Editorial fields shared across all listing types (the prototype's stay
 *  cards: the friend's opinion, fit, "right nearby", and the guide perk). */
export const SharedDetails = z.object({
  opinion: z.string().optional(),
  fit: ListingFit.optional(),
  nearby: z.array(z.string()).default([]),
  includesGuide: z.boolean().optional(),
});

export const StayDetails = SharedDetails.extend({
  maxGuests: z.number().int().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  beds: z.number().int().nonnegative().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});
export type StayDetails = z.infer<typeof StayDetails>;

export const ExperienceDetails = SharedDetails.extend({
  durationHours: z.number().positive().optional(),
  groupMax: z.number().int().positive().optional(),
  pickup: z.boolean().optional(),
  includes: z.array(z.string()).default([]),
});
export type ExperienceDetails = z.infer<typeof ExperienceDetails>;

export const LearnDetails = SharedDetails.extend({
  days: z.number().positive().optional(),
  level: z.string().optional(),
  certification: z.string().optional(),
  groupMax: z.number().int().positive().optional(),
});
export type LearnDetails = z.infer<typeof LearnDetails>;

export const TransportDetails = SharedDetails.extend({
  // Bus+ferry transfer bundle. Operator (e.g. Boonsiri) is internal context.
  transfer: z
    .object({
      operator: z.string().optional(),
      from: z.string().optional(),
      oneWay: z.boolean().optional(),
    })
    .optional(),
});
export type TransportDetails = z.infer<typeof TransportDetails>;

export const ListingDetailsByType = {
  stay: StayDetails,
  experience: ExperienceDetails,
  learn: LearnDetails,
  transport: TransportDetails,
} as const;

/** Pick the details schema for a listing type — use in the write path. */
export function detailsSchemaFor(type: z.infer<typeof ListingType>) {
  return ListingDetailsByType[type];
}

export const ListingSchema = z.object({
  id,
  partnerId: id,
  destinationId: id,
  type: ListingType,
  title: z.string().min(1),
  slug: z.string().min(1),
  /** Short card/list summary (promoted column). */
  summary: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  priceUnit: PriceUnit,
  currency: Currency.default("THB"),
  media: z.array(MediaRef).default([]),
  location: z.string().optional(),
  geo: GeoPoint.optional(),

  // Promoted, cross-type FILTER columns (nullable — only some types use each).
  // Keep filters out of jsonb: Strapi's query engine filters columns, not deep json.
  durationHours: z.number().positive().optional(),
  maxGuests: z.number().int().positive().optional(),
  level: z.string().optional(),

  /** Taxonomy tags, GIN-indexed jsonb. Queried by containment, no join table. */
  vibeSlugs: z.array(z.string()).default([]),

  /** Non-filtered, type-specific long tail. Validate via detailsSchemaFor(type). */
  details: z.record(z.string(), z.unknown()).optional(),

  // Own publish flag. NOT named `status` — Strapi v5 reserves `status` for the
  // draft/published document param, so a field named `status` can't be filtered
  // via the REST/document API (same fix as partnerStatus).
  listingStatus: ListingStatus,
  locale: z.string().optional(),
  ...timestamps,
});
export type Listing = z.infer<typeof ListingSchema>;
