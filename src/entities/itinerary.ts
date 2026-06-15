import { z } from "zod";
import { id, timestamps } from "../common";
import { Visibility } from "../enums";

/** A "plan-it-yourself" stop we don't sell — just a name + links. */
export const ManualStop = z.object({
  name: z.string().min(1),
  mapsUrl: z.string().url().optional(),
  bookUrl: z.string().url().optional(),
});
export type ManualStop = z.infer<typeof ManualStop>;

/** A stop is EITHER a catalogue listing OR a manual entry, never both. */
export const ItineraryStop = z
  .object({
    id: id.optional(),
    listingId: id.optional(),
    manual: ManualStop.optional(),
    order: z.number().int().nonnegative().optional(),
    note: z.string().optional(),
  })
  .refine((s) => Boolean(s.listingId) !== Boolean(s.manual), {
    message: "A stop must reference either a listing or a manual entry, not both.",
  });
export type ItineraryStop = z.infer<typeof ItineraryStop>;

export const ItinerarySchema = z.object({
  id,
  ownerUserId: id,
  title: z.string().min(1),
  visibility: Visibility.default("private"),
  /** Stable slug used for unlisted/public share links. */
  shareSlug: z.string().optional(),
  stops: z.array(ItineraryStop).default([]),
  ...timestamps,
});
export type Itinerary = z.infer<typeof ItinerarySchema>;
