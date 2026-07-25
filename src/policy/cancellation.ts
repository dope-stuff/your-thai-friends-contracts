/**
 * Cancellation policy — the single source of truth.
 *
 * Cancel more than `CANCELLATION_CUTOFF_DAYS` days before the trip starts and
 * half the amount paid comes back. Inside that window nothing is refundable,
 * because the host has already turned other guests away.
 *
 * This lives in contracts rather than either app so the number the guest is
 * shown at checkout, the number quoted on the booking, and the number the
 * server actually refunds are all the same number. Keep it pure: no clocks, no
 * I/O — the caller passes `now`, which is also what makes it testable.
 */

/** Days before the start date after which a booking stops being refundable. */
export const CANCELLATION_CUTOFF_DAYS = 3;
/** Share of the paid amount returned when cancelling before the cutoff. */
export const CANCELLATION_REFUND_RATE = 0.5;

const DAY_MS = 86_400_000;

export interface CancellationTerms {
  /** Whether any money comes back at all. */
  refundable: boolean;
  /** 0.5 before the cutoff, 0 after. */
  rate: number;
  /** THB actually returned, rounded to whole baht. */
  refundAmount: number;
  /** The moment refundability ends — for "free until Tue 28 Jul" style copy. */
  cutoffAt: Date | null;
  /** Why it isn't refundable, when it isn't. */
  reason: "before-cutoff" | "inside-cutoff" | "already-started" | "no-date";
}

/**
 * What a guest gets back for cancelling `total` right now.
 *
 * A booking with no start date has nothing to count back from, so it stays
 * refundable — the alternative is silently keeping the money on a technicality.
 */
export function cancellationTerms(input: {
  startDate?: string | Date | null;
  total: number;
  now?: Date;
}): CancellationTerms {
  const total = Math.max(0, Number(input.total) || 0);
  const now = input.now ?? new Date();
  const refund = (rate: number) => Math.round(total * rate);

  if (!input.startDate) {
    return {
      refundable: true,
      rate: CANCELLATION_REFUND_RATE,
      refundAmount: refund(CANCELLATION_REFUND_RATE),
      cutoffAt: null,
      reason: "no-date",
    };
  }

  const start = new Date(input.startDate);
  if (Number.isNaN(start.getTime())) {
    return {
      refundable: true,
      rate: CANCELLATION_REFUND_RATE,
      refundAmount: refund(CANCELLATION_REFUND_RATE),
      cutoffAt: null,
      reason: "no-date",
    };
  }

  const cutoffAt = new Date(start.getTime() - CANCELLATION_CUTOFF_DAYS * DAY_MS);
  if (now.getTime() < cutoffAt.getTime()) {
    return {
      refundable: true,
      rate: CANCELLATION_REFUND_RATE,
      refundAmount: refund(CANCELLATION_REFUND_RATE),
      cutoffAt,
      reason: "before-cutoff",
    };
  }

  return {
    refundable: false,
    rate: 0,
    refundAmount: 0,
    cutoffAt,
    reason: now.getTime() >= start.getTime() ? "already-started" : "inside-cutoff",
  };
}

/** One-line summary for checkout and booking pages. */
export function cancellationSummary(): string {
  const pct = Math.round(CANCELLATION_REFUND_RATE * 100);
  return `Cancel more than ${CANCELLATION_CUTOFF_DAYS} days before you go and we'll refund ${pct}%. Within ${CANCELLATION_CUTOFF_DAYS} days, bookings aren't refundable.`;
}
