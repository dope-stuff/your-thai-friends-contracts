/**
 * Sale VAT — the single source of truth.
 *
 * **YTF is not VAT-registered** (2026-07-27), so this is `0` and no VAT is
 * separated out of a sale. Partners handle their own VAT on their own supply.
 *
 * It exists at zero rather than not existing because the ledger snapshots a VAT
 * decomposition onto every capture. Registration is a threshold event — in
 * Thailand it is mandatory above ฿1.8M annual revenue, and YTF sells as
 * principal, so the *full* guest-facing amount counts toward that, not the
 * margin. Recording the split from the start costs nothing and cannot be
 * reconstructed afterwards; see the backend's `docs/money-ledger.md` §4d.
 *
 * Prices are **VAT-inclusive**: what a guest sees is what a guest pays, and no
 * guest-facing copy mentions VAT at all. If this ever becomes non-zero, the
 * displayed price does not change — only its decomposition does.
 */

/** Sale VAT rate. `0` until YTF registers for VAT. */
export const VAT_RATE = 0;

/**
 * The VAT contained within a VAT-inclusive amount, in satang.
 *
 * Decomposes DOWN from the gross rather than building up from a net figure:
 * building up reintroduces exactly the rounding drift that storing integer
 * satang exists to remove. Returns `0` while `VAT_RATE` is `0`.
 */
export function vatWithin(grossSatang: number, rate: number = VAT_RATE): number {
  if (!rate) return 0;
  return grossSatang - Math.round(grossSatang / (1 + rate));
}
