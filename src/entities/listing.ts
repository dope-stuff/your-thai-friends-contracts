import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef } from "../common";
import { ListingType, PriceUnit, ListingStatus, Currency } from "../enums";

export const ListingSchema = z.object({
  id,
  partnerId: id,
  destinationId: id,
  type: ListingType,
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  priceUnit: PriceUnit,
  currency: Currency.default("THB"),
  media: z.array(MediaRef).default([]),
  location: z.string().optional(),
  geo: GeoPoint.optional(),
  /** Type-specific details (amenities, course length, group size, …). */
  details: z.record(z.string(), z.unknown()).optional(),
  status: ListingStatus,
  ...timestamps,
});
export type Listing = z.infer<typeof ListingSchema>;
