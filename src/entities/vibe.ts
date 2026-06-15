import { z } from "zod";
import { id, timestamps, MediaRef } from "../common";

/** A curated "vibe" (Ocean Adventures, Island Life & Scuba, Mountains & Culture).
 *  Page LAYOUT lives in the frontend; this holds page METADATA + content
 *  selection. Listings link to vibes via their `vibeSlugs` jsonb array. */
export const VibeSchema = z.object({
  id,
  name: z.string().min(1),
  slug: z.string().min(1),
  blurb: z.string().optional(),
  hero: MediaRef.optional(),
  /** Display order on the homepage. */
  order: z.number().int().nonnegative().optional(),
  isPublished: z.boolean().default(false),
  locale: z.string().optional(),
  ...timestamps,
});
export type Vibe = z.infer<typeof VibeSchema>;
