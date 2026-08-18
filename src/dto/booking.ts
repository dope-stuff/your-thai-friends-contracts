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

/**
 * A count a client may send loosely, or not at all.
 *
 * Deliberately tolerant, because it reproduces exactly what the backend already
 * did by hand: anything that is not a number above zero — `0`, a negative, an
 * unparseable string, the wrong type entirely — becomes `undefined` instead of
 * a 400. These fields ride on the enquiry that authorizes a card, and failing a
 * whole submission over a stray `0` in one item is a worse outcome than
 * ignoring it, which is the behaviour this endpoint has always had.
 */
const looseCount = z.coerce.number().positive().optional().catch(undefined);

/** A string a client may send loosely: wrong type in, `undefined` out. */
const looseString = z.string().optional().catch(undefined);

/** One bookable item in an enquiry, with the dates/guests the user selected. */
export const EnquiryItemInput = z.object({
  listingId: id,
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  guests: z.string().optional(),
  /**
   * Where to collect this guest. Per item rather than per trip: a trip can hold
   * a Phuket boat day and a Chiang Mai class, and one address can't serve both.
   * The checkout offers a "same for all" shortcut, but what it sends is still
   * one value per item.
   */
  pickupLocation: z.string().max(200).optional(),
  /** Set when the guest is making their own way there. */
  noPickup: z.boolean().optional(),

  /* The three fields below decide what the guest is charged and how many people
     the partner is expected to take. They were sent by the web checkout and
     used by the backend for months while being absent from this schema, so
     `safeParse` stripped them and `booking.ts` re-read them off the raw request
     body by array index — meaning the endpoint's own "defense in depth"
     validation never saw the fields that set the price. */

  /** Which room type of the listing, matched by name against `details.rooms`.
   *  The server prices from the matched room, never from the client. */
  roomType: looseString,
  /** How many rooms of that type. */
  rooms: looseCount,
  /** Party size. Feeds `per_person × pax`, which becomes the amount authorized
   *  on the card, and is checked against the listing's capacity server-side. */
  pax: looseCount,
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
  /** Beam card token from browser-side tokenization. Also absent from this
   *  schema until 2026-08-18, and read off the raw body for the same reason. */
  cardTokenId: looseString,
});
export type EnquiryCreateInput = z.infer<typeof EnquiryCreateInput>;
