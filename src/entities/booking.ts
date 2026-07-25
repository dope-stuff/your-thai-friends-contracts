import { z } from "zod";
import { id, timestamps } from "../common";
import { BookingStatus, BookingWhen } from "../enums";

/** Trip (enquiry) reference, e.g. `YTF-260461`. Generated server-side. This is
 *  the reference a guest is shown and types into "find my booking". */
export const bookingRef = z
  .string()
  .regex(/^YTF-[A-Z0-9]+$/, "Reference must look like YTF-XXXX.");
export type BookingRef = z.infer<typeof bookingRef>;

/**
 * A single booking within a trip, e.g. `YTF-260461-1`.
 *
 * One enquiry becomes one booking per item, each suffixed `-N`. Anything acting
 * on an individual booking — a partner's per-item decision, a guest accepting
 * one alternative, a cancellation — carries this, not the trip ref. The plain
 * trip ref is still accepted, since a single-item trip is addressed either way.
 */
export const bookingItemRef = z
  .string()
  .regex(/^YTF-[A-Z0-9]+(-\d+)?$/, "Reference must look like YTF-XXXX or YTF-XXXX-1.");
export type BookingItemRef = z.infer<typeof bookingItemRef>;

export const BookingSchema = z.object({
  id,
  ref: bookingRef,
  /** Null for guest bookings made without an account. */
  userId: id.optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  listingId: id,
  partnerId: id,
  // NOT named `status` — Strapi v5 reserves `status` for the draft/published
  // document param (same fix as partnerStatus / listingStatus).
  bookingStatus: BookingStatus,
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
