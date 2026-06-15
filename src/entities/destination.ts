import { z } from "zod";
import { id, timestamps, GeoPoint, MediaRef } from "../common";

/** A highlight feature card in the destination "About" section. */
export const DestinationHighlight = z.object({
  title: z.string(),
  blurb: z.string().optional(),
});
export type DestinationHighlight = z.infer<typeof DestinationHighlight>;

/** A sub-area in the "Where you'll be" list. */
export const DestinationPlace = z.object({
  name: z.string(),
  tag: z.string().optional(),
  description: z.string().optional(),
});
export type DestinationPlace = z.infer<typeof DestinationPlace>;

/** One month in the "When to come" seasonality strip. */
export const SeasonMonth = z.object({
  month: z.string(),
  condition: z.enum(["sun", "mixed", "rain", "heavy"]),
  note: z.string().optional(),
  best: z.boolean().optional(),
});
export type SeasonMonth = z.infer<typeof SeasonMonth>;

export const DestinationSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  region: z.string().optional(),
  geo: GeoPoint.optional(),
  /** Hero eyebrow, e.g. "Rivers & Waterfalls". */
  tagline: z.string().optional(),
  description: z.string().optional(),
  /** Long-form "About" intro. */
  about: z.string().optional(),
  hero: MediaRef.optional(),
  tags: z.array(z.string()).default([]),
  highlights: z.array(DestinationHighlight).default([]),
  places: z.array(DestinationPlace).default([]),
  gettingHere: z.string().optional(),
  seasonality: z.array(SeasonMonth).default([]),
  isPublished: z.boolean().default(false),
  locale: z.string().optional(),
  ...timestamps,
});
export type Destination = z.infer<typeof DestinationSchema>;
