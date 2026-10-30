import type { StateCreator } from 'zustand';

import type {
  CrashScenario,
  PriceMap,
  PricePoint,
  SimEvent,
  TradeResult,
  ValuePoint,
  Wallet,
} from '../types';
import {
  COMPANIES,
  STARTING_CASH,
  appendValuePoint,
  buy as buyWithPrices,
  computePortfolio,
  createRng,
  generateHistory,
  getCompany,
  initialPrices,
  sell as sellWithPrices,
  summarizeForAI,
  tickPrices,
} from '../sim';

/**
 * Person C's Zustand slice.
 *
 * Self-contained: it depends only on `src/types.ts` and `src/sim/`, and it owns
 * every field under names that cannot collide with the learning or AI slices.
 * Compose it into the root store like any other slice:
 *
 *   useStore = create<RootState>()((...a) => ({
 *     ...createSimSlice(...a),
 *     ...createLearningSlice(...a),
 *     ...createAiSlice(...a),
 *   }));
 *
 * This slice is the ONLY place allowed to read the clock (`Date.now()`). All
 * simulation logic lives in `src/sim/` and receives time/randomness as arguments.
 */

/** Fixed seed so every demo run shows the same price path. */
export const DEMO_SEED = 1337;

/** How many price points to keep in `priceHistory` (sparkline-friendly, bounded memory). */
export const MAX_PRICE_HISTORY = 240;

/** The slice's state fields. */
export interface SimState {
  /** Virtual cash + positions. Starts at `STARTING_CASH` (10,000). */
  wallet: Wallet;
  /** Current price per company id. */
  prices: PriceMap;
  /** Timestamped price snapshots, oldest first, capped at `MAX_PRICE_HISTORY`. */
  priceHistory: PricePoint[];
  /** Portfolio value over time, oldest first, capped at `MAX_VALUE_HISTORY` (500). */
  valueHistory: ValuePoint[];
  /** Number of ticks applied since the last reset; also the rng offset. */
  tickCount: number;
  /** Seed for the deterministic price path. */
  seed: number;
  /** The shock currently being explained, or `null`. */
  activeScenario: CrashScenario | null;
  /** Most recent thing that happened, for toasts and the AI assistant. */
  lastEvent: SimEvent | null;
}

/** The slice's actions. Each one delegates the real work to `src/sim/`. */
export interface SimActions {
  /** Buy whole shares at the current price. Never throws for user error; inspect the result. */
  buy: (companyId: string, qty: number) => TradeResult;
  /** Sell whole shares at the current price. Never throws for user error; inspect the result. */
  sell: (companyId: string, qty: number) => TradeResult;
  /**
   * Advance the simulation by one tick.
   * @param t Simulation time in epoch ms; defaults to `Date.now()` at this edge.
   */
  tick: (t?: number) => void;
  /** TODO(phase 2): crash scenarios live in `src/sim/scenarios.ts`. */
  triggerScenario: (id: string) => void;
  /** Back to starting cash, base prices, fresh history; clears value history and events. */
  resetDemo: () => void;
}

/** Combined slice type, handy for `useStore` selectors. */
export type SimSlice = SimState & SimActions;

/** Fresh initial state; also used by `resetDemo`. */
export function createInitialSimState(seed: number = DEMO_SEED): SimState {
  const priceHistory = generateHistory(COMPANIES, seed);
  const latest = priceHistory[priceHistory.length - 1];

  return {
    wallet: { cash: STARTING_CASH, holdings: [] },
    prices: latest ? { ...latest.prices } : initialPrices(COMPANIES),
    priceHistory,
    valueHistory: [],
    tickCount: 0,
    seed,
    activeScenario: null,
    lastEvent: null,
  };
}

export const createSimSlice: StateCreator<SimSlice, [], [], SimSlice> = (set, get) => {
  const pushPricePoint = (history: PricePoint[], point: PricePoint): PricePoint[] =>
    [...history, point].slice(-MAX_PRICE_HISTORY);

  /** Company display name for UI-facing messages (falls back to the id). */
  const nameOf = (companyId: string): string =>
    getCompany(COMPANIES, companyId)?.name ?? companyId;

  return {
    ...createInitialSimState(),

    buy: (companyId, qty) => {
      const { wallet, prices, valueHistory } = get();
      const result = buyWithPrices(wallet, companyId, qty, prices);
      const t = Date.now();

      if (!result.ok) {
        set({ lastEvent: { kind: 'trade', t, message: result.reason } });
        return result;
      }

      const spent = wallet.cash - result.wallet.cash;
      set({
        wallet: result.wallet,
        valueHistory: appendValuePoint(
          valueHistory,
          t,
          computePortfolio(result.wallet, prices).totalValue,
        ),
        lastEvent: {
          kind: 'trade',
          t,
          message: `Bought ${qty} share${qty === 1 ? '' : 's'} of ${nameOf(companyId)} for $${spent.toFixed(2)}`,
        },
      });
      return result;
    },

    sell: (companyId, qty) => {
      const { wallet, prices, valueHistory } = get();
      const result = sellWithPrices(wallet, companyId, qty, prices);
      const t = Date.now();

      if (!result.ok) {
        set({ lastEvent: { kind: 'trade', t, message: result.reason } });
        return result;
      }

      const received = result.wallet.cash - wallet.cash;
      set({
        wallet: result.wallet,
        valueHistory: appendValuePoint(
          valueHistory,
          t,
          computePortfolio(result.wallet, prices).totalValue,
        ),
        lastEvent: {
          kind: 'trade',
          t,
          message: `Sold ${qty} share${qty === 1 ? '' : 's'} of ${nameOf(companyId)} for $${received.toFixed(2)}`,
        },
      });
      return result;
    },

    tick: (t = Date.now()) => {
      const { prices, priceHistory, valueHistory, tickCount, seed, wallet } = get();

      // Fresh rng per tick from seed + tickCount: deterministic and replayable.
      const rng = createRng(seed + tickCount);
      const point = tickPrices(prices, COMPANIES, rng, t);

      set({
        prices: point.prices,
        priceHistory: pushPricePoint(priceHistory, point),
        valueHistory: appendValuePoint(
          valueHistory,
          t,
          computePortfolio(wallet, point.prices).totalValue,
        ),
        tickCount: tickCount + 1,
        lastEvent: { kind: 'tick', t, message: 'Prices updated' },
      });
    },

    triggerScenario: (id) => {
      // TODO(phase 2): call `getScenario` + `applyScenario`, push a price point and
      // fill `activeScenario`. Deliberately a no-op for now so the UI cannot crash
      // on the still-unimplemented shock helpers.
      set({
        lastEvent: {
          kind: 'scenario',
          t: Date.now(),
          message: `Scenario "${id}" arrives in the next update.`,
        },
      });
    },

    resetDemo: () => {
      set({ ...createInitialSimState(get().seed) });
    },
  };
};

/** Current portfolio breakdown, recomputed from the slice's wallet and prices. */
export function selectPortfolio(state: SimState) {
  return computePortfolio(state.wallet, state.prices);
}

/** Compact JSON for Person D's assistant, built from the slice's live state. */
export function selectSummaryForAI(state: SimState): string {
  return summarizeForAI(state.wallet, state.prices, COMPANIES, state.lastEvent);
}
