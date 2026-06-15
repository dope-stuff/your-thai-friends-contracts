import { z } from "zod";
import { id } from "../common";
import { bookingRef } from "../entities/booking";

/** Guest booking lookup: ref + (email OR phone), matching the prototype rule. */
export const BookingLookupInput = z
  .object({
    ref: bookingRef,
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: "Provide the email or phone on the booking.",
  });
export type BookingLookupInput = z.infer<typeof BookingLookupInput>;

/** Submit "Your Trip" as an enquiry (no charge in v1). */
export const EnquiryCreateInput = z.object({
  items: z.array(z.object({ listingId: id })).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  note: z.string().optional(),
});
export type EnquiryCreateInput = z.infer<typeof EnquiryCreateInput>;
