/**
 * Public entry point of the simulation package.
 *
 * `src/sim` is pure TypeScript: no React, no DOM, no store imports, no
 * `Date.now()`/`Math.random()` inside logic. Time and randomness are passed in.
 * Shared domain types live in `src/types.ts`.
 */

export { COMPANIES, getCompany } from './companies';
export { MONEY_DECIMALS, clampPrice, roundMoney, roundPercent, roundRatio } from './money';
export { createRng, normal } from './rng';
export {
  DEFAULT_HISTORY_POINTS,
  DEFAULT_STEP_MS,
  MARKET_VOL,
  MIN_PRICE,
  generateHistory,
  initialPrices,
  isValidPrice,
  tickPrices,
} from './priceEngine';
export { STARTING_CASH, buy, sell, tradeCost } from './trading';
export {
  MAX_VALUE_HISTORY,
  appendValuePoint,
  computePortfolio,
  distinctSectors,
  getHoldings,
  holdingValue,
  isDiversified,
  largestPositionWeight,
} from './portfolio';
export {
  MARKET_CRASH_20,
  SCENARIOS,
  TECH_SHOCK,
  applyScenario,
  compareBeforeAfter,
  getScenario,
  shockImpact,
} from './scenarios';
export { buildAISummary, summarizeForAI } from './summary';
export type { AISummary } from './summary';
