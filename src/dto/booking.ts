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

/** One bookable item in an enquiry, with the dates/guests the user selected. */
export const EnquiryItemInput = z.object({
  listingId: id,
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  guests: z.string().optional(),
});
export type EnquiryItemInput = z.infer<typeof EnquiryItemInput>;

/**
 * Submit "Your Trip" as an enquiry (no charge in v1). We create a traveller
 * account from contactEmail if one doesn't exist, so bookings always link.
 */
export const EnquiryCreateInput = z.object({
  items: z.array(EnquiryItemInput).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  contactName: z.string().optional(),
  note: z.string().optional(),
});
export type EnquiryCreateInput = z.infer<typeof EnquiryCreateInput>;
