import { z } from "zod";
import { id, timestamps, MediaRef } from "../common";
import { DestinationHighlight, DestinationPlace, SeasonMonth } from "./destination";

/** A curated "vibe" (Ocean Adventures, Island Life & Scuba, …). Its detail page
 *  uses the same rich landing template as a destination, so it carries the same
 *  editorial fields. Cross-destination vibes (e.g. Ocean Adventures) span
 *  several places; single-destination vibes link straight to a destination. */
export const VibeSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  /** Hero eyebrow, e.g. "Phuket · Phang Nga · Krabi". */
  tagline: z.string().optional(),
  blurb: z.string().optional(),
  about: z.string().optional(),
  hero: MediaRef.optional(),
  tags: z.array(z.string()).default([]),
  highlights: z.array(DestinationHighlight).default([]),
  places: z.array(DestinationPlace).default([]),
  seasonality: z.array(SeasonMonth).default([]),
  /** Display order on the homepage. */
  order: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().default(false),
  locale: z.string().optional(),
  ...timestamps,
});
export type Vibe = z.infer<typeof VibeSchema>;
