import { z } from "zod";
import { id, timestamps } from "../common";
import { SavedKind } from "../enums";

/** Wishlist row — points at a listing (`item`) or an itinerary (`itin`). */
export const SavedSchema = z
  .object({
    id,
    userId: id,
    kind: SavedKind,
    listingId: id.optional(),
    itineraryId: id.optional(),
    ...timestamps,
  })
  .refine(
    (s) =>
      (s.kind === "item" && Boolean(s.listingId)) ||
      (s.kind === "itin" && Boolean(s.itineraryId)),
    { message: "Saved row must carry the id matching its kind." },
  );
export type Saved = z.infer<typeof SavedSchema>;
