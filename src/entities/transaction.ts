import { z } from "zod";
import { id, timestamps } from "../common";
import { TransactionKind, TransactionStatus, Currency } from "../enums";

/**
 * Billing ledger entry. One per money event so we can reconstruct detailed
 * partner billing. `commissionRate` is snapshotted at creation time so later
 * changes to Partner.commissionRate don't rewrite history.
 */
export const TransactionSchema = z.object({
  id,
  kind: TransactionKind,
  status: TransactionStatus.default("pending"),
  bookingId: id.optional(),
  partnerId: id.optional(),
  currency: Currency.default("THB"),
  /** Amount this entry derives from (e.g. booking total). */
  gross: z.number(),
  /** Snapshot of the partner's commission rate at the time. */
  commissionRate: z.number().min(0).max(1).optional(),
  commissionAmount: z.number().optional(),
  netToPartner: z.number().optional(),
  note: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  ...timestamps,
});
export type Transaction = z.infer<typeof TransactionSchema>;
