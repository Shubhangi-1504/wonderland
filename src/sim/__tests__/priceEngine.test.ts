import { describe, expect, it } from 'vitest';
import { COMPANIES } from '../companies';
import {
  DEFAULT_STEP_MS,
  MIN_PRICE,
  generateHistory,
  initialPrices,
  tickPrices,
} from '../priceEngine';
import { createRng } from '../rng';
import type { PricePoint } from '../../types';

/** Run `steps` ticks from a fixed starting price map and collect every point. */
function runSeries(seed: number, steps: number): PricePoint[] {
  const rng = createRng(seed);
  const points: PricePoint[] = [];
  let prices = initialPrices(COMPANIES);

  for (let i = 0; i < steps; i += 1) {
    const point = tickPrices(prices, COMPANIES, rng, i * 1_000);
    points.push(point);
    prices = point.prices;
  }

  return points;
}

/** Mean absolute percentage move per tick for one company. */
function meanAbsMove(points: PricePoint[], companyId: string): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    if (!previous || !current) continue;
    const before = previous.prices[companyId];
    const after = current.prices[companyId];
    if (!before || after === undefined) continue;
    total += Math.abs(after - before) / before;
  }
  return total / Math.max(1, points.length - 1);
}

describe('initialPrices', () => {
  it('starts every company at its base price', () => {
    const prices = initialPrices(COMPANIES);

    expect(prices['nova-loom']).toBe(120);
    expect(prices['hearth-harbor']).toBe(48);
    expect(prices['voltara-grid']).toBe(76);
  });
});

describe('tickPrices', () => {
  it('is deterministic for the same seed', () => {
    const a = runSeries(99, 40);
    const b = runSeries(99, 40);

    expect(a).toEqual(b);
  });

  it('stamps the passed time and the simulated source', () => {
    const point = tickPrices(initialPrices(COMPANIES), COMPANIES, createRng(1), 1_234);

    expect(point.t).toBe(1_234);
    expect(point.source).toBe('simulated');
  });

  it('never drops a price below the minimum, even over 2,000 ticks', () => {
    const points = runSeries(3, 2_000);

    for (const point of points) {
      for (const company of COMPANIES) {
        const price = point.prices[company.id];
        expect(price).toBeDefined();
        expect(Number.isFinite(price)).toBe(true);
        expect(price).toBeGreaterThanOrEqual(MIN_PRICE);
      }
    }
  });

  it('does not mutate the price map it was given', () => {
    const prices = initialPrices(COMPANIES);
    const snapshot = { ...prices };

    tickPrices(prices, COMPANIES, createRng(4), 0);

    expect(prices).toEqual(snapshot);
  });

  it('moves the high-beta tech stock more than the low-beta consumer stock', () => {
    const points = runSeries(2024, 1_000);

    const techMove = meanAbsMove(points, 'nova-loom');
    const consumerMove = meanAbsMove(points, 'hearth-harbor');

    expect(techMove).toBeGreaterThan(consumerMove);
  });
});

describe('generateHistory', () => {
  it('builds 60 points starting from the initial prices', () => {
    const history = generateHistory(COMPANIES, 7);

    expect(history).toHaveLength(60);
    expect(history[0]?.prices).toEqual(initialPrices(COMPANIES));
    expect(history[0]?.t).toBe(0);
  });

  it('spaces points by the step interval and is deterministic', () => {
    const first = generateHistory(COMPANIES, 11, 10, 1_000, DEFAULT_STEP_MS);
    const second = generateHistory(COMPANIES, 11, 10, 1_000, DEFAULT_STEP_MS);

    expect(first).toEqual(second);
    expect(first.map((point) => point.t)).toEqual([
      1_000, 61_000, 121_000, 181_000, 241_000, 301_000, 361_000, 421_000, 481_000, 541_000,
    ]);
  });

  it('returns a single point when steps is below 1', () => {
    expect(generateHistory(COMPANIES, 1, 0)).toHaveLength(1);
  });
});
