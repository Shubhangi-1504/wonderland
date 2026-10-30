import { describe, expect, it } from 'vitest';
import { COMPANIES } from '../companies';
import {
  MAX_VALUE_HISTORY,
  STARTING_CASH,
  appendValuePoint,
  computePortfolio,
  distinctSectors,
  getHoldings,
  holdingValue,
  isDiversified,
  largestPositionWeight,
} from '../portfolio';
import { buy } from '../trading';
import type { PriceMap, Wallet } from '../../types';

const PRICES: PriceMap = { 'nova-loom': 100, 'hearth-harbor': 50, 'voltara-grid': 25 };

function emptyWallet(cash = STARTING_CASH): Wallet {
  return { cash, holdings: [] };
}

// ─── computePortfolio ────────────────────────────────────────────────────────

describe('computePortfolio', () => {
  it('returns cash only for an empty wallet', () => {
    const result = computePortfolio(emptyWallet(), PRICES);

    expect(result.cash).toBe(STARTING_CASH);
    expect(result.holdingsValue).toBe(0);
    expect(result.totalValue).toBe(STARTING_CASH);
    expect(result.holdings).toEqual([]);
  });

  it('has no NaN or Infinity in any numeric field for an empty portfolio', () => {
    const result = computePortfolio(emptyWallet(), {});

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'number') {
        expect(Number.isFinite(value), `${key} should be finite`).toBe(true);
      }
    }
    // The tricky ones — dividing by 0 cost or 0 total:
    expect(result.totalPnLPct).toBe(0);
    expect(result.totalPnLVsStartPct).toBe(0);
  });

  it('values holdings at the given prices', () => {
    // Buy 10 nova-loom at 100 → cash falls to 9000, holdings worth 1000.
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const result = computePortfolio(bought.wallet, PRICES);

    expect(result.holdingsValue).toBe(1_000);
    expect(result.totalValue).toBe(STARTING_CASH); // value is conserved
    expect(result.holdings).toHaveLength(1);
    expect(result.holdings[0]?.companyId).toBe('nova-loom');
    expect(result.holdings[0]?.qty).toBe(10);
    expect(result.holdings[0]?.marketValue).toBe(1_000);
  });

  it('computes correct P&L after a price increase', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES); // bought at 100
    if (!bought.ok) throw new Error('setup failed');

    const newPrices = { ...PRICES, 'nova-loom': 110 };
    const result = computePortfolio(bought.wallet, newPrices);

    // position: 10 shares × (110 - 100) = $100 gain
    expect(result.holdings[0]?.pnl).toBe(100);
    expect(result.holdings[0]?.pnlPct).toBeGreaterThan(0);
    expect(result.totalPnL).toBe(100);
  });

  it('computes negative P&L after a price decrease', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES); // bought at 100
    if (!bought.ok) throw new Error('setup failed');

    const lowerPrices = { ...PRICES, 'nova-loom': 90 };
    const result = computePortfolio(bought.wallet, lowerPrices);

    expect(result.holdings[0]?.pnl).toBe(-100);
    expect(result.holdings[0]?.pnlPct).toBeLessThan(0);
  });

  it('treats missing prices as zero without producing NaN', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const result = computePortfolio(bought.wallet, {}); // price map is empty

    expect(result.holdingsValue).toBe(0);
    expect(Number.isNaN(result.totalValue)).toBe(false);
    expect(Number.isNaN(result.totalPnLPct)).toBe(false);
    // pnl = 0 (market value) - 1000 (cost basis)
    expect(result.holdings[0]?.pnl).toBe(-1_000);
  });

  it('holding weights sum to approximately the invested fraction of total value', () => {
    // Two positions across two companies.
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 10, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 10, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');

    const result = computePortfolio(r2.wallet, PRICES);
    const totalWeight = result.holdings.reduce((sum, h) => sum + h.weightPct, 0);

    // holdingsValue = 10×100 + 10×50 = 1500; totalValue = 3500 (cash 2000 + holdings 1500).
    // Each weight is marketValue/totalValue×100, so weights should sum to ~holdingsValue/totalValue×100
    const expectedTotalWeight = (result.holdingsValue / result.totalValue) * 100;
    expect(totalWeight).toBeCloseTo(expectedTotalWeight, 0);
    expect(totalWeight).toBeLessThanOrEqual(100);
  });

  it('totalPnLVsStart reflects the whole account, not just open positions', () => {
    // Start at $10,000, nothing invested → no gain/loss.
    expect(computePortfolio(emptyWallet(), PRICES).totalPnLVsStart).toBe(0);

    // Withdraw money from the game (simulate a loss by giving less starting cash).
    const result = computePortfolio({ cash: 9_000, holdings: [] }, PRICES);
    expect(result.totalPnLVsStart).toBe(-1_000);
    expect(result.totalPnLVsStartPct).toBeLessThan(0);
  });

  it('deprecated total alias equals totalValue', () => {
    const result = computePortfolio(emptyWallet(), PRICES);
    expect(result.total).toBe(result.totalValue);
  });
});

