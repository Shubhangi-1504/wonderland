import type {
  Company,
  Holding,
  HoldingValuation,
  PortfolioSummary,
  PriceMap,
  Sector,
  ValuePoint,
  Wallet,
} from '../types';
import { roundMoney, roundPercent, roundRatio } from './money';

/**
 * Read-only portfolio math. Nothing here mutates the wallet.
 * All money values are cents-rounded with `roundMoney`.
 */

/** Virtual cash every player starts with. Whole-account P&L is measured against it. */
export const STARTING_CASH = 10_000;

/** How many points `appendValuePoint` keeps (oldest are dropped). */
export const MAX_VALUE_HISTORY = 500;

/** Market value of one position, rounded to cents. Unknown prices count as 0. */
export function holdingValue(holding: Holding, prices: PriceMap): number {
  return roundMoney(holding.qty * (prices[holding.companyId] ?? 0));
}

/**
 * Open positions only: copies of `wallet.holdings` with `qty > 0`.
 * Returns a new array so callers can never mutate store state by accident.
 */
export function getHoldings(wallet: Wallet): Holding[] {
  return wallet.holdings.filter((holding) => holding.qty > 0).map((holding) => ({ ...holding }));
}

/** Unrealised P&L as a percentage of cost; 0 when there is no cost basis. */
function percentOf(part: number, whole: number): number {
  if (!Number.isFinite(whole) || whole <= 0) return 0;
  return roundPercent((part / whole) * 100);
}

/**
 * Total portfolio value at the given prices.
 *
 * - `totalValue = cash + sum(qty * price)`
 * - `totalPnL` covers the open positions only (`holdingsValue - totalCost`)
 * - `totalPnLVsStart` covers the whole account (`totalValue - STARTING_CASH`),
 *   so it also reflects cash that was never invested
 * - missing prices count as 0, so a half-updated price map can never produce NaN
 */
export function computePortfolio(wallet: Wallet, prices: PriceMap): PortfolioSummary {
  const cash = roundMoney(wallet.cash);
  const holdings = getHoldings(wallet);

  const rows: HoldingValuation[] = holdings.map((holding) => {
    const price = prices[holding.companyId] ?? 0;
    const marketValue = roundMoney(holding.qty * price);
    const cost = holding.qty * holding.avgCost;
    const pnl = roundMoney(marketValue - cost);
    return {
      companyId: holding.companyId,
      qty: holding.qty,
      avgCost: holding.avgCost,
      price: roundMoney(price),
      marketValue,
      pnl,
      pnlPct: percentOf(pnl, cost),
      weightPct: 0, // filled in below, once the total is known
    };
  });

  const holdingsValue = roundMoney(rows.reduce((sum, row) => sum + row.marketValue, 0));
  const totalCost = roundMoney(rows.reduce((sum, row) => sum + row.qty * row.avgCost, 0));
  const totalValue = roundMoney(cash + holdingsValue);
  const totalPnL = roundMoney(holdingsValue - totalCost);
  const totalPnLVsStart = roundMoney(totalValue - STARTING_CASH);

  // Weights depend on the total, so they are a second pass.
  const withWeights = rows.map((row) => ({
    ...row,
    weightPct: percentOf(row.marketValue, totalValue),
  }));

  return {
    cash,
    holdingsValue,
    totalValue,
    total: totalValue, // deprecated alias
    totalCost,
    totalPnL,
    totalPnLPct: percentOf(totalPnL, totalCost),
    totalPnLVsStart,
    totalPnLVsStartPct: percentOf(totalPnLVsStart, STARTING_CASH),
    holdings: withWeights,
  };
}

/**
 * Sectors the wallet currently has exposure to — the input for the
 * "diversify across sectors" mission. Unknown company ids are ignored.
 * Order follows `companies`, deduplicated.
 */
export function distinctSectors(wallet: Wallet, companies: readonly Company[]): Sector[] {
  const heldIds = new Set(getHoldings(wallet).map((holding) => holding.companyId));
  const sectors: Sector[] = [];
  for (const company of companies) {
    if (heldIds.has(company.id) && !sectors.includes(company.sector)) {
      sectors.push(company.sector);
    }
  }
  return sectors;
}

/**
 * Person B's diversification mission: does the player hold at least
 * `minSectors` different sectors (default 3 = all of them)?
 */
export function isDiversified(
  wallet: Wallet,
  companies: readonly Company[],
  minSectors: number = 3,
): boolean {
  return distinctSectors(wallet, companies).length >= Math.max(1, minSectors);
}

/**
 * Concentration measure for the concentrated-vs-diversified lesson:
 * the largest position's share of total portfolio value, from 0 to 1.
 * Returns 0 for an empty portfolio or a portfolio with no value.
 */
export function largestPositionWeight(wallet: Wallet, prices: PriceMap): number {
  const portfolio = computePortfolio(wallet, prices);
  if (portfolio.totalValue <= 0) return 0;
  const largest = portfolio.holdings.reduce((max, row) => Math.max(max, row.marketValue), 0);
  return roundRatio(largest / portfolio.totalValue);
}

/**
 * Append one point to the portfolio-value chart, keeping the most recent
 * `MAX_VALUE_HISTORY` (500) points. Pure: returns a new array.
 */
export function appendValuePoint(
  history: readonly ValuePoint[],
  t: number,
  totalValue: number,
): ValuePoint[] {
  const next = [...history, { t, totalValue: roundMoney(totalValue) }];
  return next.slice(-MAX_VALUE_HISTORY);
}
