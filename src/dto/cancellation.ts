import { z } from "zod";
import { bookingItemRef } from "../entities/booking";

/**
 * Cancel one booking. Authenticated either by the signed-in traveller who owns
 * it, or by the ref + email pair that already powers "find my booking" — the
 * same proof used to view it.
 *
 * The refund is never taken from the client; the server recomputes it from the
 * policy against its own clock and its own record of what was paid.
 */
export const BookingCancelInput = z
  .object({
    ref: bookingItemRef,
    email: z.string().email().optional(),
    reason: z.string().max(300).optional(),
  })
  .describe("Cancel a booking; refund is computed server-side.");
export type BookingCancelInput = z.infer<typeof BookingCancelInput>;
