import { z } from "zod";
import { bookingItemRef } from "../entities/booking";

/**
 * Change where a guest is collected, after the booking already exists — hotels
 * change, plans change, and the alternative is making them message someone.
 *
 * Authorized the same way as viewing the booking: the owning traveller's
 * session, or the ref + email pair behind "find my booking".
 *
 * `noPickup` and `pickupLocation` are mutually exclusive in meaning; sending
 * `noPickup: true` clears any address rather than leaving a stale one behind.
 */
export const BookingPickupUpdateInput = z
  .object({
    ref: bookingItemRef,
    email: z.string().email().optional(),
    pickupLocation: z.string().max(200).optional(),
    noPickup: z.boolean().optional(),
  })
  .refine((d) => d.noPickup === true || Boolean(d.pickupLocation?.trim()), {
    message: "Give a pickup point, or say you don't need one.",
    path: ["pickupLocation"],
  });
export type BookingPickupUpdateInput = z.infer<typeof BookingPickupUpdateInput>;
