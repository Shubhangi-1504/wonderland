/**
 * The single rounding rule for the whole simulation.
 *
 * RULE: virtual money and prices are kept in dollars rounded to 2 decimal
 * places (cents). Quantities are whole shares, so they are never rounded here.
 * Every value that leaves `src/sim` has already been through `roundMoney`, so
 * the UI can render with `$${n.toFixed(2)}` and never see 0.30000000000000004.
 *
 * `roundMoney(2.675) === 2.68` (the epsilon nudges float representation error
 * back up; plain `Math.round(x * 100)` would give 2.67).
 */

/** Number of decimals used for all money and price values. */
export const MONEY_DECIMALS = 2;

const FACTOR = 10 ** MONEY_DECIMALS;

/** Round a virtual money/price value to cents. Non-finite input becomes 0. */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const scaled = value * FACTOR;
  // Nudge by an epsilon proportional to magnitude to counter float error,
  // then round; this keeps 2.675 -> 2.68 without breaking 2.674 -> 2.67.
  return Math.round(scaled + Math.sign(scaled) * Number.EPSILON * Math.abs(scaled)) / FACTOR;
}

/** Prices must never go below zero. Rounds to cents as well. */
export function clampPrice(value: number): number {
  return roundMoney(Math.max(0, value));
}

/** Round a percentage (e.g. 12.3456 -> 12.35). Non-finite input becomes 0. */
export function roundPercent(value: number): number {
  return roundMoney(value);
}

/**
 * Round a 0-1 ratio (e.g. a position weight) to 4 decimals so small positions
 * do not all collapse to 0. Non-finite input becomes 0.
 */
export function roundRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10_000) / 10_000;
}
