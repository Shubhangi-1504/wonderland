/**
 * MONEYVERSE shared types.
 *
 * This file is the contract between all four people:
 *  - Person A (markets/world), Person B (UI/learning), Person C (sim, portfolio),
 *    Person D (AI assistant) all import from here.
 *
 * Keep it small and additive. Everything here is VIRTUAL money in a simulation:
 * there is no real brokerage, no real order book, no real transaction.
 *
 * Rounding rule used across `src/sim`: money and prices are rounded to 2 decimals
 * (cents) via `roundMoney()` in `src/sim/money.ts`. See that file for details.
 */

// ─── Sectors ────────────────────────────────────────────────────────────────

/**
 * Fictional sectors MONEYVERSE simulates.
 * Includes Person A's extended set (finance, health) alongside Person C's original set.
 */
export type Sector = 'tech' | 'energy' | 'consumer' | 'finance' | 'health';

// ─── Companies / Stocks ─────────────────────────────────────────────────────

/**
 * A fictional, tradable company (Person C's sim model).
 * Market cap is derived, never stored: `price * sharesOutstanding`.
 */
export interface Company {
  /** Stable slug, e.g. `'nova-loom'`. Used as the key in every `PriceMap`. */
  id: string;
  /** Display name, e.g. `'Nova Loom'`. */
  name: string;
  /** Fictional ticker symbol, e.g. `'NVLM'`. */
  ticker: string;
  /** Sector used for scenario shocks and diversification checks. */
  sector: Sector;
  /** Price at the start of the demo, in virtual dollars. */
  basePrice: number;
  /** Per-tick relative volatility (std-dev-ish, e.g. 0.02 = ~2%). */
  volatility: number;
  /** Sensitivity to market-wide moves: 1.5 falls 1.5x as hard as the market. */
  beta: number;
  /** One or two beginner-friendly sentences explaining the business. */
  description: string;
  /** Share count, so `price * sharesOutstanding` gives market cap. */
  sharesOutstanding: number;
}

/**
 * Lightweight stock view used by the UI / AI layers (Person A / Person D).
 * Maps to a `Company` but only exposes what the UI needs.
 */
export interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  beta: number;
  price: number;
  marketCap: number;
  description: string;
}

// ─── Prices ─────────────────────────────────────────────────────────────────

/** Company id → current virtual price. The single source of truth for prices. */
export type PriceMap = Record<string, number>;

/**
 * One timestamped price record. Every price the app shows comes from one of these.
 * `source` is always `'simulated'` — MONEYVERSE never shows live market data.
 */
export interface PricePoint {
  /** Simulation time in epoch milliseconds, supplied by the caller (never `Date.now()` inside `src/sim`). */
  t: number;
  /** Full snapshot of all prices at time `t`. */
  prices: PriceMap;
  /** Provenance marker. Always `'simulated'`; exists to make that explicit in the UI. */
  source: 'simulated';
}

// ─── Portfolio / Wallet ─────────────────────────────────────────────────────

/** One position in the virtual wallet (Person C sim model). */
export interface Holding {
  /** Company id this position refers to. */
  companyId: string;
  /** Whole shares owned. Never negative. */
  qty: number;
  /** Average virtual dollars paid per share, rounded to cents. */
  avgCost: number;
  /** Ticker symbol alias — used by UI/AI layers. */
  symbol?: string;
  /** Average price alias — used by UI/AI layers. */
  avgPrice?: number;
}

/** The player's virtual wallet: cash plus positions. */
export interface Wallet {
  /** Uninvested virtual dollars, rounded to cents. */
  cash: number;
  /** Positions. A company appears at most once; `getHoldings` drops zero-qty rows. */
  holdings: Holding[];
}

/**
 * Lightweight portfolio view used by the UI / AI layers.
 */
export interface Portfolio {
  cash: number;
  holdings: Holding[];
}

// ─── Trades ─────────────────────────────────────────────────────────────────

/**
 * Result of a buy/sell attempt. Never throws for user error —
 * the UI reads `reason` and shows it (e.g. "Not enough cash").
 */
export type TradeResult = { ok: true; wallet: Wallet } | { ok: false; reason: string };

// ─── Scenarios ──────────────────────────────────────────────────────────────

/**
 * A scripted market shock the player can trigger (Person C's full model).
 * Shocks are multiplied by each company's beta so effects differ per company.
 */
export interface CrashScenario {
  /** Stable id, e.g. `'tech-shock'`. */
  id: string;
  /** Short news-style headline shown in the UI. */
  headline: string;
  /** Two or three sentences of plain-English setup. */
  description: string;
  /** Market-wide relative move, e.g. `-0.2` for a 20% crash. */
  marketShock: number;
  /** Extra sector-specific relative move, e.g. `{ tech: -0.35 }`. */
  sectorShocks: Partial<Record<Sector, number>>;
  /** Company id → beginner-friendly "why did this fall?" explanation. */
  explanations: Record<string, string>;
}

/**
 * Lightweight scenario view used by the UI / AI layers (Person A / Person D).
 */
