import { z } from "zod";

/**
 * 3-D Secure: the shapes that cross the wire when a card needs the guest to
 * authenticate at their bank.
 *
 * Both the enquiry checkout and the swap-upcharge flow speak these. Neither
 * used to have a type at all — the BFF forwarded the backend's JSON verbatim
 * and the React pages read `res.threeDS?.redirectUrl` off an `unknown`, which
 * is a payment path typed by hope.
 */

/**
 * What a create/respond call answers with instead of a result, when the card
 * demands authentication. **This is a 200, not an error**: nothing failed, the
 * guest simply has somewhere to go first.
 */
export const ThreeDsRedirect = z.object({
  /** Beam's hosted challenge page. Send the browser here. */
  redirectUrl: z.string().url(),
  /** Present on the upcharge path: which booking the challenge is for. */
  ref: z.string().optional(),
});
export type ThreeDsRedirect = z.infer<typeof ThreeDsRedirect>;

/**
 * The outcome, read from the gateway server-side after the guest returns.
 *
 * `pending` is a real answer, not an error: the authorization can still be
 * settling when the browser lands back, and the gateway can be briefly
 * unreachable. Callers poll. Treating `pending` as failure would release a hold
 * that may well be good, and telling the guest their card was declined when it
 * wasn't is the worst of the three outcomes.
 */
export const ThreeDsStatus = z.enum(["confirmed", "pending", "failed"]);
export type ThreeDsStatus = z.infer<typeof ThreeDsStatus>;

/** `POST /bookings/enquiry/3ds-return` — the enquiry checkout path. */
export const ThreeDsEnquiryResult = z.object({
  status: ThreeDsStatus,
  enquiry: z
    .object({
      documentId: z.string().optional(),
      ref: z.string().optional(),
      enquiryStatus: z.string().optional(),
      respondBy: z.string().optional(),
    })
    .optional(),
  /** One-time code for a first-time guest to set a password. */
  claim: z.object({ code: z.string() }).optional(),
});
export type ThreeDsEnquiryResult = z.infer<typeof ThreeDsEnquiryResult>;

/** `POST /bookings/upcharge/3ds-return` — the swap-upcharge path. */
export const ThreeDsUpchargeResult = z.object({
  status: ThreeDsStatus,
  booking: z
    .object({
      ref: z.string().optional(),
      bookingStatus: z.string().optional(),
    })
    .optional(),
});
export type ThreeDsUpchargeResult = z.infer<typeof ThreeDsUpchargeResult>;

/** Body for both return endpoints: the signed token from the `returnUrl`. */
export const ThreeDsReturnInput = z.object({ token: z.string().min(1) });
export type ThreeDsReturnInput = z.infer<typeof ThreeDsReturnInput>;