// ─── getHoldings ─────────────────────────────────────────────────────────────

describe('getHoldings', () => {
  it('returns an empty array for an empty wallet', () => {
    expect(getHoldings(emptyWallet())).toEqual([]);
  });

  it('drops zero-quantity rows', () => {
    const wallet: Wallet = {
      cash: 1_000,
      holdings: [
        { companyId: 'nova-loom', qty: 0, avgCost: 100 },
        { companyId: 'hearth-harbor', qty: 5, avgCost: 50 },
      ],
    };
    const result = getHoldings(wallet);

    expect(result).toHaveLength(1);
    expect(result[0]?.companyId).toBe('hearth-harbor');
  });

  it('returns a new array, not a reference to the original', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 1, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const result = getHoldings(bought.wallet);
    expect(result).not.toBe(bought.wallet.holdings);
    // Mutating the result must not affect the wallet.
    result[0]!.qty = 9999;
    expect(bought.wallet.holdings[0]?.qty).toBe(1);
  });
});

// ─── distinctSectors ─────────────────────────────────────────────────────────

describe('distinctSectors', () => {
  it('returns empty for an empty wallet', () => {
    expect(distinctSectors(emptyWallet(), COMPANIES)).toEqual([]);
  });

  it('returns the sector for a single holding', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 1, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const sectors = distinctSectors(bought.wallet, COMPANIES);
    expect(sectors).toContain('tech');
    expect(sectors).toHaveLength(1);
  });

  it('deduplicates sectors across multiple holdings in the same sector', () => {
    // Only one tech company exists, so this just checks deduplication logic.
    const bought = buy(emptyWallet(), 'nova-loom', 1, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const sectors = distinctSectors(bought.wallet, COMPANIES);
    const unique = new Set(sectors);
    expect(sectors.length).toBe(unique.size);
  });

  it('returns all three sectors when all companies are held', () => {
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 1, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 1, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');
    const r3 = buy(r2.wallet, 'voltara-grid', 1, PRICES);
    if (!r3.ok) throw new Error('buy 3 failed');

    const sectors = distinctSectors(r3.wallet, COMPANIES);
    expect(sectors).toHaveLength(3);
    expect(sectors).toContain('tech');
    expect(sectors).toContain('consumer');
    expect(sectors).toContain('energy');
  });

  it('ignores holdings with unknown company ids', () => {
    const wallet: Wallet = {
      cash: 1_000,
      holdings: [{ companyId: 'ghost-corp', qty: 1, avgCost: 10 }],
    };
    expect(distinctSectors(wallet, COMPANIES)).toEqual([]);
  });
});

// ─── isDiversified ────────────────────────────────────────────────────────────