export interface Scenario {
  id: string;
  title: string;
  headline: string;
  /** Overall market move, e.g. -0.2 for a 20% crash. */
  marketShockPct: number;
  /** Optional per-sector multipliers layered on top of the market shock. */
  sectorBetas?: Partial<Record<Sector, number>>;
  explanation: string;
}

// ─── Scenario Results ────────────────────────────────────────────────────────

/** Before/after comparison used to explain a crash to the player (Person C). */
export interface ScenarioComparison {
  /** Total portfolio value before the shock, rounded to cents. */
  before: number;
  /** Total portfolio value after the shock, rounded to cents. */
  after: number;
  /** One row per held company so the UI can explain who got hurt and why. */
  perHolding: {
    companyId: string;
    /** Value of the position before the shock. */
    before: number;
    /** Value of the position after the shock. */
    after: number;
    /** `after - before` (negative when the position lost value). */
    delta: number;
  }[];
}

/** Scenario result used by the UI / AI layers (Person A / Person D). */
export interface ScenarioResult {
  scenarioId: string;
  before: number;
  after: number;
  perHolding: { symbol: string; before: number; after: number; changePct: number }[];
}

// ─── Portfolio Summary ───────────────────────────────────────────────────────

/** One position valued at current prices, with its share of the portfolio. */
export interface HoldingValuation {
  /** Company id this row refers to. */
  companyId: string;
  /** Whole shares owned. */
  qty: number;
  /** Average virtual dollars paid per share, rounded to cents. */
  avgCost: number;
  /** Current price, or 0 when the company has no price. */
  price: number;
  /** `qty * price`, rounded to cents. */
  marketValue: number;
  /** `marketValue - (qty * avgCost)`, rounded to cents. Negative means an unrealised loss. */
  pnl: number;
  /** Unrealised return as a percentage (e.g. `12.5` for +12.5%), 0 when cost is 0. */
  pnlPct: number;
  /** Share of total portfolio value, 0-100. Sums to about 100 across rows. */
  weightPct: number;
}

/**
 * Total portfolio value: cash plus current market value of all holdings.
 * Every number is rounded to cents (2 decimals) via `roundMoney`.
 */
export interface PortfolioSummary {
  /** Virtual cash on hand. */
  cash: number;
  /** Market value of all holdings at the prices passed in. */
  holdingsValue: number;
  /** `cash + holdingsValue`. This is the number the UI shows as net worth. */
  totalValue: number;
  /** @deprecated Alias of `totalValue`, kept so older call sites keep working. */
  total: number;
  /** What the open positions originally cost (`sum(qty * avgCost)`). */
  totalCost: number;
  /** Unrealised profit/loss of the open positions (`holdingsValue - totalCost`). */
  totalPnL: number;
  /** `totalPnL` as a percentage of `totalCost`, 0 when nothing is held. */
  totalPnLPct: number;
  /** Whole-account result vs `STARTING_CASH`: `totalValue - STARTING_CASH`. */
  totalPnLVsStart: number;
  /** `totalPnLVsStart` as a percentage of `STARTING_CASH`. */
  totalPnLVsStartPct: number;
  /** One row per open position, in wallet order. */
  holdings: HoldingValuation[];
}

// ─── Chart / Events ──────────────────────────────────────────────────────────

/** One point on the portfolio-value chart. */
export interface ValuePoint {
  /** Simulation time in epoch milliseconds. */
  t: number;
  /** Total portfolio value (cash + holdings) at time `t`, rounded to cents. */
  totalValue: number;
}

/** Something that just happened in the sim; the slice keeps only the latest. */
export interface SimEvent {
  /** What kind of thing happened. */
  kind: 'tick' | 'trade' | 'scenario' | 'reset';
  /** Simulation time in epoch milliseconds. */
  t: number;
  /** Short human-readable line, safe to show in a toast. */
  message: string;
}

// ─── Missions ────────────────────────────────────────────────────────────────

/**
 * PLACEHOLDER — Person B owns missions and may extend this freely.
 * Intentionally minimal: an id, learner-facing copy, and a virtual reward.
 */
export interface Mission {
  /** Stable id, e.g. `'diversify-3-sectors'`. */
  id: string;
  /** Short title shown on the mission card. */
  title: string;
  /** One-sentence goal in plain English. */
  description: string;
  /** Virtual dollars awarded on completion (not real money). */
  reward?: number;
  /** XP awarded on completion (Person B's extended field). */
  xpReward?: number;
  /** Whether the mission has been completed. */
  completed?: boolean;
}

/**
 * PLACEHOLDER — Person B owns this. Minimal per-mission progress record.
 */
export interface MissionProgress {
  /** Id of the `Mission` this row tracks. */
  missionId: string;
  /** True once the goal has been met. */
  completed: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Auth state used by the UI / Supabase integration (Person A). */
export interface AuthState {
  user: { id: string; email?: string } | null;
  isGuest: boolean;
}

// ─── AI / Chat ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Context the AI guide receives alongside the conversation (Person D). */
export interface GuideContext {
  portfolio: Portfolio | null;
  lastEvent: ScenarioResult | null;
}
