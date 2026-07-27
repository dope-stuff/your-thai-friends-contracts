import { z } from "zod";
import { id, timestamps } from "../common";
import { PaymentEventType, GatewayRefType, Currency } from "../enums";

/**
 * One money event. Append-only: rows are never updated or deleted, and a
 * correction is a new `adjustment` row. The system of record for cash — the
 * mutable payment columns on `booking`/`enquiry` drive product behaviour, this
 * drives reporting and reconciliation.
 *
 * Amounts are **signed integer satang** (THB × 100), matching what Beam actually
 * charges. Positive is money to us, negative is money out. Never store money
 * here as a decimal: `SUM()` over these must be exact, and it must tie out to
 * Beam's own figures to the satang.
 *
 * Gateway identifiers (`gatewayRef`, `referenceId`, `dedupeKey`, `attemptKey`)
 * and the raw payload are **private in Strapi** and deliberately absent here —
 * they never reach a client. The admin-only ledger DTOs expose what's needed.
 */
export const PaymentEventSchema = z.object({
  id,
  eventType: PaymentEventType,
  /** Signed satang. Positive = money in, negative = money out. */
  amountSatang: z.number().int(),
  currency: Currency.default("THB"),
  /**
   * True only where cash actually moved. Set at write time so a query can't get
   * it wrong by forgetting an event type: revenue is
   * `SUM(amountSatang) WHERE movesCash`.
   */
  movesCash: z.boolean(),
  /** When the money moved, on our clock. */
  occurredAt: z.string().datetime(),
  gatewayRefType: GatewayRefType.default("none"),
  bookingId: id.optional(),
  enquiryId: id.optional(),
  partnerId: id.optional(),
  /**
   * Partner's commission rate at the time, so the split stays reproducible.
   *
   * **Private in Strapi — admin surfaces only.** It is margin data: it states
   * what YTF takes from a partner. Optional here because it is absent from every
   * non-admin response rather than because it may be unset.
   */
  commissionRateSnapshot: z.number().min(0).max(1).optional(),
  /** Sale VAT rate at the time. Currently 0 — YTF is not VAT-registered. */
  saleVatRateSnapshot: z.number().min(0).max(1).optional(),
  /** Output VAT within `amountSatang`. Currently 0; see VAT_RATE. */
  saleVatSatang: z.number().int().optional(),
  /** True for rows reconstructed by the backfill rather than observed live. */
  reconstructed: z.boolean().default(false),
  note: z.string().optional(),
  ...timestamps,
});
export type PaymentEvent = z.infer<typeof PaymentEventSchema>;