describe('isDiversified', () => {
  it('returns false for an empty wallet', () => {
    expect(isDiversified(emptyWallet(), COMPANIES)).toBe(false);
  });

  it('returns false when only one sector is held (minSectors = 3)', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 1, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    expect(isDiversified(bought.wallet, COMPANIES, 3)).toBe(false);
  });

  it('returns true when all three sectors are held', () => {
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 1, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 1, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');
    const r3 = buy(r2.wallet, 'voltara-grid', 1, PRICES);
    if (!r3.ok) throw new Error('buy 3 failed');

    expect(isDiversified(r3.wallet, COMPANIES, 3)).toBe(true);
  });

  it('uses minSectors = 2 correctly', () => {
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 1, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 1, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');

    expect(isDiversified(r2.wallet, COMPANIES, 2)).toBe(true);
    expect(isDiversified(r2.wallet, COMPANIES, 3)).toBe(false);
  });
});

// ─── largestPositionWeight ───────────────────────────────────────────────────

describe('largestPositionWeight', () => {
  it('returns 0 for an empty wallet', () => {
    expect(largestPositionWeight(emptyWallet(), PRICES)).toBe(0);
  });

  it('returns a value in [0, 1]', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const weight = largestPositionWeight(bought.wallet, PRICES);
    expect(weight).toBeGreaterThan(0);
    expect(weight).toBeLessThanOrEqual(1);
  });

  it('is smaller when the portfolio is more spread out', () => {
    // Concentrated: one company.
    const r1 = buy(emptyWallet(), 'nova-loom', 50, PRICES);
    if (!r1.ok) throw new Error('setup failed');
    const concentrated = largestPositionWeight(r1.wallet, PRICES);

    // Spread: three companies.
    const r2 = buy(emptyWallet(5_000), 'nova-loom', 10, PRICES);
    if (!r2.ok) throw new Error('setup failed');
    const r3 = buy(r2.wallet, 'hearth-harbor', 10, PRICES);
    if (!r3.ok) throw new Error('setup failed');
    const r4 = buy(r3.wallet, 'voltara-grid', 10, PRICES);
    if (!r4.ok) throw new Error('setup failed');
    const spread = largestPositionWeight(r4.wallet, PRICES);

    expect(concentrated).toBeGreaterThan(spread);
  });
});

// ─── holdingValue ────────────────────────────────────────────────────────────

describe('holdingValue', () => {
  it('returns qty × price rounded to cents', () => {
    const holding = { companyId: 'nova-loom', qty: 7, avgCost: 100 };
    expect(holdingValue(holding, PRICES)).toBe(700);
  });

  it('returns 0 when the company has no price', () => {
    const holding = { companyId: 'nova-loom', qty: 7, avgCost: 100 };
    expect(holdingValue(holding, {})).toBe(0);
  });
});

// ─── appendValuePoint ────────────────────────────────────────────────────────

describe('appendValuePoint', () => {
  it('appends a point to an empty history', () => {
    const result = appendValuePoint([], 1_000, 10_000);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ t: 1_000, totalValue: 10_000 });
  });

  it('does not mutate the input array', () => {
    const history = [{ t: 0, totalValue: 10_000 }];
    appendValuePoint(history, 1_000, 10_100);
    expect(history).toHaveLength(1); // original unchanged
  });

  it(`caps the array at ${MAX_VALUE_HISTORY} points, dropping the oldest`, () => {
    const history = Array.from({ length: MAX_VALUE_HISTORY }, (_, i) => ({
      t: i,
      totalValue: 10_000,
    }));
    const result = appendValuePoint(history, MAX_VALUE_HISTORY, 9_999);

    expect(result).toHaveLength(MAX_VALUE_HISTORY);
    // The new point must be last; the first point (t=0) must be gone.
    expect(result[result.length - 1]).toEqual({ t: MAX_VALUE_HISTORY, totalValue: 9_999 });
    expect(result[0]?.t).toBe(1); // t=0 was dropped
  });
});
