import type { Holding, PriceMap, TradeResult, Wallet } from '../types';
import { roundMoney } from './money';

/**
 * Virtual trading. No fees, no slippage, instant fill at the current `prices`
 * value — it is a teaching sandbox, not a broker. No short selling, no leverage.
 *
 * MONEY RULE (single source of truth: `./money`): every money value is dollars
 * rounded to 2 decimals with `roundMoney` (`Math.round(x * 100) / 100`, with an
 * epsilon nudge for float error). Quantities are whole shares and never rounded.
 */

/** Minimum virtual cash to start with (the store uses this). */
export { STARTING_CASH } from './portfolio';

// Re-exported so callers can import the money helpers from one place.
export { clampPrice, roundMoney } from './money';

/** Shared guard: quantities must be whole, positive shares. */
function validateQty(qty: number): string | null {
  if (!Number.isInteger(qty)) return 'Shares must be a whole number.';
  if (qty <= 0) return 'Choose at least 1 share to trade.';
  return null;
}

/** Shared guard: the company must have a usable, positive price. */
function validatePrice(prices: PriceMap, companyId: string): number | null {
  const price = prices[companyId];
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return price;
}

/**
 * Buy `qty` shares of `companyId` at `prices[companyId]`.
 *
 * Never throws and never mutates `wallet`: on failure it returns
 * `{ ok: false, reason }` with a sentence the UI can show as-is.
 *
 * On success: `cash -= qty * price`; an existing position gets a weighted-average
 * `avgCost`, a new position starts at the current price.
 */
export function buy(
  wallet: Wallet,
  companyId: string,
  qty: number,
  prices: PriceMap,
): TradeResult {
  const qtyError = validateQty(qty);
  if (qtyError) return { ok: false, reason: qtyError };

  const price = validatePrice(prices, companyId);
  if (price === null) return { ok: false, reason: 'That company is not available to trade right now.' };

  const cost = roundMoney(qty * price);
  if (cost > wallet.cash) return { ok: false, reason: 'Not enough virtual cash for this purchase.' };

  const existing = wallet.holdings.find((holding) => holding.companyId === companyId);
  let holdings: Holding[];

  if (existing) {
    const totalQty = existing.qty + qty;
    // Weighted average: blend what was already paid with what is paid now.
    const avgCost = roundMoney((existing.qty * existing.avgCost + qty * price) / totalQty);
    holdings = wallet.holdings.map((holding) =>
      holding.companyId === companyId ? { ...holding, qty: totalQty, avgCost } : holding,
    );
  } else {
    holdings = [...wallet.holdings, { companyId, qty, avgCost: roundMoney(price) }];
  }

  return {
    ok: true,
    wallet: { cash: roundMoney(wallet.cash - cost), holdings },
  };
}

/**
 * Sell `qty` shares of `companyId` at `prices[companyId]`.
 *
 * Never throws and never mutates `wallet`. `avgCost` of the remaining shares is
 * unchanged (realised gains are not tracked yet); a position that reaches 0 is
 * removed entirely.
 */
export function sell(
  wallet: Wallet,
  companyId: string,
  qty: number,
  prices: PriceMap,
): TradeResult {
  const qtyError = validateQty(qty);
  if (qtyError) return { ok: false, reason: qtyError };

  const price = validatePrice(prices, companyId);
  if (price === null) return { ok: false, reason: 'That company is not available to trade right now.' };

  const existing = wallet.holdings.find((holding) => holding.companyId === companyId);
  if (!existing || existing.qty <= 0) {
    return { ok: false, reason: 'You do not own any shares of that company.' };
  }
  if (qty > existing.qty) {
    return { ok: false, reason: 'You do not own enough shares to sell that many.' };
  }

  const remainingQty = existing.qty - qty;
  const holdings =
    remainingQty === 0
      ? wallet.holdings.filter((holding) => holding.companyId !== companyId)
      : wallet.holdings.map((holding) =>
          holding.companyId === companyId ? { ...holding, qty: remainingQty } : holding,
        );

  return {
    ok: true,
    wallet: { cash: roundMoney(wallet.cash + qty * price), holdings },
  };
}

/** Cost of `qty` shares at `unitPrice`, rounded to cents. Shared by buy/sell/UI previews. */
export function tradeCost(qty: number, unitPrice: number): number {
  return roundMoney(qty * unitPrice);
}
