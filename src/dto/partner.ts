import { z } from "zod";
import { id } from "../common";
import { bookingItemRef } from "../entities/booking";

/** What a partner can say about one item on an enquiry. */
export const PartnerDecisionAction = z.enum(["confirm", "reject", "offer"]);
export type PartnerDecisionAction = z.infer<typeof PartnerDecisionAction>;

/**
 * One item of a partner's response.
 *
 * An `offer` must name something concrete: a different room of the booked
 * listing (`roomType`), another of the partner's listings (`listingId`), or a
 * free-text `note` — the last being the only option open to listings with no
 * rooms at all (experiences, classes, transfers).
 *
 * `discount` is a reduction in THB and is allowed on any decision, not just an
 * offer. It is validated again server-side against the booking's own total; the
 * client cannot be trusted with what is owed.
 */
export const PartnerDecisionInput = z
  .object({
    ref: bookingItemRef,
    action: PartnerDecisionAction,
    roomType: z.string().min(1).optional(),
    listingId: id.optional(),
    note: z.string().max(300).optional(),
    discount: z.number().nonnegative().optional(),
  })
  .refine(
    (d) =>
      d.action !== "offer" ||
      Boolean(d.roomType?.trim() || d.listingId || d.note?.trim()),
    {
      message:
        'An "offer" needs a roomType, a listingId, or a note describing what you can offer instead.',
      path: ["action"],
    },
  );
export type PartnerDecisionInput = z.infer<typeof PartnerDecisionInput>;

/**
 * A partner's response to an enquiry. Either one `action` applied to every item
 * (the original shape, still accepted) or a per-item `decisions` array.
 */
export const PartnerRespondInput = z
  .object({
    action: z.enum(["confirm", "reject"]).optional(),
    decisions: z.array(PartnerDecisionInput).min(1).optional(),
  })
  .refine((d) => Boolean(d.action) || Boolean(d.decisions), {
    message: 'Provide "action" ("confirm"|"reject") or a "decisions" array.',
  });
export type PartnerRespondInput = z.infer<typeof PartnerRespondInput>;

/** The guest's answer to each alternative their host proposed. */
export const GuestAlternativeDecisionInput = z.object({
  ref: bookingItemRef,
  action: z.enum(["accept", "decline"]),
});
export type GuestAlternativeDecisionInput = z.infer<
  typeof GuestAlternativeDecisionInput
>;

/**
 * Accept/decline proposed alternatives. A card may ride along because accepting
 * a pricier swap authorizes the difference — it is never stored, only passed to
 * the payment provider.
 */
export const GuestAlternativesRespondInput = z.object({
  decisions: z.array(GuestAlternativeDecisionInput).min(1),
  cardTokenId: z.string().optional(),
  cardSecurityCode: z.string().optional(),
});
export type GuestAlternativesRespondInput = z.infer<
  typeof GuestAlternativesRespondInput
>;
