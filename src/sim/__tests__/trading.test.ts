import { describe, expect, it } from 'vitest';
import { buy, sell, STARTING_CASH } from '../trading';
import { computePortfolio } from '../portfolio';
import type { PriceMap, Wallet } from '../../types';

const PRICES: PriceMap = { 'nova-loom': 100, 'hearth-harbor': 50, 'voltara-grid': 25 };

function emptyWallet(cash = STARTING_CASH): Wallet {
  return { cash, holdings: [] };
}

describe('buy', () => {
  it('buys shares at the current price and deducts the cost', () => {
    const result = buy(emptyWallet(), 'nova-loom', 10, PRICES);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.wallet.cash).toBe(9_000);
    expect(result.wallet.holdings).toEqual([
      { companyId: 'nova-loom', qty: 10, avgCost: 100 },
    ]);
  });

  it('averages the cost basis on a second purchase', () => {
    const first = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = buy(first.wallet, 'nova-loom', 10, { 'nova-loom': 120 });

    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.wallet.cash).toBe(7_800);
    expect(second.wallet.holdings).toEqual([
      { companyId: 'nova-loom', qty: 20, avgCost: 110 },
    ]);
  });

  it('rejects a purchase that costs more than the available cash', () => {
    const wallet = emptyWallet(500);
    const result = buy(wallet, 'nova-loom', 10, PRICES);

    expect(result).toEqual({
      ok: false,
      reason: 'Not enough virtual cash for this purchase.',
    });
    expect(wallet).toEqual(emptyWallet(500));
  });

  it('rejects zero, negative, fractional and non-finite quantities', () => {
    for (const qty of [0, -5, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = buy(emptyWallet(), 'nova-loom', qty, PRICES);
      expect(result.ok).toBe(false);
    }
  });

  it('rejects an unknown company', () => {
    const result = buy(emptyWallet(), 'nope', 1, PRICES);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/not available/i);
  });

  it('rejects a company whose price is missing', () => {
    const result = buy(emptyWallet(), 'nova-loom', 1, {});

    expect(result.ok).toBe(false);
  });
});

describe('sell', () => {
  it('sells part of a position and adds the proceeds to cash', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;

    const sold = sell(bought.wallet, 'nova-loom', 4, PRICES);

    expect(sold.ok).toBe(true);
    if (!sold.ok) return;
    expect(sold.wallet.cash).toBe(9_400);
    expect(sold.wallet.holdings).toEqual([
      { companyId: 'nova-loom', qty: 6, avgCost: 100 },
    ]);
  });

  it('removes the holding when the whole position is sold', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 3, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const sold = sell(bought.wallet, 'nova-loom', 3, PRICES);

    expect(sold.ok).toBe(true);
    if (!sold.ok) return;
    expect(sold.wallet.holdings).toEqual([]);
    expect(sold.wallet.cash).toBe(STARTING_CASH);
  });

  it('rejects selling more shares than are held', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 2, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const sold = sell(bought.wallet, 'nova-loom', 3, PRICES);

    expect(sold.ok).toBe(false);
    expect(bought.wallet.cash).toBe(9_800);
  });

  it('rejects selling something that is not held', () => {
    const result = sell(emptyWallet(), 'voltara-grid', 1, PRICES);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/do not own/i);
  });

  it('rejects invalid quantities and unknown companies', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 5, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    expect(sell(bought.wallet, 'nova-loom', 0, PRICES).ok).toBe(false);
    expect(sell(bought.wallet, 'nova-loom', 2.5, PRICES).ok).toBe(false);
    expect(sell(bought.wallet, 'ghost', 1, PRICES).ok).toBe(false);
  });
});

describe('immutability', () => {
  it('leaves the input wallet untouched on buy and sell', () => {
    const bought = buy(emptyWallet(), 'nova-loom', 10, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const wallet = bought.wallet;
    const snapshot: Wallet = {
      cash: wallet.cash,
      holdings: wallet.holdings.map((holding) => ({ ...holding })),
    };

    buy(wallet, 'hearth-harbor', 2, PRICES);
    sell(wallet, 'nova-loom', 1, PRICES);

    expect(wallet).toEqual(snapshot);
  });
});

describe('money conservation', () => {
  it('keeps total portfolio value the same across a buy at the same price', () => {
    const wallet = emptyWallet();
    const before = computePortfolio(wallet, PRICES).totalValue;

    const result = buy(wallet, 'nova-loom', 7, PRICES);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const after = computePortfolio(result.wallet, PRICES).totalValue;
    expect(after).toBeCloseTo(before, 2);
  });

  it('keeps total portfolio value the same across a sell at the same price', () => {
    const bought = buy(emptyWallet(), 'voltara-grid', 9, PRICES);
    if (!bought.ok) throw new Error('setup failed');

    const before = computePortfolio(bought.wallet, PRICES).totalValue;
    const sold = sell(bought.wallet, 'voltara-grid', 4, PRICES);
    if (!sold.ok) throw new Error('sell failed');

    expect(computePortfolio(sold.wallet, PRICES).totalValue).toBeCloseTo(before, 2);
  });
});
