import { z } from "zod";
import { id, timestamps } from "../common";
import { Currency } from "../enums";

/** How a payout actually left the bank. PromptPay QR is the only live path. */
export const PayoutMethod = z.enum(["promptpay_qr", "cash", "other"]);
export type PayoutMethod = z.infer<typeof PayoutMethod>;

/** `reversed` corrects a mistake; a payout is never deleted. */
export const PayoutStatus = z.enum(["recorded", "reversed"]);
export type PayoutStatus = z.infer<typeof PayoutStatus>;

/**
 * Money sent to a partner — the hop the payment gateway never sees.
 *
 * Without this, every reconciliation keeps counting bookings already settled.
 * It is the one record in the money model that rests on a person's word rather
 * than a gateway response: PromptPay has no API and no callback, so the row is
 * a claim that money moved, evidenced by `transferRef` and the slip.
 *
 * Delete-proof rather than append-only: `payoutStatus` legitimately flips to
 * `reversed`, but the row survives, because removing one silently inflates what
 * the next statement says we still owe.
 *
 * `transferRef`, `recordedBy` and the slip are private in Strapi and absent here.
 */
export const PayoutSchema = z.object({
  id,
  partnerId: id.optional(),
  /** Always positive; the direction is implicit — this is money leaving us. */
  amountSatang: z.number().int().positive(),
  currency: Currency.default("THB"),
  /** Half-open [periodStart, periodEnd) — consecutive periods must not overlap. */
  periodStart: z.string(),
  periodEnd: z.string(),
  method: PayoutMethod.default("promptpay_qr"),
  paidAt: z.string().datetime(),
  payoutStatus: PayoutStatus.default("recorded"),
  note: z.string().optional(),
  ...timestamps,
});
export type Payout = z.infer<typeof PayoutSchema>;
