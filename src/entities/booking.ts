import { z } from "zod";
import { id, timestamps } from "../common";
import { BookingStatus, BookingWhen } from "../enums";

/** Reservation reference, e.g. `YTF-4821`. Generated server-side. */
export const bookingRef = z
  .string()
  .regex(/^YTF-[A-Z0-9]+$/, "Reference must look like YTF-XXXX.");
export type BookingRef = z.infer<typeof bookingRef>;

export const BookingSchema = z.object({
  id,
  ref: bookingRef,
  /** Null for guest bookings made without an account. */
  userId: id.optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  listingId: id,
  partnerId: id,
  status: BookingStatus,
  /** Human-friendly date label, e.g. "14–18 Mar 2026". */
  dates: z.string().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  /** Free-form guest label, e.g. "2 guests" / "1 diver". */
  guests: z.string().optional(),
  total: z.number().nonnegative(),
  when: BookingWhen.optional(),
  ...timestamps,
});
export type Booking = z.infer<typeof BookingSchema>;
