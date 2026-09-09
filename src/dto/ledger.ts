import { z } from "zod";
import { id } from "../common";
import { PaymentEventType, GatewayRefType, Currency } from "../enums";

/**
 * Admin-only reconciliation responses (`/api/ledger/*`).
 *
 * **Every amount is integer satang.** Never a decimal, never pre-formatted:
 * `SUM()` over these has to be exact and has to tie out to Beam to the satang,
 * and the caller decides how to display it.
 *
 * These endpoints are gated by `global::is-admin` — they expose YTF's margin,
 * gateway references and cross-partner totals. A host must never reach them;
 * see the backend's `docs/security.md`.
 *
 * Amounts only: no response here carries a commission *rate*. The partner's
 * rate is `private` in Strapi and no endpoint returns it — these figures are
 * derived from each event's own `commissionRateSnapshot`, so they stay
 * reproducible after a partner's standing rate changes.
 */

const satang = z.number().int();

/**
 * The P&L, on the **principal** model: revenue is the full guest-facing amount
 * and the partner's share is cost of sales, not a deduction from revenue. What
 * the schema calls "commission" is YTF's gross margin.
 */
export const LedgerSummary = z.object({
  currency: Currency,
  /** Period boundaries are evaluated in this zone, not UTC. */
  timezone: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  /** Captures less refunds. */
  revenueSatang: satang,
  refundedSatang: satang,
  /** What partners are owed on these captures — cost of sales. */
  partnerCostSatang: satang,
  /** Beam's cut. Zero until the Phase 4 fee sweep runs. */
  processingFeeSatang: satang,
  grossProfitSatang: satang,
  /** Output VAT within revenue. Zero while YTF isn't VAT-registered. */
  saleVatSatang: satang,
  netCashSatang: satang,
  cashEvents: z.number().int(),
  /**
   * Rows the backfill reconstructed rather than observed. Reported separately
   * so an approximation is never silently mixed with a measurement.
   */
  reconstructedRows: z.number().int(),
});
export type LedgerSummary = z.infer<typeof LedgerSummary>;

/**
 * One partner's statement. `balanceSatang` is what to actually transfer — it
 * nets off payouts already made, because a statement that doesn't subtract what
 * you already paid is worse than none: it looks authoritative.
 */
export const LedgerPartnerRow = z.object({
  partnerId: id,
  partnerName: z.string().nullable(),
  grossSatang: satang,
  refundedSatang: satang,
  commissionSatang: satang,
  netOwedSatang: satang,
  paidOutSatang: satang,
  balanceSatang: satang,
});
export type LedgerPartnerRow = z.infer<typeof LedgerPartnerRow>;

/** One row of the audit drill-down behind every figure above. */
export const LedgerEvent = z.object({
  eventType: PaymentEventType,
  amountSatang: satang,
  movesCash: z.boolean(),
  occurredAt: z.string(),
  gatewayRef: z.string().nullable(),
  gatewayRefType: GatewayRefType,
  referenceId: z.string().nullable(),
  reconstructed: z.boolean(),
  note: z.string().nullable(),
  bookingRef: z.string().nullable(),
  enquiryRef: z.string().nullable(),
  partnerName: z.string().nullable(),
});
export type LedgerEvent = z.infer<typeof LedgerEvent>;

/** Shared shape across exception groups; each carries only what applies. */
export const LedgerExceptionRow = z
  .object({
    eventType: PaymentEventType.optional(),
    attemptKey: z.string().optional(),
    amountSatang: satang.optional(),
    occurredAt: z.string().optional(),
    bookingRef: z.string().optional(),
    enquiryRef: z.string().optional(),
    partnerId: id.optional(),
    partnerName: z.string().optional(),
    totalThb: z.string().optional(),
    bookingStatus: z.string().optional(),
    netOwedSatang: satang.optional(),
    paidOutSatang: satang.optional(),
    balanceSatang: satang.optional(),
    note: z.string().optional(),
  })
  .passthrough();
export type LedgerExceptionRow = z.infer<typeof LedgerExceptionRow>;

/**
 * Everything that needs a human, worst first within each group. This is the
 * point of the ledger: money that moved and wasn't recorded, or was promised
 * and never moved, surfaces itself instead of waiting to be noticed.
 */
export const LedgerExceptions = z.object({
  /** A gateway call that died between asking and learning the answer. */
  strandedAttempts: z.array(LedgerExceptionRow),
  /** Owed under the policy with no charge to return it from. */
  refundsOwedUncollectable: z.array(LedgerExceptionRow),
  /** Capture failed after the guest was told the booking was confirmed. */
  confirmedButUnpaid: z.array(LedgerExceptionRow),
  /** A card held past the response window and never captured or released. */
  holdsNeverSettled: z.array(LedgerExceptionRow),
  upgradesAuthorizedNotCaptured: z.array(LedgerExceptionRow),
  /** Resolved by the backfill script, not by a code fix. */
  moneyBeforeTheLedger: z.array(LedgerExceptionRow),
  /** Paid a partner more than they were owed. */
  negativeBalances: z.array(LedgerExceptionRow),
});
export type LedgerExceptions = z.infer<typeof LedgerExceptions>;

/**
 * Record a payout that already happened. Payouts are PromptPay QR — no API, no
 * callback — so this is a human's claim that money left the bank, which is why
 * it carries a reference and, ideally, a slip.
 *
 * `periodStart`/`periodEnd` are half-open `[start, end)`: equal or inverted
 * bounds would double-count a booking across consecutive statements.
 */
export const PayoutCreateInput = z
  .object({
    partnerId: id,
    /** Positive integer satang — not baht. */
    amountSatang: z.number().int().positive(),
    periodStart: z.string(),
    periodEnd: z.string(),
    method: z.enum(["promptpay_qr", "cash", "other"]).default("promptpay_qr"),
    paidAt: z.string().datetime().optional(),
    /** Transaction reference from the banking-app slip. */
    transferRef: z.string().optional(),
    note: z.string().max(500).optional(),
  })
  .refine((v) => v.periodStart < v.periodEnd, {
    message: "periodStart must be before periodEnd",
    path: ["periodEnd"],
  });
export type PayoutCreateInput = z.infer<typeof PayoutCreateInput>;
