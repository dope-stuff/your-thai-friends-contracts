import { z } from "zod";
import { id, timestamps, GeoPoint } from "../common";

/** A point of interest inside a destination guide. */
export const GuideSpot = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  geo: GeoPoint.optional(),
  mapsUrl: z.string().url().optional(),
});
export type GuideSpot = z.infer<typeof GuideSpot>;

export const GuideSchema = z.object({
  id,
  destinationId: id,
  title: z.string().min(1),
  /** Rich editorial body (markdown / serialized blocks) — no Strapi components. */
  content: z.string().optional(),
  spots: z.array(GuideSpot).default([]),
  packingChecklist: z.array(z.string()).default([]),
  /** Gated content: locked unless the viewer has a booking in this destination. */
  unlocksOnBooking: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  locale: z.string().optional(),
  ...timestamps,
});
export type Guide = z.infer<typeof GuideSchema>;
