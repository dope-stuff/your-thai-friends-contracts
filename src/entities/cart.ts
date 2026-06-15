import { z } from "zod";
import { id, timestamps } from "../common";
import { ManualStop } from "./itinerary";

export const CartItem = z.object({ listingId: id });
export type CartItem = z.infer<typeof CartItem>;

/** "Your Trip" — bookable items plus plan-it-yourself manual stops. */
export const CartSchema = z.object({
  id: id.optional(),
  /** One of userId (signed in) or sessionId (guest) identifies the cart. */
  userId: id.optional(),
  sessionId: z.string().optional(),
  items: z.array(CartItem).default([]),
  manualItems: z.array(ManualStop).default([]),
  ...timestamps,
});
export type Cart = z.infer<typeof CartSchema>;
