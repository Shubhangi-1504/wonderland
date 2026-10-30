import { describe, expect, it } from 'vitest';
import { COMPANIES } from '../companies';
import { STARTING_CASH } from '../portfolio';
import { buy } from '../trading';
import { buildAISummary, summarizeForAI } from '../summary';
import type { PriceMap, SimEvent, Wallet } from '../../types';

const PRICES: PriceMap = { 'nova-loom': 100, 'hearth-harbor': 50, 'voltara-grid': 25 };

function emptyWallet(cash = STARTING_CASH): Wallet {
  return { cash, holdings: [] };
}

// ─── buildAISummary ───────────────────────────────────────────────────────────

describe('buildAISummary', () => {
  it('always carries simulated: true', () => {
    expect(buildAISummary(emptyWallet(), PRICES, COMPANIES, null).simulated).toBe(true);
  });

  it('contains no undefined or NaN in any field for a fresh wallet', () => {
    const result = buildAISummary(emptyWallet(), {}, COMPANIES, null);

    const inspect = (obj: unknown, path = '') => {
      if (Array.isArray(obj)) {
        obj.forEach((item, i) => inspect(item, `${path}[${i}]`));
      } else if (obj !== null && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          inspect(value, path ? `${path}.${key}` : key);
        }
      } else {
        expect(obj, `${path} must not be undefined`).not.toBeUndefined();
        if (typeof obj === 'number') {
          expect(Number.isNaN(obj), `${path} must not be NaN`).toBe(false);
        }
      }
    };

    inspect(result);
  });

  it('sets lastEvent to null when no event has occurred', () => {
    expect(buildAISummary(emptyWallet(), PRICES, COMPANIES, null).lastEvent).toBeNull();
  });

  it('sets asOf to 0 before any event', () => {
    expect(buildAISummary(emptyWallet(), PRICES, COMPANIES, null).asOf).toBe(0);
  });

  it('copies the lastEvent message and its timestamp', () => {
    const event: SimEvent = { kind: 'trade', t: 5_000, message: 'Bought 3 shares of Nova Loom' };
    const result = buildAISummary(emptyWallet(), PRICES, COMPANIES, event);

    expect(result.lastEvent).toBe('Bought 3 shares of Nova Loom');
    expect(result.asOf).toBe(5_000);
  });

  it('exposes holdings by company name, never by internal id', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 5, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const result = buildAISummary(bought.wallet, PRICES, COMPANIES, null);

    expect(result.holdings).toHaveLength(1);
    expect(result.holdings[0]?.name).toBe('Nova Loom');
    // The id 'nova-loom' must not appear anywhere in the output.
    expect(JSON.stringify(result)).not.toContain('nova-loom');
  });

  it('includes sector, qty, marketValue, weightPct, pnlPct per holding', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 5, PRICES); // bought at $100
    if (!bought.ok) throw new Error('setup failed');

    const higherPrices = { ...PRICES, 'nova-loom': 120 };
    const result = buildAISummary(bought.wallet, higherPrices, COMPANIES, null);
    const holding = result.holdings[0];

    expect(holding).toBeDefined();
    expect(holding?.sector).toBe('tech');
    expect(holding?.qty).toBe(5);
    expect(holding?.marketValue).toBe(600); // 5 × 120
    expect(holding?.pnlPct).toBeGreaterThan(0); // price rose
    expect(holding?.weightPct).toBeGreaterThan(0);
  });

  it('reports 0 sectorsHeld and 0 largestPositionPct for an empty wallet', () => {
    const result = buildAISummary(emptyWallet(), PRICES, COMPANIES, null);

    expect(result.diversification.sectorsHeld).toBe(0);
    expect(result.diversification.largestPositionPct).toBe(0);
  });

  it('reports 3 sectorsHeld when all three companies are held', () => {
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 1, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 1, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');
    const r3 = buy(r2.wallet, 'voltara-grid', 1, PRICES);
    if (!r3.ok) throw new Error('buy 3 failed');

    const result = buildAISummary(r3.wallet, PRICES, COMPANIES, null);
    expect(result.diversification.sectorsHeld).toBe(3);
  });

  it('omits holdings with unknown company ids (no internal keys leak)', () => {
    const wallet: Wallet = {
      cash: STARTING_CASH,
      holdings: [{ companyId: 'ghost-corp', qty: 1, avgCost: 100 }],
    };
    const result = buildAISummary(wallet, PRICES, COMPANIES, null);

    expect(result.holdings).toHaveLength(0);
  });
});

// ─── summarizeForAI ───────────────────────────────────────────────────────────

describe('summarizeForAI', () => {
  it('returns a valid JSON string', () => {
    const json = summarizeForAI(emptyWallet(), PRICES, COMPANIES, null);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('parsed result always has simulated: true', () => {
    const parsed = JSON.parse(summarizeForAI(emptyWallet(), PRICES, COMPANIES, null));
    expect(parsed.simulated).toBe(true);
  });

  it('the JSON string contains no "undefined" or "NaN" literals', () => {
    const json = summarizeForAI(emptyWallet(), {}, COMPANIES, null);
    expect(json).not.toContain('undefined');
    expect(json).not.toContain('NaN');
  });

  it('is roughly under 600 tokens for a typical 3-holding portfolio', () => {
    const r1 = buy(emptyWallet(5_000), 'nova-loom', 10, PRICES);
    if (!r1.ok) throw new Error('buy 1 failed');
    const r2 = buy(r1.wallet, 'hearth-harbor', 5, PRICES);
    if (!r2.ok) throw new Error('buy 2 failed');
    const r3 = buy(r2.wallet, 'voltara-grid', 8, PRICES);
    if (!r3.ok) throw new Error('buy 3 failed');

    const json = summarizeForAI(r3.wallet, PRICES, COMPANIES, null);
    // 1 token ≈ 4 characters. 600 tokens ≈ 2400 characters. Use a generous 3000-char budget.
    expect(json.length).toBeLessThan(3_000);
  });
});

