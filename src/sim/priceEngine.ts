import type { Company, PriceMap, PricePoint } from '../types';
import { roundMoney } from './money';
import { createRng, normal } from './rng';

/**
 * Price engine: turns a price map into the next price map.
 *
 * Rules (must hold for every implementation):
 *  - pure: same inputs -> same output; no `Date.now()`, no `Math.random()`
 *    (time and randomness both arrive as arguments)
 *  - prices never go below `MIN_PRICE`
 *  - output values are rounded to cents via `roundMoney`
 */

/** Per-tick volatility of the shared "whole market" factor (~1% per tick). */
export const MARKET_VOL = 0.01;

/** Price floor. A simulated share can get cheap, but never reaches zero. */
export const MIN_PRICE = 0.01;

/** Default number of points in the generated starting history. */
export const DEFAULT_HISTORY_POINTS = 60;

/** Default simulated time between history points (60s), used for chart spacing. */
export const DEFAULT_STEP_MS = 60_000;

/** Clamp a raw price into the legal range and round it to cents. */
function normalizePrice(value: number): number {
  return Math.max(MIN_PRICE, roundMoney(value));
}

/**
 * Starting prices for every company, taken from `Company.basePrice`.
 * The history generator uses this for its first point, so the chart starts flat.
 */
export function initialPrices(companies: readonly Company[]): PriceMap {
  const prices: PriceMap = {};
  for (const company of companies) {
    prices[company.id] = normalizePrice(company.basePrice);
  }
  return prices;
}

/**
 * Advance every price by one tick and stamp the result.
 *
 * Model per tick:
 *   marketReturn      = normal(rng) * MARKET_VOL          (shared by all companies)
 *   idiosyncratic     = normal(rng) * company.volatility  (one draw per company)
 *   companyReturn     = company.beta * marketReturn + idiosyncratic
 *   price            *= 1 + companyReturn                 (clamped, cents-rounded)
 *
 * So a high-beta name amplifies market moves while its own volatility adds noise.
 *
 * @param prices Current prices (not mutated).
 * @param companies Companies to price; other keys in `prices` are preserved as-is.
 * @param rng Seeded generator returning `[0, 1)`.
 * @param t Simulation time in epoch ms, supplied by the caller.
 * @returns A new `PricePoint` whose `source` is always `'simulated'`.
 */
export function tickPrices(
  prices: PriceMap,
  companies: readonly Company[],
  rng: () => number,
  t: number,
): PricePoint {
  const nextPrices: PriceMap = { ...prices };

  // One shared draw: when the market falls, every company feels part of it.
  const marketReturn = normal(rng) * MARKET_VOL;

  for (const company of companies) {
    const current = prices[company.id] ?? company.basePrice;
    const idiosyncraticReturn = normal(rng) * company.volatility;
    const companyReturn = company.beta * marketReturn + idiosyncraticReturn;
    nextPrices[company.id] = normalizePrice(current * (1 + companyReturn));
  }

  return { t, prices: nextPrices, source: 'simulated' };
}

/**
 * Guard used by UI/summary code: is this a usable price?
 * (finite, at least `MIN_PRICE`, cents-rounded). Kept here so the rule lives in one place.
 */
export function isValidPrice(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_PRICE &&
    value === roundMoney(value)
  );
}

/**
 * Build a deterministic starting history so the chart is not empty on first load.
 *
 * The first point is `initialPrices(companies)` at `startT`; each later point is
 * `stepMs` further along and produced by `tickPrices` with the same rng, which
 * makes the whole series reproducible from `seed` alone.
 *
 * @param steps Total number of points to return (including the first). `< 1` yields one point.
 * @param startT Timestamp of the first point.
 * @param stepMs Simulated time between points.
 */
export function generateHistory(
  companies: readonly Company[],
  seed: number,
  steps: number = DEFAULT_HISTORY_POINTS,
  startT: number = 0,
  stepMs: number = DEFAULT_STEP_MS,
): PricePoint[] {
  // One rng for the whole series, so the history depends only on `seed`.
  const rng = createRng(seed);
  const pointCount = Math.max(1, Math.floor(steps));

  let point: PricePoint = { t: startT, prices: initialPrices(companies), source: 'simulated' };
  const history: PricePoint[] = [point];

  for (let i = 1; i < pointCount; i += 1) {
    point = tickPrices(point.prices, companies, rng, startT + i * stepMs);
    history.push(point);
  }

  return history;
}
