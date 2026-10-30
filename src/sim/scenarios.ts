import type {
  Company,
  CrashScenario,
  PriceMap,
  ScenarioComparison,
  Wallet,
} from '../types';

/**
 * Scripted market shocks. These are the "teaching moments" of MONEYVERSE:
 * the same news hits companies differently, and that difference is the lesson.
 *
 * Shock formula (single source of truth, Person C implements to it):
 *   move  = scenario.marketShock + (scenario.sectorShocks[company.sector] ?? 0)
 *   after = clampPrice(price * (1 + company.beta * move))
 * So a -20% market move hits beta 1.5 about -30% and beta 0.6 about -12%.
 */

/** Applying a shock: pure, beta-scaled, never below 0, cents-rounded. */
export function applyScenario(
  prices: PriceMap,
  companies: readonly Company[],
  scenario: CrashScenario,
): PriceMap {
  void prices;
  void companies;
  void scenario;
  // TODO(Person C): implement the formula documented above.
  throw new Error('not implemented');
}

/**
 * Before/after totals plus a per-holding breakdown, for the crash explainer UI.
 *
 * Each company held in `wallet` gets one row; rows with `delta === 0` are fine to
 * keep. Values come from `qty * price` (0 when a price is missing) and are
 * cents-rounded. `before`/`after` come from `computePortfolio().total`.
 */
export function compareBeforeAfter(
  wallet: Wallet,
  before: PriceMap,
  after: PriceMap,
): ScenarioComparison {
  void wallet;
  void before;
  void after;
  // TODO(Person C): implement per the contract above.
  throw new Error('not implemented');
}

/**
 * A broad -20% market crash. High-beta names fall hardest; the consumer staple
 * barely notices. This is the "why do I own risky stocks?" scenario.
 */
export const MARKET_CRASH_20: CrashScenario = {
  id: 'market-crash-20',
  headline: 'Panic selling: markets drop 20% in a day',
  description:
    'Frightened investors sell everything at once. The whole market falls about 20%, but not every company falls by the same amount: share prices that move more than the market drop further.',
  marketShock: -0.2,
  sectorShocks: {},
  explanations: {
    'nova-loom':
      'Nova Loom has a beta of 1.5, so a 20% market drop is amplified: its shares fell roughly 30%. Fast-growing tech is priced for the future, so fear hits it hardest.',
    'hearth-harbor':
      'Hearth & Harbor has a beta of 0.6, so it only fell about 12%. People still buy kettles and bedding in a downturn, which is why the stock is calmer.',
    'voltara-grid':
      'Voltara Grid has a beta of 1.0, so it moved with the market and fell about 20%. Steady demand did not protect it from a market-wide sell-off.',
  },
};

/**
 * A tech-sector shock: the market barely moves, but tech drops 35%.
 * This is the "diversification protects you" scenario.
 */
export const TECH_SHOCK: CrashScenario = {
  id: 'tech-shock',
  headline: 'Tech earnings miss: chip and AI stocks slide',
  description:
    'A big tech company reports disappointing earnings and the whole sector sells off. The rest of the market is almost unaffected, so only tech-heavy portfolios feel it.',
  marketShock: 0,
  sectorShocks: { tech: -0.35 },
  explanations: {
    'nova-loom':
      'Nova Loom is a tech company, so the sector drop of 35% hits it, amplified by its beta of 1.5: its shares fell about 52%.',
    'hearth-harbor':
      'Hearth & Harbor sells home goods, not software, so the tech sell-off did not touch it. Its price was unchanged.',
    'voltara-grid':
      'Voltara Grid is in energy, so it was not part of the tech sell-off. Its price was unchanged.',
  },
};

/** All scenarios the UI can trigger, in display order. */
export const SCENARIOS: readonly CrashScenario[] = [MARKET_CRASH_20, TECH_SHOCK];

/** Look up a scenario by id. Returns `undefined` for unknown ids. */
export function getScenario(id: string): CrashScenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

/** Total portfolio value before/after, rounded to cents; used by the slice for `lastEvent`. */
export function shockImpact(wallet: Wallet, before: PriceMap, after: PriceMap): {
  before: number;
  after: number;
  delta: number;
} {
  void wallet;
  void before;
  void after;
  // TODO(Person C): implement once `compareBeforeAfter` exists.
  throw new Error('not implemented');
}
