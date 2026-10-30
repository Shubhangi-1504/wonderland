import type { Company, PriceMap, Sector, SimEvent, Wallet } from '../types';
import { computePortfolio, distinctSectors, largestPositionWeight } from './portfolio';
import { roundPercent } from './money';

/**
 * Compact snapshot of the virtual portfolio for Person D's AI assistant.
 * It must stay small (a few hundred bytes, well under ~600 tokens), contain no
 * raw ids or internal fields, and never carry personally identifying information.
 */
export interface AISummary {
  /** Always true: the assistant must know this is a simulation, not real money. */
  simulated: true;
  /** Simulation time of the latest event, or 0 before anything has happened. */
  asOf: number;
  /** Virtual cash on hand. */
  cash: number;
  /** Net worth: cash + holdings value. */
  totalValue: number;
  /** Whole-account result vs the 10,000 starting cash. */
  totalPnLVsStart: number;
  /** One row per open position, company name only (no ids). */
  holdings: {
    name: string;
    sector: Sector;
    qty: number;
    marketValue: number;
    /** Share of total portfolio value, 0-100. */
    weightPct: number;
    /** Unrealised return on this position, in percent. */
    pnlPct: number;
  }[];
  diversification: {
    /** How many different sectors the player holds (0-3). */
    sectorsHeld: number;
    /** Largest single position as a percentage of the portfolio (0-100). */
    largestPositionPct: number;
  };
  /** One short human-readable line, or null if nothing has happened yet. */
  lastEvent: string | null;
}

/**
 * Build the summary object. Separated from `summarizeForAI` so tests and Person D
 * can inspect the values without parsing JSON.
 *
 * No clock is read here: `asOf` is the sim timestamp carried by `lastEvent`
 * (0 before the first event). Person D can overwrite it with wall-clock time.
 *
 * @param wallet Player wallet (not mutated).
 * @param prices Current price map; missing prices count as 0.
 * @param companies The tradable companies, used for names and sectors.
 * @param lastEvent Most recent sim event, or `null` at the start of a session.
 */
export function buildAISummary(
  wallet: Wallet,
  prices: PriceMap,
  companies: readonly Company[],
  lastEvent: SimEvent | null,
): AISummary {
  const portfolio = computePortfolio(wallet, prices);
  const byId = new Map(companies.map((company) => [company.id, company]));

  const holdings: AISummary['holdings'] = [];
  for (const row of portfolio.holdings) {
    const company = byId.get(row.companyId);
    // Unknown ids are dropped: the model should not see internal keys.
    if (!company) continue;
    holdings.push({
      name: company.name,
      sector: company.sector,
      qty: row.qty,
      marketValue: row.marketValue,
      weightPct: row.weightPct,
      pnlPct: row.pnlPct,
    });
  }

  return {
    simulated: true,
    asOf: lastEvent ? lastEvent.t : 0,
    cash: portfolio.cash,
    totalValue: portfolio.totalValue,
    totalPnLVsStart: portfolio.totalPnLVsStart,
    holdings,
    diversification: {
      sectorsHeld: distinctSectors(wallet, companies).length,
      largestPositionPct: roundPercent(largestPositionWeight(wallet, prices) * 100),
    },
    lastEvent: lastEvent ? lastEvent.message : null,
  };
}

/**
 * Compact JSON for the AI assistant's prompt context.
 *
 * Deterministic key order (object literal order), no whitespace, no ids, no NaN:
 * every number has already been rounded by `src/sim/money`.
 *
 * @param wallet Player wallet (not mutated).
 * @param prices Current price map.
 * @param companies The tradable companies, used for names and sectors.
 * @param lastEvent Most recent sim event, or `null`.
 * @returns A JSON string such as
 *   `{"simulated":true,"asOf":0,"cash":10000,...,"lastEvent":null}`.
 */
export function summarizeForAI(
  wallet: Wallet,
  prices: PriceMap,
  companies: readonly Company[],
  lastEvent: SimEvent | null,
): string {
  return JSON.stringify(buildAISummary(wallet, prices, companies, lastEvent));
}
